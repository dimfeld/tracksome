import { addAttributeCategory } from '$lib/db/trackable_attribute_category';
import { RequestHandler } from '$lib/endpoints';
import { parseBody } from '$lib/form';
import { TrackableAttributeCategory } from '$lib/trackable';

export const post: RequestHandler<TrackableAttributeCategory> = async ({
  locals,
  params,
  request,
}) => {
  let body = await parseBody<TrackableAttributeCategory>(request, locals);
  if (!body) {
    return { status: 400 };
  }

  let result = await addAttributeCategory({
    attributeId: +params.trackable_attribute_id,
    userId: locals.userId,
    category: body,
  });

  return {
    body: result,
  };
};
