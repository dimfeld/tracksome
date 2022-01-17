import { db, partialUpdate, pgp } from '$lib/db/client';
import { Trackable, TrackableAttribute } from '$lib/trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  [
    'name',
    { name: 'enabled', def: true },
    { name: 'sort', cast: 'int' },
    { name: 'required', def: false, cast: 'boolean' },
    'attribute_type',
    { name: 'constraints', cast: 'jsonb' },
  ],
  { table: 'trackable_attributes' }
);

const userIdColumn = { name: 'user_id', cnd: true, cast: 'bigint' };
const trackableIdColumn = { name: 'trackable_id', cnd: true, cast: 'bigint' };
const trackableAttributeIdColumn = { name: 'trackable_attribute_id', cnd: true, cast: 'bigint' };

const fetchColumns = baseColumns.extend([trackableIdColumn, trackableAttributeIdColumn]);
const insertColumns = baseColumns.extend([trackableIdColumn, userIdColumn]);
const updateColumns = fetchColumns.extend([userIdColumn]);

export function getTrackableAttributes(options: {
  userId: number;
  trackableId: number;
  trackableAttributeId?: number;
}): Promise<TrackableAttribute[]> {
  let wheres = ['user_id=$[user_id]', 'trackable_id=$[trackable_id]'];

  if (typeof options.trackableAttributeId == 'number') {
    wheres.push('trackable_attribute_id=$[trackable_attribute_id]');
  }

  return db.query(
    `SELECT ${fetchColumns.names} FROM trackable_attributes WHERE ${wheres.join(' AND ')}`,
    {
      user_id: options.userId,
      trackable_id: options.trackableId,
      trackable_attribute_id: options.trackableAttributeId,
    }
  );
}

export function addTrackableAttribute(options: {
  userId: number;
  trackableId: number;
  attribute: Omit<TrackableAttribute, 'user_id' | 'trackable_id' | 'trackable_attribute_id'>;
}): Promise<TrackableAttribute> {
  let query =
    pgp.helpers.insert(
      { ...options.attribute, user_id: options.userId, trackable_id: options.trackableId },
      insertColumns
    ) + ` RETURNING ${fetchColumns.names}`;
  return db.one(query);
}

export function partialUpdateTrackable(options: {
  userId: number;
  trackableId: number;
  trackableAttributeId: number;
  attribute: Partial<TrackableAttribute>;
}) {
  let query = partialUpdate({
    columns: updateColumns,
    whereColumns: ['user_id', 'trackable_id', 'trackable_attribute_id'],
    data: options.attribute,
    updateModified: false,
  });

  if (!query) {
    return Promise.resolve(null);
  }

  return db.oneOrNone(`${query} RETURNING ${fetchColumns.names}`, {
    ...options.attribute,
    user_id: options.userId,
    trackable_id: options.trackableId,
    trackable_attribute_id: options.trackableAttributeId,
  });
}

export function deleteTrackableAttribute(options: {
  userId: number;
  trackableId: number;
  trackableAttributeId: number;
}) {
  return db.none(
    `UPDATE trackable_attributes SET enabled=false WHERE user_id=$[userId] AND trackable_id=$[trackableId] AND trackable_attribute_id=$[trackableAttributeId]`,
    options
  );
}
