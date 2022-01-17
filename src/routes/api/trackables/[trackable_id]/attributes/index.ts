import * as trackableAttributesDb from '$lib/db/trackable_attribute';
import { RequestHandler } from '$lib/endpoints';
import { formDataToJson } from '$lib/form';
import { TrackableAttribute, readTrackableAttributeInput } from '$lib/trackable';

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
  let input = readTrackableAttributeInput(formDataToJson<TrackableAttribute>(body));

  let attribute = await trackableAttributesDb.addTrackableAttribute({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    attribute: {
      ...(input as TrackableAttribute),
      enabled: true,
    },
  });

  return { body: attribute };
};
