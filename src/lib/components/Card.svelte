<script lang="ts">
  let classNames: string | undefined = undefined;
  export { classNames as class };

  export let label = '';
</script>

<section
  class:pt-2={label}
  class="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-400 shadow-md {classNames ||
    ''}"
>
  {#if label || $$slots.label}
    <header class="font-bold text-gray-700 dark:text-gray-300 mb-4">
      <slot name="label">{label}</slot>
    </header>
  {/if}
  <slot />
</section>
