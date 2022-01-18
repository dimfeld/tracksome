import { db, partialUpdate, pgp } from '$lib/db/client';
import { WithStrings } from '$lib/form';
import { Trackable, TrackableAttribute, TrackableAttributeCategory } from '$lib/trackable';

const baseColumns = new pgp.helpers.ColumnSet(
  [
    { name: 'trackable_attribute_id', cast: 'bigint', cnd: true },
    { name: 'name' },
    { name: 'color' },
    { name: 'sort', cast: 'integer' },
    { name: 'enabled', def: true, cast: 'boolean' },
  ],
  { table: 'trackable_attribute_categories' }
);

const insertColumns = baseColumns.extend([{ name: 'user_id', cast: 'bigint', cnd: true }]);

const fetchColumns = baseColumns.extend([{ name: 'trackable_attribute_category_id', cnd: true }]);

export function addAttributeCategory(options: {
  userId: number;
  attributeId: number;
  category: WithStrings<
    Omit<
      TrackableAttributeCategory,
      'trackable_attribute_category_id' | 'trackable_attribute_id' | 'user_id'
    >
  >;
}): Promise<TrackableAttributeCategory> {
  let query = pgp.helpers.insert(
    {
      ...options.category,
      user_id: options.userId,
      trackable_attribute_id: options.attributeId,
    },
    insertColumns
  );

  return db.one(query + ` RETURNING ${fetchColumns.names}`);
}

export function updateAttributeCategory(options: {
  userId: number;
  attributeId: number;
  categoryId: number;
  category: WithStrings<Partial<TrackableAttributeCategory>>;
}) {
  let query = partialUpdate({
    columns: insertColumns,
    data: options.category,
    whereColumns: ['user_id', 'trackable_attribute_id', 'trackable_attribute_category_id'],
    updateModified: false,
  });

  if (!query) {
    return Promise.resolve(null);
  }

  return db.oneOrNone(`${query} RETURNING ${fetchColumns.names}`, {
    ...options.category,
    user_id: options.userId,
    trackable_attribute_id: options.attributeId,
    trackable_attribute_category_id: options.categoryId,
  });
}

export function deleteAttributeCategory(options: {
  userId: number;
  attributeId: number;
  categoryId: number;
}) {
  return db.none(
    `UPDATE trackable_attribute_categories SET enabled = false
    WHERE user_id=$[userId] AND trackable_attribute_id=$[attributeId] AND trackable_attribute_category_id=$[categoryId]`,
    options
  );
}
