import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess({})],
  disableDependencyReinclusion: ['svench'],
  kit: {
    vite: () => ({
      ssr: {
        noExternal: ['sorters'],
      },
    }),
    adapter: adapter(),
  },
};

export default config;
