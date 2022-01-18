import { intFromString } from '$lib/form';
import { Item } from '$lib/items';
import partition from 'just-partition';
import { db, partialUpdate, pgp } from './client';
import * as trackableDb from './trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  [
    { name: 'trackable_id', cnd: true, cast: 'bigint' },
    { name: 'time', cast: 'timestamptz' },
    'timezone',
    'note',
    { name: 'added', cnd: true, cast: 'timestamptz' },
    { name: 'modified', cast: 'timestamptz ' },
  ],
  { table: 'items' }
);

const userIdColumn = { name: 'user_id', cnd: true, cast: 'bigint' };
const itemIdColumn = { name: 'item_id', cnd: true, cast: 'bigint' };

const insertColumns = baseColumns.extend([userIdColumn]);
const updateColumns = baseColumns.extend([userIdColumn, itemIdColumn]);
const fetchColumns = baseColumns.extend([itemIdColumn]);

const updateAttributeColumns = new pgp.helpers.ColumnSet(
  [
    { name: 'item_id', cnd: true, cast: 'bigint' },
    { name: 'trackable_attribute_id', cnd: true, cast: 'bigint' },
    { name: 'user_id', cnd: true, cast: 'bigint' },
    { name: 'numeric_value', cast: 'double precision' },
    { name: 'trackable_attribute_category_id', cast: 'bigint' },
    { name: 'text_value' },
  ],
  { table: 'item_attribute_values' }
);

export interface GetItemsOptions {
  userId: number;
  trackableId?: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  timezone: string;
}

function dayMatchClause(param: string, operator = '=') {
  return `(date_trunc('day', time, timezone) ${operator} date_trunc('day', ${param}::timestamptz, $[timezone]))`;
}

export async function getItems(options: GetItemsOptions): Promise<Item[]> {
  let wheres: string[] = ['(user_id=$[userId])'];

  let timezone = options.timezone || 'UTC';

  if (options.trackableId) {
    wheres.push(`trackable_id=$[trackableId]`);
  }

  if (options.startTime) {
    wheres.push(`time >= $[startTime]::timestamptz`);
  } else if (options.startDate) {
    wheres.push(dayMatchClause('$[startDate]', '>='));
  }

  if (options.endTime) {
    wheres.push(`time <= $[endTime]::timestamptz`);
  } else if (options.endDate) {
    wheres.push(dayMatchClause('$[endDate]', '<='));
  }

  return db.query(
    `SELECT ${fetchColumns.names},
        COALESCE(
          jsonb_strip_nulls(jsonb_object_agg(att.trackable_attribute_id,
            jsonb_build_object(
              'numeric_value', att.numeric_value,
              'trackable_attribute_category_id', att.trackable_attribute_category_id,
              'text_value', att.text_value
            )
          ) filter(where att.trackable_attribute_id is not null)),
          '{}'::jsonb
        ) as attributes
    FROM items
    LEFT JOIN item_attribute_values att USING (item_id, user_id)
    WHERE ${wheres.join(' AND ')}
    GROUP BY items.item_id
    `,
    {
      ...options,
      timezone,
    }
  );
}

export async function addItem(userId: number, item: Omit<Item, 'item_id'>): Promise<Item> {
  let insertQuery = pgp.helpers.insert({ ...item, user_id: userId }, insertColumns);
  return db.one(`${insertQuery} RETURNING ${fetchColumns.names}`);
}

export async function addItemIfUnderDailyLimit(
  userId: number,
  item: Omit<Item, 'item_id'>
): Promise<Item | null> {
  let trackable = await trackableDb.getTrackable({ userId, trackableId: item.trackable_id });
  if (!trackable) {
    return null;
  }

  const itemCriteria = `trackable_id=$[trackable_id]
      AND user_id=$[user_id]
      AND ${dayMatchClause('$[time]')}`;

  const query = `
    INSERT INTO items (${insertColumns.names})
      SELECT ${insertColumns.variables}
      FROM trackables
      WHERE user_id=$[user_id] AND trackable_id=$[trackable_id]
        AND (
          multiple_per_day
          OR NOT EXISTS (SELECT 1 FROM items WHERE ${itemCriteria})
        )
    RETURNING ${fetchColumns.names}
  `;

  let inputItem = { ...item, user_id: userId };
  let result = await db.oneOrNone(query, inputItem);
  if (result) {
    return result;
  } else {
    return db.one(`SELECT ${fetchColumns.names} FROM items WHERE ${itemCriteria}`, inputItem);
  }
}

export async function updateItem(
  userId: number,
  itemId: number,
  item: Partial<Item>
): Promise<Item | null> {
  let { attributes, ...itemInput } = item;

  let update = partialUpdate({
    columns: updateColumns,
    whereColumns: ['user_id', 'item_id'],
    data: itemInput,
    updateModified: true,
  });

  let attributeItems = Object.entries(attributes || {}).map(([id, value]) => {
    return {
      trackable_attribute_id: id,
      item_id: itemId,
      user_id: userId,
      numeric_value: intFromString(value.numeric_value),
      text_value: value.text_value?.length ? value.text_value : null,
      trackable_attribute_category_id: intFromString(value.trackable_attribute_category_id),
    };
  });

  const [withValue, withoutValue] = partition(
    attributeItems,
    (item) =>
      typeof item.numeric_value === 'number' ||
      Boolean(item.text_value) ||
      typeof item.trackable_attribute_category_id === 'number'
  );

  if (!update && !attributeItems.length) {
    return null;
  }

  let attributeInsert = withValue.length
    ? pgp.helpers.insert(withValue, updateAttributeColumns) +
      `ON CONFLICT (item_id, trackable_attribute_id) DO UPDATE SET
      numeric_value=EXCLUDED.numeric_value,
      text_value=EXCLUDED.text_value,
      trackable_attribute_category_id=EXCLUDED.trackable_attribute_category_id`
    : '';

  let result = await db.tx(async (tx) => {
    if (attributeInsert) {
      await tx.query(attributeInsert);
    }

    if (withoutValue.length) {
      await tx.query(
        `DELETE FROM ${updateAttributeColumns.table.name}
        WHERE user_id=$[user_id] AND item_id=$[item_id] AND trackable_attribute_id = ANY($[ids])`,
        {
          user_id: userId,
          item_id: itemId,
          ids: withoutValue.map((v) => +v.trackable_attribute_id),
        }
      );
    }

    if (update) {
      return tx.oneOrNone(`${update} RETURNING ${fetchColumns.names}`, {
        ...itemInput,
        user_id: userId,
        item_id: itemId,
      });
    } else {
      return null;
    }
  });

  return result;
}
