import { RequestHandler } from '$lib/endpoints';
import { getTrackable, updateTrackable, deleteTrackable } from '$lib/db/trackable';
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

export const del: RequestHandler<unknown, object> = async ({ locals, params }) => {
  await deleteTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  return {
    body: {},
  };
};
