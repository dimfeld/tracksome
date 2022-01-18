import { addAttributeCategory } from '$lib/db/trackable_attribute_category';
import { RequestHandler } from '$lib/endpoints';
import { formDataToJson } from '$lib/form';
import { TrackableAttributeCategory } from '$lib/trackable';

export const post: RequestHandler<TrackableAttributeCategory, TrackableAttributeCategory> = async ({
  locals,
  params,
  body,
}) => {
  let input = formDataToJson<TrackableAttributeCategory>(body);

  let result = await addAttributeCategory({
    attributeId: +params.trackable_attribute_id,
    userId: locals.userId,
    category: input,
  });

  return {
    body: result,
  };
};
