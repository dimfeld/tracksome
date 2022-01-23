import type { RequestHandler } from '@sveltejs/kit';
import { Theme } from './styles';
import Accepts from 'accepts';

export type TracksomeLocals<Authed extends boolean = true> = {
  contentType: string;
  userId: Authed extends true ? number : number | null;
  theme: Theme;
  defaultDarkMode: boolean;
  timezone: string;
  trackableView?: string;
  referrer: string | null;
  /** Used to return data from endpoints back to the page */
  returnValue: Record<string, unknown>;
  /** Used to override the default redirect target when redirecting a non-JS
   * form submission */
  redirectTarget?: string;
};

type TracksomeRequestHandler = RequestHandler<TracksomeLocals>;
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
