import { invalidate } from '$app/navigation';

export interface Item {
  item_id: number;
  trackable_id: number;
  time: string;
  timezone: string;
  note?: string;
  added: string;
  modified: string;
}

export const todayItemsUrl = '/api/items?startDate=today&endDate=today';

export function newItemSubmit(data: FormData | null, canAddNew: boolean) {
  if (!canAddNew) {
    return false;
  }

  if (data) {
    data.set('time', new Date().toISOString());
  }
}

export function newItemResponse(res: Response, ...invalidateUrls: string[]) {
  if (res.ok) {
    invalidate(todayItemsUrl);

    for (let url of invalidateUrls) {
      invalidate(url);
    }
  }
}
