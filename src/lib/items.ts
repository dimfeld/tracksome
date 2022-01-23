import { invalidate } from '$app/navigation';

export interface Item {
  item_id: number;
  trackable_id: number;
  time: string;
  timezone: string;
  note?: string;
  added: string;
  modified: string;
  /** attributes for this item, keyed by trackable_attribute_id */
  attributes: Record<number, ItemAttributeValue>;
}

export interface ItemAttributeValue {
  numeric_value?: number;
  text_value?: string;
  trackable_attribute_category_id?: number;
}

export const todayItemsUrl = '/api/items';

export function newItemSubmit(data: FormData | null, canAddNew: boolean) {
  if (!canAddNew) {
    return false;
  }

  if (data) {
    data.set('time', new Date().toISOString());
  }
}

export function newItemResponse(...invalidateUrls: string[]) {
  invalidate(todayItemsUrl);

  for (let url of invalidateUrls) {
    invalidate(url);
  }
}
