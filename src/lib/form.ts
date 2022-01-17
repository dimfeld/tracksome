import { ReadOnlyFormData } from '@sveltejs/kit/types/helper';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import set from 'just-safe-set';

export interface SubmitActionOptions {
  onSubmit?: (body: FormData | null) => boolean | undefined;
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

      let ok = onSubmit?.(body) ?? true;
      if (!ok) {
        return;
      }

      const response = await fetch(node.action, {
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

export type AsStrings<O extends object> = {
  [K in keyof O]: O[K] extends object ? AsStrings<O[K]> : string;
};

export function formDataToJson<T extends object>(form: ReadOnlyFormData | T): T | AsStrings<T> {
  if (typeof (form as ReadOnlyFormData)?.entries == 'function') {
    let output: Partial<AsStrings<T>> = {};
    for (let [key, val] of (form as ReadOnlyFormData).entries()) {
      set(output, key, val);
    }

    return output as AsStrings<T>;
  } else {
    return form as AsStrings<T>;
  }
}

export function checkboxToBoolean(s: string | boolean | undefined) {
  if (typeof s === 'string') {
    return s === 'on';
  } else {
    return s;
  }
}

export function intFromString(s: string | number | undefined) {
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
