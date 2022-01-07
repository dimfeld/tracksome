import { Item } from '$lib/items';
import { ITask } from 'pg-promise';
import { db, pgp } from './client';
import * as trackableDb from './trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  ['?trackable_id', { name: 'date', cast: 'date' }, 'note', '?added', 'modified'],
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
}

export async function getItems(options: GetItemsOptions): Promise<Item[]> {
  let wheres: string[] = ['(user_id=$[userId])'];

  if (options.trackableId) {
    wheres.push(`trackable_id=$[trackableId]`);
  }

  if (options.startDate) {
    wheres.push(`date >= $[startDate]::date`);
  }

  if (options.endDate) {
    wheres.push(`date <= $[endDate]::date`);
  }

  return db.query(`SELECT ${fetchColumns.names} FROM items WHERE ${wheres.join(' AND ')}`, options);
}

export async function addItem(userId: number, item: Omit<Item, 'item_id'>): Promise<Item> {
  let insertQuery = pgp.helpers.insert({ ...item, user_id: userId }, insertColumns);
  return db.one(`${insertQuery} RETURNING ${fetchColumns.names}`);
}

export async function addItemIfUnderDailyLimit(
  userId: number,
  item: Omit<Item, 'item_id'>
): Promise<Item> {
  let trackable = await trackableDb.getTrackable({ userId, trackableId: item.trackable_id });
  if (!trackable) {
    return null;
  }

  const itemCriteria = `trackable_id=$[trackable_id]
      AND user_id=$[user_id]
      AND date=$[date]::date`;

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

  console.log(query);

  let inputItem = { ...item, user_id: userId };
  let result = await db.oneOrNone(query, inputItem);
  if (result) {
    return result;
  } else {
    return db.one(`SELECT ${fetchColumns.names} FROM items WHERE ${itemCriteria}`, inputItem);
  }
}
