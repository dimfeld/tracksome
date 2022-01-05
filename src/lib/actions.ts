export interface SubmitActionOptions {
  onSubmit?: (body: FormData | null) => void;
  onResponse?: (response: Response) => void;
}

// This is taken from the official SvelteKit RealWorld demo at
// https://github.com/sveltejs/realworld/blob/77c29bfc261a30f9eb934da1bf9d3d370ac68422/src/lib/actions.js
/** Enhance an HTML form by doing a Javascript fetch for the submit, with hooks */
export function submit(node: HTMLFormElement, { onSubmit, onResponse }: SubmitActionOptions = {}) {
  const handler = async (event: SubmitEvent) => {
    event.preventDefault();
    const body = node.method === 'post' || node.method === 'put' ? new FormData(node) : null;

    onSubmit?.(body);

    const response = await fetch(node.action, {
      method: node.method,
      body,
      headers: {
        accept: 'application/json',
      },
    });

    onResponse?.(response);
  };

  node.addEventListener('submit', handler);

  return {
    destroy() {
      node.removeEventListener('submit', handler);
    },
  };
}
