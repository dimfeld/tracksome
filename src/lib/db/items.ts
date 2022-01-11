import { Item } from '$lib/items';
import { db, partialUpdate, pgp } from './client';
import * as trackableDb from './trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  [
    '?trackable_id',
    { name: 'time', cast: 'timestamptz' },
    'timezone',
    'note',
    '?added',
    'modified',
  ],
  { table: 'items' }
);

const insertColumns = baseColumns.extend(['?user_id']);
const updateColumns = baseColumns.extend(['?user_id', '?item_id']);
const fetchColumns = baseColumns.extend(['?item_id']);

export interface GetItemsOptions {
  userId: number;
  trackableId?: number;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
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

  return db.query(`SELECT ${fetchColumns.names} FROM items WHERE ${wheres.join(' AND ')}`, {
    ...options,
    timezone,
  });
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
  let update = partialUpdate({
    columns: updateColumns,
    whereColumns: ['user_id', 'item_id'],
    data: item,
    updateModified: true,
  });

  if (!update) {
    return null;
  }

  return db.oneOrNone(`${update} RETURNING ${fetchColumns.names}`, {
    ...item,
    user_id: userId,
    item_id: itemId,
  });
}
