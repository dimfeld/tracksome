import {
  deleteAttributeCategory,
  updateAttributeCategory,
} from '$lib/db/trackable_attribute_category';
import { RequestHandler } from '$lib/endpoints';
import { parseBody } from '$lib/form';
import { TrackableAttributeCategory } from '$lib/trackable';

export const patch: RequestHandler<TrackableAttributeCategory> = async ({
  locals,
  params,
  request,
}) => {
  let input = await parseBody<Partial<TrackableAttributeCategory>>(request);
  if (!input) {
    return { status: 400 };
  }

  let result = await updateAttributeCategory({
    categoryId: +params.category_id,
    attributeId: +params.trackable_attribute_id,
    userId: locals.userId,
    category: input,
  });

  return {
    body: result,
  };
};

export const del: RequestHandler<{}> = async ({ locals, params }) => {
  await deleteAttributeCategory({
    userId: locals.userId,
    attributeId: +params.trackable_attribute_id,
    categoryId: +params.category_id,
  });

  return {
    body: {},
  };
};
