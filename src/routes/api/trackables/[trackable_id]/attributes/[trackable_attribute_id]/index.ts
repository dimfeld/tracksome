import * as trackableAttributesDb from '$lib/db/trackable_attribute';
import { RequestHandler } from '$lib/endpoints';
import { formDataToJson, intFromString } from '$lib/form';
import { TrackableAttribute, readTrackableAttributeInput } from '$lib/trackable';

export const get: RequestHandler<unknown, TrackableAttribute> = async ({ locals, params }) => {
  const attribute = await trackableAttributesDb.getTrackableAttributes({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    trackableAttributeId: +params.trackable_attribute_id,
  });

  if (!attribute[0]) {
    return {
      status: 404,
    };
  }

  return {
    body: attribute[0],
  };
};

export const patch: RequestHandler<Partial<TrackableAttribute>, TrackableAttribute> = async ({
  locals,
  params,
  body,
}) => {
  const input = readTrackableAttributeInput(formDataToJson<Partial<TrackableAttribute>>(body));

  const output = await trackableAttributesDb.partialUpdateTrackable({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    trackableAttributeId: +params.trackable_attribute_id,
    attribute: input,
  });

  return {
    body: output,
  };
};

export const del: RequestHandler<unknown, unknown> = async ({ locals, params }) => {
  await trackableAttributesDb.deleteTrackableAttribute({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    trackableAttributeId: +params.trackable_attribute_id,
  });

  return {
    body: true,
  };
};
