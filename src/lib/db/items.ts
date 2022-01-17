import { Item } from '$lib/items';
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

  // TODO Actually get attribute values
  return db.query(
    `SELECT ${fetchColumns.names},
        COALESCE(
          jsonb_object_agg(att.item_attribute_value_id,
            coalesce(to_jsonb(att.numeric_value),
                  to_jsonb(att.trackable_attribute_category_id),
                  to_jsonb(att.text_value))
          ) filter(where att.item_attribute_value_id is not null),
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

  if (!update) {
    return null;
  }

  // let attributeItems = Object.entries(attributes || {}).map(([id, value]) => {
  //   // TODO Need to look up the type of this attribute.
  //   return {
  //     trackable_attribute_id: id,
  //     item_id: itemId,
  //     user_id: userId,
  //     numeric_value: typeof value === 'number' ? value : null,
  //     text_value: typeof value === 'string' ? value : null,
  //     trackable_attribute_category_id: null,
  //   };
  // });

  // let attributeInsert =
  //   pgp.helpers.insert(attributeItems, { table: 'item_attribute_values' }) +
  //   `ON CONFLICT (trackable_attribute_id) DO UPDATE set
  //   numeric_value=EXCLUDED.numeric_value,
  //   text_value=EXCLUDED.text_value,
  //   trackable_attribute_category_id=EXCLUDED.trackable_attribute_category_id`;

  let result = await db.tx(async (tx) => {
    // await tx.query(attributeInsert);

    return tx.oneOrNone(`${update} RETURNING ${fetchColumns.names}`, {
      ...itemInput,
      user_id: userId,
      item_id: itemId,
    });
  });

  return result;
}
