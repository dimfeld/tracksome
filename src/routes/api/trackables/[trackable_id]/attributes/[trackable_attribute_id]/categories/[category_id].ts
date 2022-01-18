import {
  deleteAttributeCategory,
  updateAttributeCategory,
} from '$lib/db/trackable_attribute_category';
import { RequestHandler } from '$lib/endpoints';
import { formDataToJson } from '$lib/form';
import { TrackableAttributeCategory } from '$lib/trackable';

export const patch: RequestHandler<
  Partial<TrackableAttributeCategory>,
  TrackableAttributeCategory
> = async ({ locals, params, body }) => {
  let input = formDataToJson<Partial<TrackableAttributeCategory>>(body);
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

export const del: RequestHandler<unknown, {}> = async ({ locals, params }) => {
  await deleteAttributeCategory({
    userId: locals.userId,
    attributeId: +params.trackable_attribute_id,
    categoryId: +params.category_id,
  });

  return {
    body: {},
  };
};
