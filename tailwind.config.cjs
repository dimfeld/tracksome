const plugin = require('tailwindcss/plugin');

let brightnessValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dgray: Object.fromEntries(brightnessValues.map((c) => [c, `var(--color-dgray-${c})`])),
        dblack: `var(--color-dblack)`,
        dwhite: `var(--color-dwhite)`,
      },
    },
  },

  plugins: [
    plugin(({ addBase, theme }) => {
      const mainElement = '#tracksome-top';

      function generateLightDark(colorSource) {
        let lightColorValues = brightnessValues.map((color) =>
          theme(`colors.${colorSource}.${color}`)
        );

        let lightColors = Object.fromEntries(
          brightnessValues.map((color, i) => [
            `--color-d${colorSource}-${color}`,
            lightColorValues[i],
          ])
        );

        let darkColorValues = lightColorValues.slice().reverse();
        let darkColors = Object.fromEntries(
          brightnessValues.map((color, i) => [
            `--color-d${colorSource}-${color}`,
            darkColorValues[i],
          ])
        );

        return {
          light: lightColors,
          dark: darkColors,
        };
      }

      let gray = generateLightDark('gray');

      let lightColors = {
        '--color-dwhite': 'white',
        '--color-dblack': 'black',
        ...gray.light,
      };

      let darkColors = {
        '--color-dwhite': 'black',
        '--color-dblack': 'white',
        ...gray.dark,
      };

      addBase({
        [mainElement]: lightColors,
        [`${mainElement}.dark`]: darkColors,
      });
    }),
  ],
};

module.exports = config;
