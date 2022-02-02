import { reorder } from '$lib/db/reorder';
import { updateSorts } from '$lib/db/trackable';
import { RequestHandler } from '@sveltejs/kit';
import { parseBody } from '$lib/form';

export const post: RequestHandler = async ({ request, params, locals }) => {
  let input = await parseBody<{ trackable: Record<number, number> }>(request, locals);
  if (!input) {
    return { status: 400 };
  }

  let newSorts = reorder(input.trackable, +params.trackable_id, 1);
  if (newSorts) {
    await updateSorts(locals.userId, newSorts);
  }

  return {
    status: 200,
  };
};
