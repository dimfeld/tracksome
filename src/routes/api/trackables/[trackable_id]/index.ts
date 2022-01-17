import { checkboxToBoolean } from '$lib/form';
import { RequestHandler } from '$lib/endpoints';
import {
  getTrackable,
  updateTrackable,
  deleteTrackable,
  partialUpdateTrackable,
} from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';
import { formDataToJson } from '$lib/form';

export const get: RequestHandler<unknown, Trackable> = async ({ locals, params }) => {
  let result = await getTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  if (result) {
    return {
      body: result,
    };
  } else {
    return {
      status: 404,
    };
  }
};

export const put: RequestHandler<Trackable, Trackable> = async ({ locals, body, params }) => {
  let data = formDataToJson<Trackable>(body);
  let result = await updateTrackable(locals.userId, {
    ...(data as Trackable),
    trackable_id: +params.trackable_id,
    multiple_per_day: checkboxToBoolean(data.multiple_per_day),
  });

  if (result) {
    return {
      body: result,
    };
  } else {
    return {
      status: 404,
    };
  }
};

export const patch: RequestHandler<Partial<Trackable>, Trackable | null> = async ({
  locals,
  body,
  params,
}) => {
  let data = formDataToJson<Partial<Trackable>>(body);
  let result = await partialUpdateTrackable(locals.userId, +params.trackable_id, data);

  if (result) {
    return {
      body: result,
    };
  } else {
    return {
      status: 404,
    };
  }
};

export const del: RequestHandler<unknown, object> = async ({ locals, params }) => {
  await deleteTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  return {
    body: {},
  };
};
