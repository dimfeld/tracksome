<script lang="ts">
  import { appContext } from '$lib/context';
  import { OnSubmit, submit, submitStatusStore } from '$lib/form';

  export let allowMultipleConcurrent = false;
  export let action: string;
  export let method: 'GET' | 'POST';
  let classNames: string | undefined;
  export { classNames as class };
  export let defaultErrorMessage = 'An error occurred';

  export let status = submitStatusStore();
  export let loading = appContext().loading;

  export let onResponse: (<DATA>(data: DATA) => any) | undefined = undefined;
  export let onError: (() => void) | undefined = undefined;
  export let onSubmit: OnSubmit | undefined = undefined;

  let error: object | null = null;

  async function formOnResponse(response: Response, form: HTMLFormElement) {
    error = null;
    if (!response.ok) {
      let data = await response.text();
      try {
        error = JSON.parse(data);
      } catch (e) {
        error = { message: data || defaultErrorMessage };
      }
      onError?.();
    } else {
      let data = await response.json();
      onResponse?.(data);
    }
  }
</script>

<form
  class={classNames}
  {action}
  {method}
  use:submit={{
    onSubmit,
    onResponse: formOnResponse,
    allowMultipleConcurrent,
    status,
    loading,
  }}
>
  <slot {status} {error} />
</form>
