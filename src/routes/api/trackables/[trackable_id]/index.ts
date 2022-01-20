import { checkboxToBoolean, parseBody } from '$lib/form';
import { RequestHandler } from '$lib/endpoints';
import {
  getTrackable,
  updateTrackable,
  deleteTrackable,
  partialUpdateTrackable,
} from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';

export const get: RequestHandler<Trackable> = async ({ locals, params }) => {
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

export const put: RequestHandler<Trackable> = async ({ locals, request, params }) => {
  let data = await parseBody<Trackable>(request);
  if (!data) {
    return { status: 400 };
  }

  let result = await updateTrackable(locals.userId, {
    ...(data as Trackable),
    trackable_id: +params.trackable_id,
    multiple_per_day: Boolean(checkboxToBoolean(data.multiple_per_day)),
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

export const patch: RequestHandler<Trackable | null> = async ({ locals, request, params }) => {
  let data = await parseBody<Partial<Trackable>>(request);
  if (!data) {
    return { status: 400 };
  }

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

export const del: RequestHandler<object> = async ({ locals, params }) => {
  await deleteTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  return {
    body: {},
  };
};
