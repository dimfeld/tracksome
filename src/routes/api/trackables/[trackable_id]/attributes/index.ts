import * as trackableAttributesDb from '$lib/db/trackable_attribute';
import { parseBody } from '$lib/form';
import { RequestHandler } from '@sveltejs/kit';
import { TrackableAttribute, readTrackableAttributeInput } from '$lib/trackable';

export const get: RequestHandler = async ({ params, locals }) => {
  let attributes = await trackableAttributesDb.getTrackableAttributes({
    userId: locals.userId,
    trackableId: +params.trackable_id,
  });

  return {
    body: attributes,
  };
};

export const post: RequestHandler = async ({ request, params, locals }) => {
  let body = await parseBody<TrackableAttribute>(request, locals);
  if (!body) {
    return { status: 400 };
  }

  let input = readTrackableAttributeInput(body);

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
