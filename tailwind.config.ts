/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "bg-gradient-ellipse":
          " radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
      },
      boxShadow: {
        "shadow-1":
          "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px,hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
      },
    },
  },
  plugins: [],
};
