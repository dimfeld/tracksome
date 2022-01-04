import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';

export const handle: Handle = async function ({ request, resolve }) {
  request.locals.cookies = cookie.parse(request.headers.cookie || '');
  request.locals.userId = await session.read(request.locals.cookies.sid);

  return resolve(request);
};
