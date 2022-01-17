import * as trackableAttributesDb from '$lib/db/trackable_attribute';
import { RequestHandler } from '$lib/endpoints';
import { formDataToJson } from '$lib/form';
import { TrackableAttribute } from '$lib/trackable';

export const get: RequestHandler<unknown, TrackableAttribute[]> = async ({ params, locals }) => {
  let attributes = await trackableAttributesDb.getTrackableAttributes({
    userId: locals.userId,
    trackableId: +params.trackable_id,
  });

  return {
    body: attributes,
  };
};

export const post: RequestHandler<TrackableAttribute, TrackableAttribute> = async ({
  body,
  params,
  locals,
}) => {
  let input = formDataToJson<TrackableAttribute>(body);
  let attribute = await trackableAttributesDb.addTrackableAttribute({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    attribute: {
      ...input,
      enabled: true,
    },
  });

  return { body: attribute };
};
