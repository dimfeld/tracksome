import { db, pgp, skipIfAbsent } from './client';
import { ColumnSet } from 'pg-promise';
import { User } from '../user';

export interface UserCreateOptions {
  loginId: string;
  provider: string;
  secretHash?: string;
  user: User;
}

const userColumns = new ColumnSet(
  ['?user_id', 'name', 'email', 'avatar', { name: 'enabled', skip: skipIfAbsent }],
  { table: 'users' }
);

const loginColumns = new ColumnSet(
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
    let addUserQuery = pgp.helpers.insert(user, userColumns);
    let [{ user_id }] = await tx.query(`${addUserQuery} RETURNING user_id`);

    let addLoginQuery = pgp.helpers.insert(
      { login_id: loginId, provider, user_id, secret_hash: secretHash },
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
