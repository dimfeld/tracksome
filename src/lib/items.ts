export interface Item {
  item_id: number;
  trackable_id: number;
  date: string;
  note?: string;
  added: string;
  modified: string;
}

export const todayItemsUrl = '/api/items?startDate=today&endDate=today';
