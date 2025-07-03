// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html", // <-- Add this for Vite
    "./src/**/*.{js,ts,jsx,tsx}", // <-- This single line covers everything in src
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Your theme extensions from shadcn/ui
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // etc...
      },
      // ... rest of your theme
    },
  },
  plugins: [require("tailwindcss-animate")],
}