import { db } from './client';
import { User } from '../user';
import * as userDb from './user';

// Default to 1 year
const sessionExpirationMinutes = +(import.meta.env.VITE_SESSION_DURATION_MINUTES || '525960');

export interface SessionCreateOptions {
  loginId: string;
  provider: string;
  user?: User;
  createIfMissing: boolean;
}

export async function create({ loginId, provider, user, createIfMissing }: SessionCreateOptions) {
  let existingUser = await db.oneOrNone(
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
      existingUser = await db.query(
        `UPDATE users SET ${args.join(', ')}, updated=now()
        WHERE user_id=$[user_id]
        RETURNING user_id, name, email, avatar`,
        {
          ...user,
          user_id: existingUser.user_id,
        }
      );
    }
  }

  let [session] = await db.query(`INSERT INTO sessions
    (user_id, expires)
    VALUES
    ($[userId], now() + interval '${sessionExpirationMinutes} minutes')
    RETURNING *`);

  return {
    sessionId: session.session_id,
    expires: session.expires,
    user: existingUser,
  };
}
