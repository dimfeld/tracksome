<script context="module" lang="ts">
  import { handleJsonResponse, ResponseError } from '$lib/load';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ fetch, params }) => {
    try {
      let { trackable_id } = params;
      let [trackable, attributes] = await Promise.all([
        handleJsonResponse(fetch(`/api/trackables/${trackable_id}`)),
        [],
      ]);

      return {
        props: { trackable },
        stuff: {
          trackable,
          attributes,
        },
      };
    } catch (e) {
      if (e instanceof ResponseError) {
        return e.toResponse();
      }

      throw e;
    }
  };
</script>

<script lang="ts">
  import { Trackable, colorVars } from '$lib/trackable';
  import * as d3 from 'd3';

  export let trackable: Trackable;

  $: trackableColors = colorVars(d3.lab(trackable.color));
</script>

<div style={trackableColors}>
  <slot />
</div>
