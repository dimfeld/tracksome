import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';
import { GetSession, ServerRequest } from '@sveltejs/kit/types/hooks';
import { randomColor } from '$lib/colors';
import { TracksomeLocals } from '$lib/endpoints';
import { Theme } from '$lib/styles';

function requireAuthed(request: ServerRequest) {
  let path = request.url.pathname;
  return request.method !== 'GET' || (path.startsWith('/api') && !path.startsWith('/api/user'));
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

export const handle: Handle<TracksomeLocals<false>> = async function ({ request, resolve }) {
  let cookies = cookie.parse(request.headers.cookie || '');
  request.locals.userId = await session.read(cookies.sid);
  request.locals.theme = cookies.theme as Theme;
  request.locals.defaultDarkMode = cookies.defaultDarkMode === 'true';
  request.locals.timezone = cookies.timezone || 'UTC';

  let methodOverride = request.url.searchParams.get('_method');
  request.url.searchParams.delete('_method');

  if (methodOverride && request.method !== 'GET' && request.method !== 'HEAD') {
    request.method = methodOverride;
  }

  if (requireAuthed(request) && !request.locals.userId) {
    console.log(request.url);
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

export const getSession: GetSession<TracksomeLocals> = (request) => {
  return {
    theme: request.locals.theme,
    defaultDarkMode: request.locals.defaultDarkMode,
    randomColor: randomColor(),
  };
};
