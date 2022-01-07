import { RequestHandler } from '@sveltejs/kit';
import * as userDb from '$lib/db/user';

export const get: RequestHandler = async function ({ locals }) {
  let user = await userDb.get(locals.userId);
  if (!user) {
    return {
      status: 401,
      body: null,
    };
  }

  return {
    body: user as any,
  };
};
