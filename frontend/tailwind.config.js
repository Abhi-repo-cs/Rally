/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rally: {
          50: "#EEF3FF",
          100: "#DDE7FF",
          200: "#C3D2FF",
          500: "#2451EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        "rally-bg": "#F5F8FC",
        "rally-text": "#0F172A",
        "rally-border": "#E2E8F0",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
}
