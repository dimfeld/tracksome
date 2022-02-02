import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { Handle } from '@sveltejs/kit';
import { GetSession, RequestEvent } from '@sveltejs/kit/types/hooks';
import { randomColor } from '$lib/colors';
import { Theme } from '$lib/styles';

function requireAuthed(event: RequestEvent) {
  let path = event.url.pathname;
  return (
    event.request.method !== 'GET' || (path.startsWith('/api') && !path.startsWith('/api/user'))
  );
}

/** Return true if this request doesn't present CSRF concerns. False if it appears to be
 * a CSRF or is from an old browser (IE11) that doesn't send the proper headers. */
function csrfCheck({ request, locals, url }: RequestEvent): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true;
  }

  if (locals.contentType === 'application/json') {
    // CSRF will *always* be a form submission from a browser, so JSON payloads are always OK.
    // This allows use of the API from external clients.
    return true;
  }

  let origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin || origin === 'null') {
    return false;
  }

  let originUrl = new URL(origin);
  return originUrl.origin === url.origin;
}

export const handle: Handle = async function ({ event, resolve }) {
  let contentType = event.request.headers.get('content-type')?.split(';')[0]?.toLowerCase() ?? '';
  let cookies = cookie.parse(event.request.headers.get('cookie') || '');

  event.locals.contentType = contentType;
  event.locals.userId = await session.read(cookies.sid);
  event.locals.theme = cookies.theme as Theme;
  event.locals.defaultDarkMode = cookies.defaultDarkMode === 'true';
  event.locals.timezone = cookies.timezone || 'UTC';
  event.locals.trackableView = cookies.trackableView;
  event.locals.returnValue = {};

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

  let response = await resolve(event);

  /* Redirect non-JS form responses back to the requesting page, or to
   * another page if something has overriden redirectTarget */
  const referrer = event.request.headers.get('referer');
  if (
    event.url.pathname.startsWith('/api') &&
    referrer &&
    response.status < 300 &&
    !response.headers.has('location') &&
    event.request.headers.get('accept')?.includes('text/html')
  ) {
    let redirectionTarget = event.locals.redirectTarget ?? referrer;
    let location = new URL(redirectionTarget, referrer);
    if (Object.keys(event.locals.returnValue).length > 0) {
      location.searchParams.set('__callback', btoa(JSON.stringify(event.locals.returnValue)));
    }

    response = new Response('', {
      status: 303,
      headers: {
        location: location.toString(),
      },
    });
  }

  return response;
};

export const getSession: GetSession = (event) => {
  return {
    theme: event.locals.theme,
    defaultDarkMode: event.locals.defaultDarkMode,
    randomColor: randomColor(),
    timezone: event.locals.timezone,
    trackableView: event.locals.trackableView,
    returnValue: event.locals.returnValue,
  };
};
