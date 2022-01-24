import * as trackableAttributesDb from '$lib/db/trackable_attribute';
import { RequestHandler } from '$lib/endpoints';
import { parseBody } from '$lib/form';
import { TrackableAttribute, readTrackableAttributeInput } from '$lib/trackable';

export const get: RequestHandler = async ({ locals, params }) => {
  const attribute = await trackableAttributesDb.getTrackableAttributes({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    trackableAttributeId: +params.trackable_attribute_id,
  });

  if (!attribute[0]) {
    return {
      fallthrough: true,
    };
  }

  return {
    body: attribute[0],
  };
};

export const patch: RequestHandler = async ({ locals, params, request }) => {
  const body = await parseBody<Partial<TrackableAttribute>>(request, locals);
  if (!body) {
    return { status: 400 };
  }

  const input = readTrackableAttributeInput(body);

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

export const del: RequestHandler = async ({ locals, params }) => {
  await trackableAttributesDb.deleteTrackableAttribute({
    userId: locals.userId,
    trackableId: +params.trackable_id,
    trackableAttributeId: +params.trackable_attribute_id,
  });

  return {
    body: true,
  };
};
