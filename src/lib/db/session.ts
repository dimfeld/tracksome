import { db } from './client';
import { User } from '../user';
import * as cookie from 'cookie';
import * as userDb from './user';
import flru from 'flru';

interface Session {
  user_id: number;
  expires: Date;
}

const sessionCache = flru<Session | null>(1000);

// Default to 1 year
const sessionExpirationMinutes = +(process.env.SESSION_DURATION_MINUTES || '525960');

export interface SessionCreateOptions {
  loginId: string;
  provider: string;
  user?: User;
  createIfMissing: boolean;
  currentUrl: URL;
}

export async function create({
  loginId,
  provider,
  user,
  createIfMissing,
  currentUrl,
}: SessionCreateOptions) {
  let existingUser: (User & { user_id: string }) | null = await db.oneOrNone(
    `SELECT user_id, name, email, avatar
      FROM logins
      JOIN users USING (user_id)
      WHERE login_id=$[loginId] AND provider=$[provider]`,
    { loginId, provider }
  );

  if (!existingUser) {
    if (!createIfMissing) {
      throw new Error('login not found');
    }

    if (!user) {
      throw new Error('No user info');
    }

    existingUser = await userDb.create({
      user,
      loginId,
      provider,
    });
  } else if (user) {
    let args = (['name', 'email', 'avatar'] as (keyof User)[])
      .filter((field) => user[field])
      .map((field) => `${field}=$[${field}]`);

    if (args.length) {
      let userUpdate = await db.query(
        `UPDATE users SET ${args.join(', ')}, updated=now()
        WHERE user_id=$[user_id]
        RETURNING user_id, name, email, avatar`,
        {
          ...user,
          user_id: existingUser.user_id,
        }
      );

      existingUser = userUpdate[0];
    }
  }

  let [session] = await db.query(
    `INSERT INTO sessions
    (user_id, expires)
    VALUES
    ($[userId], now() + interval '${sessionExpirationMinutes} minutes')
    RETURNING *`,
    { userId: existingUser!.user_id }
  );

  let sessionCookie = cookie.serialize('sid', session.session_id, {
    expires: new Date(session.expires),
    path: '/',
    httpOnly: true,
    secure: !currentUrl.host.startsWith('localhost'),
  });

  sessionCache.set(session.session_id, {
    user_id: existingUser!.user_id,
    expires: session.expires,
  });

  let { user_id: _user_id, ...userOutput } = existingUser!;
  return {
    sessionId: session.session_id,
    cookie: sessionCookie,
    expires: session.expires,
    user: userOutput,
  };
}

export async function destroy(sid: string) {
  if (sid) {
    if (sessionCache.has(sid)) {
      sessionCache.set(sid, null);
    }
    await db.query(`DELETE FROM sessions WHERE session_id=$[sid]`, { sid });
  }
}

export async function read(sid: string | null): Promise<number | null> {
  if (!sid) {
    return null;
  }

  let cached = sessionCache.get(sid);
  if (cached) {
    if (cached.expires.valueOf() < Date.now()) {
      sessionCache.set(sid, null);
      return null;
    } else {
      return cached.user_id;
    }
  }

  let result = await db.oneOrNone(
    `SELECT user_id, expires FROM sessions WHERE session_id=$[sid] AND expires > now()`,
    { sid }
  );

  if (result) {
    sessionCache.set(sid, result);
  }

  return result?.user_id ?? null;
}
