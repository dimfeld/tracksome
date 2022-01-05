import { db, pgp } from '$lib/db/client';
import { Trackable } from '$lib/trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  ['name', { name: 'enabled', def: true }, 'multiple_per_day', 'sort', 'color'],
  { table: 'trackables' }
);

const fetchColumns = baseColumns.extend(['?trackable_id']);
const updateColumns = fetchColumns.extend(['?user_id']);

export async function getAll(userId: number): Promise<Trackable[]> {
  return db.query(
    `SELECT ${fetchColumns.names} FROM trackables WHERE user_id=$[userId] AND enabled`,
    { userId }
  );
}

export function getTrackable(options: {
  userId: number;
  trackableId: number;
}): Promise<Trackable | null> {
  return db.oneOrNone(
    `SELECT ${fetchColumns.names} FROM trackables WHERE user_id=$[userId] AND trackable_id=$[trackableId]`,
    options
  );
}

export function addTrackable(
  userId: number,
  item: Omit<Trackable, 'trackable_id'>
): Promise<Trackable> {
  let insertQuery =
    pgp.helpers.insert({ user_id: userId, ...item }, updateColumns) +
    ` RETURNING ${fetchColumns.names}`;
  return db.one(insertQuery);
}

export function updateTrackable(userId: number, item: Trackable): Promise<Trackable | null> {
  let updateQuery =
    pgp.helpers.update(item, updateColumns) +
    `WHERE user_id=$[userId] AND trackable_id=$[trackableId] RETURNING ${fetchColumns.names}`;
  return db.oneOrNone(updateQuery, { userId, trackableId: item.trackable_id });
}

export function deleteTrackable(options: { userId: number; trackableId: number }) {
  return db.none(
    `UPDATE trackables SET enabled=false WHERE user_id=$[userId] AND trackable_id=$[trackableId]`,
    options
  );
}
