import { Item } from '$lib/items';
import { db, pgp } from './client';

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
  startDate?: Date;
  endDate?: Date;
}

export async function getItems(options: GetItemsOptions): Promise<Item[]> {
  let wheres: string[] = ['(user_id=$[userId])'];

  if (options.trackableId) {
    wheres.push(`trackable_id=$[trackableId]`);
  }

  if (options.startDate) {
    wheres.push(`date >= $[startDate]`);
  }

  if (options.endDate) {
    wheres.push(`date <= $[endDate]`);
  }

  let usedOptions = {
    ...options,
    startDate: options.startDate?.toISOString(),
    endDate: options.endDate?.toISOString(),
  };

  return db.query(
    `SELECT ${fetchColumns.names} FROM items WHERE ${wheres.join(' AND ')}`,
    usedOptions
  );
}

export async function addItem(userId: number, item: Omit<Item, 'item_id'>): Promise<Item> {
  let insert = pgp.helpers.insert({ ...item, user_id: userId }, insertColumns);

  return db.one(`${insert} RETURNING ${fetchColumns.names}`);
}
