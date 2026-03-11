import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./pose/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070F",
        accent: {
          orange: "#FF6B1A",
          blue: "#3B82F6"
        }
      },
      boxShadow: {
        "glass": "0 0 40px rgba(59,130,246,0.35)"
      },
      borderRadius: {
        "xl": "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;

