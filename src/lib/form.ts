import set from 'just-safe-set';
import { Writable, writable } from 'svelte/store';
import { LoadingStore } from './loader_status.js';

/** Add this to a form submission to make the handler redirect to another place
 * when a non-JS form submission takes place. */
export const FORM_REDIRECT_TARGET = '__formRedirectTarget';

export type OnSubmit = (
  body: FormData | null,
  event: SubmitEvent
) => Promise<boolean> | boolean | undefined | void;

export interface SubmitActionOptions {
  onSubmit?: OnSubmit;
  onResponse?: (response: Response, form: HTMLFormElement) => void;
  allowMultipleConcurrent?: boolean;
  status?: SubmitStatusStore;
  loading?: LoadingStore;
}

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'failed';
export type SubmitStatusStore = Writable<SubmitStatus>;

export function submitStatusStore(): SubmitStatusStore {
  return writable('idle');
}

export async function errorData(response: Response) {
  if (response.status < 400) {
    return null;
  }

  if (response.headers.get('content-type') == 'application/json') {
    let data = await response.json();
    return data?.error;
  } else {
    return response.text();
  }
}

let submitLoaderId = 0;

// This is taken from the official SvelteKit RealWorld demo at
// https://github.com/sveltejs/realworld/blob/77c29bfc261a30f9eb934da1bf9d3d370ac68422/src/lib/actions.js
/** Enhance an HTML form by doing a Javascript fetch for the submit, with hooks */
export function submit(
  node: HTMLFormElement,
  {
    onSubmit,
    onResponse,
    status,
    loading,
    allowMultipleConcurrent = false,
  }: SubmitActionOptions = {}
) {
  let abortController: AbortController | null = null;
  const submitId = `form-submission-${submitLoaderId++}`;
  const handler = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!node.noValidate && !node.reportValidity()) {
      return;
    }

    try {
      const body = node.method === 'post' || node.method === 'put' ? new FormData(node) : null;

      let ok = onSubmit ? (await onSubmit(body, event)) ?? true : true;
      if (!ok) {
        return;
      }

      status?.set('submitting');
      loading?.add(submitId);

      if (!allowMultipleConcurrent) {
        abortController?.abort();
        abortController = new AbortController();
      }

      // Have to use `getAttribute` here. When the `formaction` attribute is not set, `event.submitter.formAction` will
      // return the current document's URL instead of the form's action if it isn't overridden, but we want it to return
      // nothing and use the form's action instead.
      const action =
        (event.submitter as HTMLButtonElement)?.getAttribute('formaction') ?? node.action;

      try {
        const response = await fetch(action, {
          method: node.method,
          body,
          redirect: 'manual',
          signal: abortController?.signal,
          headers: {
            accept: 'application/json',
          },
        });
        if (response.ok) {
          status?.set('success');
        } else {
          status?.set('failed');
        }

        onResponse?.(response, node);
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') {
          status?.set('failed');
        }
      }
    } finally {
      loading?.delete(submitId);
    }
  };

  node.addEventListener('submit', handler);

  return {
    destroy() {
      node.removeEventListener('submit', handler);
    },
  };
}

export function fromForm(request: Request): boolean {
  return request.headers.get('accept')?.includes('text/html') ?? false;
}

export type WithStrings<O extends object> = {
  [K in keyof O]: O[K] extends object
    ? WithStrings<O[K]>
    : O[K] extends string // don't add string to types like 'a'|'b'|'c'
    ? O[K]
    : string | O[K];
};

/** Convert a FormData to an object, creating nested objects from dotted paths. This
 * function does not attempt to do any type coercion, so all the leaf values will be strings. */
export function formDataToJson<T extends object>(form: FormData | T): WithStrings<T> {
  if (typeof (form as FormData)?.entries == 'function') {
    let output: Partial<WithStrings<T>> = {};
    for (let [key, val] of (form as FormData).entries()) {
      set(output, key, val);
    }

    return output as WithStrings<T>;
  } else {
    return form as T;
  }
}

/** Parse the form body, and place special form variables into the request
 * locals, if any. */
export async function parseBody<T extends object>(
  request: Request,
  locals: App.Locals
): Promise<WithStrings<T> | null> {
  switch (locals.contentType) {
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data': {
      let data = await request.formData();

      const redirectTarget = data.get(FORM_REDIRECT_TARGET)?.toString();
      if (redirectTarget) {
        data.delete(FORM_REDIRECT_TARGET);
        locals.redirectTarget = redirectTarget;
      }

      return formDataToJson<T>(data);
    }
    case 'application/json':
      return request.json() as T;
    default:
      return null;
  }
}

export function checkboxToBoolean(s: string | boolean | undefined) {
  if (typeof s === 'string') {
    return s === 'on';
  } else {
    return s;
  }
}

export function intFromString(s: string | number | null | undefined): number | null | undefined {
  if (typeof s === 'string') {
    let value = parseInt(s, 10);
    if (Number.isNaN(value)) {
      return null;
    }

    return value;
  } else {
    return s;
  }
}
