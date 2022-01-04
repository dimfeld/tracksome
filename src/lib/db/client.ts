import dotenv from 'dotenv';
import pgpMod from 'pg-promise';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL must be configured`);
}

export const pgp = pgpMod();
export const db = pgp(process.env.DATABASE_URL as string);

export function skipIfAbsent({ value }: { value: any }) {
  return value === undefined;
}
