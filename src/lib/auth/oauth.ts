import { User } from '../user';
import * as sessionDb from '$lib/db/session';

type UserDetails = Omit<User, 'user_id'> & { login_id: string };

export interface OAuthConfig {
  name: string;
  authURL: string;
  tokenURL: string;
  clientId: string;
  clientSecret: string;
  userUrl: string;
  extractUserDetails: (data: any) => UserDetails;
}

export const config: Record<string, OAuthConfig> = {
  github: {
    name: 'github',
    authURL: 'https://github.com/login/oauth/authorize',
    tokenURL: 'https://github.com/login/oauth/access_token',
    clientId: process.env.OAUTH_GITHUB_CLIENT_ID as string,
    clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET as string,
    userUrl: 'https://api.github.com/user',
    extractUserDetails: (user) => ({
      login_id: user.id.toString(),
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
      'User-Agent': 'TrackSome',
    },
  }).then((r) => r.json());

  let accessToken: string = tokenResponse.access_token;

  const userData = await fetch(provider.userUrl, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/json',
      'User-Agent': 'TrackSome',
    },
  }).then((r) => r.json());
  const userDetails = provider.extractUserDetails(userData);

  const { user, cookie } = await sessionDb.create({
    loginId: userDetails.login_id,
    provider: provider.name,
    user: userDetails,
    // For OAuth, login and register are the same thing so we just create the local account if it doesn't exist already.
    createIfMissing: true,
    currentUrl: callbackUrl,
  });

  return {
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'text/html; charset=utf-8',
    },
    body: `
     <script>
       window.opener.postMessage({
         success: true
       }, window.location.origin);
     </script>
    `,
  };
}
