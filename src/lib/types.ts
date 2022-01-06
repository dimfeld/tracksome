import type { RequestHandler } from '@sveltejs/kit';
import { DefaultBody } from '@sveltejs/kit/types/endpoint';
import { Theme } from './styles';

export type TracksomeLocals = {
  userId: number;
  theme: Theme;
  defaultDarkMode: boolean;
  timezoneOffset: number;
};

type Typify<T> = { [K in keyof T]: Typify<T[K]> };

type TracksomeRequestHandler<Input = unknown, Output = DefaultBody> = RequestHandler<
  TracksomeLocals,
  Input,
  Typify<Output>
>;
export type { TracksomeRequestHandler as RequestHandler };
