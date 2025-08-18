import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"], // enables dark mode with 'class'
  content: [
    "./app/**/*.{ts,tsx}",       // Next.js app folder
    "./pages/**/*.{ts,tsx}",     // Pages folder
    "./components/**/*.{ts,tsx}",// All your components
    "./node_modules/@shadcn/ui/**/*.{ts,tsx}" // Optional if using shadcn node modules
  ],
  theme: {
    extend: {}, // add custom colors, fonts, etc. here
  },
  plugins: [],
}

export default config
