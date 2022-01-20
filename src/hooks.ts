import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';
import { GetSession, RequestEvent } from '@sveltejs/kit/types/hooks';
import { randomColor } from '$lib/colors';
import { TracksomeLocals } from '$lib/endpoints';
import { Theme } from '$lib/styles';

function requireAuthed(event: RequestEvent) {
  let path = event.url.pathname;
  return (
    event.request.method !== 'GET' || (path.startsWith('/api') && !path.startsWith('/api/user'))
  );
}

/** Return true if this request doesn't present CSRF concerns. False if it appears to be
 * a CSRF or is from an old browser (IE11) that doesn't send the proper headers. */
function csrfCheck({ request, url }: RequestEvent): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true;
  }

  let origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin || origin === 'null') {
    return false;
  }

  let originUrl = new URL(origin);
  return originUrl.origin === url.origin;
}

export const handle: Handle<TracksomeLocals<false>> = async function ({ event, resolve }) {
  let cookies = cookie.parse(event.request.headers.get('cookie') || '');
  event.locals.userId = await session.read(cookies.sid);
  event.locals.theme = cookies.theme as Theme;
  event.locals.defaultDarkMode = cookies.defaultDarkMode === 'true';
  event.locals.timezone = cookies.timezone || 'UTC';

  if (requireAuthed(event) && !event.locals.userId) {
    return new Response('Not logged in', {
      status: 403,
    });
  }

  if (!csrfCheck(event)) {
    return new Response('CSRF failure', {
      status: 401,
    });
  }

  return resolve(event);
};

export const getSession: GetSession<TracksomeLocals> = (event) => {
  return {
    theme: event.locals.theme,
    defaultDarkMode: event.locals.defaultDarkMode,
    randomColor: randomColor(),
    timezone: event.locals.timezone,
  };
};
