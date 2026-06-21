/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Zen Old Mincho"', "serif"],
        body: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#1c2b33",
          soft: "#3c4d54",
          faint: "#6b7c80",
        },
        line: "#d9e2e2",
        "bg-subtle": "#f1f5f5",
        teal: {
          deep: "#0f5f5c",
          soft: "#e4f0ef",
          ink: "#0f5f5c",
        },
        amber: {
          deep: "#b5781a",
          soft: "#fbf0dd",
          ink: "#8a5a0a",
        },
      },
    },
  },
  plugins: [],
};
