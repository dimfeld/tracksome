import * as cookie from 'cookie';
import { User } from '../user';
import * as sessionDb from '$lib/db/session';

export interface OAuthConfig {
  name: string;
  authURL: string;
  tokenURL: string;
  clientId: string;
  clientSecret: string;
  userUrl: string;
  extractUserDetails: (data: any) => User;
}

export const config: Record<string, OAuthConfig> = {
  github: {
    name: 'github',
    authURL: 'https://github.com/login/oauth/authorize',
    tokenURL: 'https://github.com/login/oauth/access_token',
    clientId: import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID as string,
    clientSecret: import.meta.env.VITE_OAUTH_GITHUB_CLIENT_SECRET as string,
    userUrl: 'https://api.github.com/user',
    extractUserDetails: (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
    }),
  },
};

export async function handleLoginCode(
  callbackUrl: URL,
  provider: OAuthConfig,
  code: string | null
) {
  if (!code) {
    return {
      status: 400,
      body: 'invalid code',
    };
  }

  let tokenUrl =
    provider.tokenURL +
    '?' +
    new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
    }).toString();

  let tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }).then((r) => r.json());

  let accessToken: string = tokenResponse.accessToken;

  const userData = await fetch(provider.userUrl, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/json',
      'User-Agent': 'TrackSome',
    },
  }).then((r) => r.json());
  const userDetails = provider.extractUserDetails(userData);

  const { sessionId, expires, user } = await sessionDb.create({
    loginId: userDetails.id,
    provider: provider.name,
    user: userDetails,
    // For OAuth, login and register are the same thing so we just create the local account if it doesn't exist already.
    createIfMissing: true,
  });

  let sessionCookie = cookie.serialize('sid', sessionId, {
    expires: new Date(expires),
    path: '/',
    httpOnly: true,
    secure: !callbackUrl.host.startsWith('localhost'),
  });

  return {
    headers: {
      'Set-Cookie': sessionCookie,
      'Content-Type': 'text/html; charset=utf-8',
    },
    body: `
    <script>
       window.opener.postMessage({
         user: ${JSON.stringify(user)}
       }, window.location.origin);
     </script>
    `,
  };
}
