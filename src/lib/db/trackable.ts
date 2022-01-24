import { db, partialUpdate, pgp } from '$lib/db/client';
import { WithStrings } from '$lib/form';
import { Trackable } from '$lib/trackable';

const table = { table: 'trackables' };
const sortColumn = { name: 'sort', cast: 'int' };
const userIdColumn = { name: 'user_id', cnd: true, cast: 'bigint' };
const trackableIdColumn = { name: 'trackable_id', cnd: true, cast: 'bigint' };
const baseColumns = new pgp.helpers.ColumnSet(
  [
    'name',
    { name: 'enabled', def: true },
    { name: 'multiple_per_day', cast: 'boolean' },
    sortColumn,
    'color',
  ],
  table
);

const reorderColumns = new pgp.helpers.ColumnSet([trackableIdColumn, sortColumn], table);
const fetchColumns = baseColumns.extend([trackableIdColumn]);
const insertColumns = baseColumns.extend([userIdColumn]);
const updateColumns = fetchColumns.extend([userIdColumn]);

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
    pgp.helpers.insert({ ...item, user_id: userId, enabled: true }, insertColumns) +
    ` RETURNING ${fetchColumns.names}`;
  return db.one(insertQuery);
}

export function partialUpdateTrackable(
  userId: number,
  trackableId: number,
  trackable: Partial<WithStrings<Trackable>>
): Promise<Trackable | null> {
  let query = partialUpdate({
    columns: updateColumns,
    whereColumns: ['user_id', 'trackable_id'],
    data: trackable,
    updateModified: true,
  });

  if (!query) {
    return Promise.resolve(null);
  }

  return db.oneOrNone(`${query} RETURNING ${fetchColumns.names}`, {
    ...trackable,
    user_id: userId,
    trackable_id: trackableId,
  });
}

export async function updateSorts(
  userId: number,
  newSorts: { trackable_id: number; sort: number }[]
) {
  let updateQuery = pgp.helpers.update(newSorts, reorderColumns, 'trackables', {
    tableAlias: 't',
    valueAlias: 'v',
  });

  return db.query(`${updateQuery} WHERE t.trackable_id=v.trackable_id AND t.user_id=$[userId]`, {
    userId,
  });
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
