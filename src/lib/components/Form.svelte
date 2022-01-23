<script lang="ts">
  import { appContext } from '$lib/context';
  import { stuckValueStore } from '$lib/delayed_store';
  import { OnSubmit, submit, submitStatusStore } from '$lib/form';
  import { setContext } from 'svelte';

  export let id: string | undefined = undefined;
  export let action: string;
  export let method: 'GET' | 'POST';
  let classNames: string | undefined = undefined;
  export { classNames as class };

  /** If true, allow multiple submits to be active at once. Otherwise the form will
   * suppress submits that take place while the current one is outstanding. */
  export let allowMultipleConcurrent = false;
  export let resetOnSuccess = false;
  export let defaultErrorMessage = 'An error occurred';
  export let slowLoadingDelay = 300;

  export let status = submitStatusStore();

  const globalLoading = appContext().loading;
  $: slowLoading = stuckValueStore(status, 'submitting', slowLoadingDelay);

  setContext('formStatus', status);

  export let onResponse: (<DATA>(data: DATA, form: HTMLFormElement) => any) | undefined = undefined;
  export let onError: ((error: Record<string, string>) => void) | undefined = undefined;
  export let onSubmit: OnSubmit | undefined = undefined;

  let error: Record<string, string> | null = null;

  async function formOnResponse(response: Response, form: HTMLFormElement) {
    error = null;

    if (response.ok) {
      let data = await response.json();
      onResponse?.(data, form);

      if (resetOnSuccess) {
        form.reset();
      }
    } else {
      let data = await response.text();
      try {
        error = JSON.parse(data);
      } catch (e) {
        error = { message: data || defaultErrorMessage };
      }
      onError?.(error!);
    }
  }
</script>

<form
  class={classNames}
  {id}
  {action}
  {method}
  use:submit={{
    onSubmit,
    onResponse: formOnResponse,
    allowMultipleConcurrent,
    status,
    loading: globalLoading,
  }}
>
  <slot status={$status} slowLoading={$slowLoading} {error} />
</form>
