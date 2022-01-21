import type { RequestHandler } from '@sveltejs/kit';
import { DefaultBody } from '@sveltejs/kit/types/endpoint';
import { Theme } from './styles';
import Accepts from 'accepts';

export type TracksomeLocals<Authed extends boolean = true> = {
  contentType: string;
  userId: Authed extends true ? number : number | null;
  theme: Theme;
  defaultDarkMode: boolean;
  timezone: string;
  trackableView?: string;
};

type Typify<T> = { [K in keyof T]: Typify<T[K]> };

type TracksomeRequestHandler<Output = DefaultBody> = RequestHandler<
  TracksomeLocals,
  Typify<Output>
>;
export type { TracksomeRequestHandler as RequestHandler };

export function parseNumber(value: number | string | null): number | undefined {
  if (typeof value !== 'string') {
    return value ?? undefined;
  }

  let v = parseInt(value, 10);
  if (Number.isNaN(v)) {
    return undefined;
  }
  return v;
}

export function responseAccepts(
  request: Request,
  responses: Record<string, () => Response | Promise<Response>>
): Response | Promise<Response> {
  // @ts-ignore Different types but they overlap in the proper places.
  let accepts = new Accepts(request);

  let acceptedTypes = Object.keys(responses).filter((t) => t !== 'default');

  let contentType = accepts(acceptedTypes) || 'default';

  return responses[contentType]();
}
