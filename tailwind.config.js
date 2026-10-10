/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        divider: "var(--divider)",
        editorial: "var(--editorial)",
        pine: "var(--pine)",
        pinebg: "var(--pinebg)",
        rosebg: "var(--rosebg)",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "'Times New Roman'", "serif"],
        body: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "'Helvetica Neue'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      maxWidth: {
        'screen-xl': '1280px',
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px var(--ink)',
        'hard-sm': '2px 2px 0px 0px var(--ink)',
      },
    },
  },
  plugins: [],
}
