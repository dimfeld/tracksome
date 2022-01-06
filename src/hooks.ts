import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';
import { ServerRequest } from '@sveltejs/kit/types/hooks';

function requireAuthed(request: ServerRequest) {
  return request.url.pathname !== '/user' || request.method !== 'GET';
}

/** Return true if this request doesn't present CSRF concerns. False if it appears to be
 * a CSRF or is from an old browser (IE11) that doesn't send the proper headers. */
function csrfCheck(request: ServerRequest): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true;
  }

  let origin = request.headers.origin || request.headers.referer;
  if (!origin || origin === 'null') {
    return false;
  }

  let originUrl = new URL(origin);
  return originUrl.origin === request.url.origin;
}

export const handle: Handle = async function ({ request, resolve }) {
  request.locals.cookies = cookie.parse(request.headers.cookie || '');
  request.locals.userId = await session.read(request.locals.cookies.sid);

  if (requireAuthed(request) && !request.locals.userId) {
    return {
      status: 403,
      body: 'Not logged in',
      headers: {},
    };
  }

  if (!csrfCheck(request)) {
    return {
      status: 401,
      body: 'CSRF failure',
      headers: {},
    };
  }

  return resolve(request);
};
