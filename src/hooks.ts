import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';
import { GetSession, ServerRequest } from '@sveltejs/kit/types/hooks';
import { randomColor } from '$lib/colors';

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
  request.locals.theme = request.locals.cookies.theme;
  request.locals.defaultDarkMode = request.locals.cookies.defaultDarkMode === 'true';

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

export const getSession: GetSession = (request) => {
  return {
    theme: request.locals.theme,
    defaultDarkMode: request.locals.defaultDarkMode,
    randomColor: randomColor(),
  };
};
