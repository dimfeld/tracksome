<script lang="ts">
  export let value: boolean;
  export let name: string;
  export let label: string = '';

  let classNames: string | undefined = undefined;
  export { classNames as class };
</script>

<label class={classNames}>
  <input type="hidden" {name} value="off" />
  <input type="checkbox" bind:checked={value} {name} />
  <slot
    >{#if label}<span class="label">{label}</span>{/if}</slot
  >
</label>
