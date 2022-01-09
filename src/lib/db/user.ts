import { db, pgp, skipIfAbsent } from './client';
import { TracksomeLocals } from '$lib/endpoints';
import { User } from '../user';

export interface UserCreateOptions {
  loginId: string;
  provider: string;
  secretHash?: string;
  user: User;
}

const insertUserColumns = new pgp.helpers.ColumnSet(
  ['name', 'email', 'avatar', { name: 'enabled', skip: skipIfAbsent }],
  { table: 'users' }
);

const userColumns = insertUserColumns.extend(['?user_id']);

const loginColumns = new pgp.helpers.ColumnSet(
  [
    '?login_id',
    '?provider',
    { name: 'secret_hash', skip: skipIfAbsent },
    { name: 'enabled', skip: skipIfAbsent },
    '?user_id',
  ],
  { table: 'logins' }
);

export async function create({ loginId, provider, user, secretHash }: UserCreateOptions) {
  let user_id = await db.tx(async (tx) => {
    let addUserQuery = pgp.helpers.insert({ ...user, enabled: true }, insertUserColumns);
    let [{ user_id }] = await tx.query(`${addUserQuery} RETURNING user_id`);

    let addLoginQuery = pgp.helpers.insert(
      { login_id: loginId, provider, user_id, secret_hash: secretHash, enabled: true },
      loginColumns
    );
    await tx.query(addLoginQuery);

    return user_id;
  });

  return {
    user_id,
    ...user,
  };
}

export async function get(userId: string): Promise<User> {
  let [user] = await db.query(
    `SELECT user_id, name, email, avatar FROM users WHERE user_id=$[userId]`,
    { userId }
  );
  return user;
}

export function mustBeLoggedIn(locals: TracksomeLocals) {
  if (!locals.userId) {
    throw new Error('Not logged in');
  }
}
