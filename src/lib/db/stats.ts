import { db } from './client';

export interface GetStatsOptions {
  userId: number;
  trackableId?: number[];
  attributeId?: number[];
  granularity: 'day' | 'month';
}

export interface Stat {
  type: 'item' | 'attribute';
  count: number;
  sum: number;
}

export async function getStats({ userId, trackableId, attributeId, granularity }: GetStatsOptions) {
  const granularityGroup = `date_trunc($[granularity], items.time, items.timezone)`;

  // TODO Handle categorical values
  const attributeQuery = `SELECT trackable_attribute_id as id,
        'attribute' AS type,
        COUNT(*) AS count,
        SUM(numeric_value) AS sum,
        ${granularityGroup} AS time
        FROM item_attribute_values
        JOIN items USING (item_id, user_id)
        WHERE user_id=$[userId]
          AND trackable_attribute_id = ANY($[attributeId])
        GROUP BY trackable_attribute_id, ${granularityGroup}
      `;

  const itemQuery = `SELECT trackable_id AS id,
        'item' AS type,
        COUNT(*) AS count,
        0 AS sum,
        ${granularityGroup} AS time
        FROM items
        WHERE user_id=$[userId]
          AND trackable_id = ANY($[trackableId])
        GROUP BY trackable_id, ${granularityGroup}`;

  let query = [
    trackableId?.length ? itemQuery : null,
    attributeId?.length ? attributeQuery : null,
  ].join('\nUNION ALL\n');

  if (!query) {
    return [];
  }

  return db.query(query, {
    userId,
    trackableId,
    attributeId,
    granularity,
  });
}
