import pgpMod from 'pg-promise';
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL as string;

export const pgp = pgpMod();
export const db = pgp(DATABASE_URL);

export function skipIfAbsent({ value }: { value: any }) {
  return value === undefined;
}
