import { ReadOnlyFormData } from '@sveltejs/kit/types/helper';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import set from 'just-safe-set';

export interface SubmitActionOptions {
  onSubmit?: (body: FormData | null, event: SubmitEvent) => Promise<boolean> | boolean | undefined;
  onResponse?: (response: Response, form: HTMLFormElement) => void;
  allowMultipleConcurrent?: boolean;
}

// This is taken from the official SvelteKit RealWorld demo at
// https://github.com/sveltejs/realworld/blob/77c29bfc261a30f9eb934da1bf9d3d370ac68422/src/lib/actions.js
/** Enhance an HTML form by doing a Javascript fetch for the submit, with hooks */
export function submit(
  node: HTMLFormElement,
  { onSubmit, onResponse, allowMultipleConcurrent = false }: SubmitActionOptions = {}
) {
  let submitting = false;
  const handler = async (event: SubmitEvent) => {
    event.preventDefault();

    if (submitting && !allowMultipleConcurrent) {
      return;
    }

    try {
      submitting = true;

      const body = node.method === 'post' || node.method === 'put' ? new FormData(node) : null;

      let ok = onSubmit ? (await onSubmit(body, event)) ?? true : true;
      if (!ok) {
        return;
      }

      // Have to use `getAttribute` here. When the `formaction` attribute is not set, `event.submitter.formAction` will
      // return the current document's URL instead of the form's action if it isn't overridden, but we want it to return
      // nothing and use the form's action instead.
      const action =
        (event.submitter as HTMLButtonElement)?.getAttribute('formaction') ?? node.action;

      const response = await fetch(action, {
        method: node.method,
        body,
        redirect: 'manual',
        headers: {
          accept: 'application/json',
        },
      });

      onResponse?.(response, node);
    } finally {
      submitting = false;
    }
  };

  node.addEventListener('submit', handler);

  return {
    destroy() {
      node.removeEventListener('submit', handler);
    },
  };
}

export function fromForm(request: ServerRequest) {
  return request.headers.accept.includes('application/json');
}

export type WithStrings<O extends object> = {
  [K in keyof O]: O[K] extends object
    ? WithStrings<O[K]>
    : O[K] extends string // don't add string to types like 'a'|'b'|'c'
    ? O[K]
    : string | O[K];
};

export function formDataToJson<T extends object>(form: ReadOnlyFormData | T): T | WithStrings<T> {
  if (typeof (form as ReadOnlyFormData)?.entries == 'function') {
    let output: Partial<WithStrings<T>> = {};
    for (let [key, val] of (form as ReadOnlyFormData).entries()) {
      set(output, key, val);
    }

    return output as WithStrings<T>;
  } else {
    return form as T;
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
