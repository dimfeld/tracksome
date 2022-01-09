import type { RequestHandler } from '@sveltejs/kit';
import { DefaultBody } from '@sveltejs/kit/types/endpoint';
import { Theme } from './styles';

export type TracksomeLocals<Authed extends boolean = true> = {
  userId: Authed extends true ? number : number | null;
  theme: Theme;
  defaultDarkMode: boolean;
  timezone: string;
};

type Typify<T> = { [K in keyof T]: Typify<T[K]> };

type TracksomeRequestHandler<Input = unknown, Output = DefaultBody> = RequestHandler<
  TracksomeLocals,
  Input,
  Typify<Output>
>;
export type { TracksomeRequestHandler as RequestHandler };

export function parseNumber(value: string | null): number | undefined {
  let v = parseInt(value, 10);
  if (Number.isNaN(v)) {
    return undefined;
  }
  return v;
}
