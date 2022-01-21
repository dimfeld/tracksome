import { updateSorts } from '$lib/db/trackable';
import { RequestHandler } from '$lib/endpoints';
import { parseBody } from '$lib/form';
import sorter from 'sorters';

export const post: RequestHandler<unknown> = async ({ request, params, locals }) => {
  let input = await parseBody<{ trackable: Record<number, number> }>(request, locals);
  if (!input) {
    return { status: 400 };
  }

  let items = Object.entries(input.trackable)
    .map(([id, sort]) => ({ id: +id, sort: +sort }))
    .sort(sorter((i) => i.sort));

  let movingId = +params.trackable_id;
  let movingIndex = items.findIndex((i) => i.id === movingId);

  if (movingIndex >= 0 && movingIndex < items.length - 1) {
    [items[movingIndex + 1], items[movingIndex]] = [items[movingIndex], items[movingIndex + 1]];
    let newSorts = items.map((value, i) => ({ trackable_id: value.id, sort: i }));
    await updateSorts(locals.userId, newSorts);
  }

  return {
    status: 200,
  };
};
