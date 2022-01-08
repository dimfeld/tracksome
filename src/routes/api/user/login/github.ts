import { RequestHandler } from '@sveltejs/kit';
import { config } from '$lib/auth/oauth';

const authURL = 'https://github.com/login/oauth/authorize';

export const get: RequestHandler = ({ url }) => {
  let redirect = new URL('/api/user/login/github_callback', url);

  let location =
    authURL +
    '?' +
    new URLSearchParams({
      scope: 'read:user',
      client_id: config.github.clientId,
      redirect_uri: redirect.toString(),
    }).toString();

  return {
    status: 302,
    headers: {
      Location: location,
    },
  };
};
