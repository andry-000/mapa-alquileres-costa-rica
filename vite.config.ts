import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When deploying to GitHub Pages the app is served from a sub-path
// (https://<user>.github.io/mapa-alquileres-costa-rica/). The deploy
// workflow sets GITHUB_PAGES=true so assets and data fetches resolve
// against import.meta.env.BASE_URL. Locally the base is "/".
const base = process.env.GITHUB_PAGES ? "/mapa-alquileres-costa-rica/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: "es2021",
    sourcemap: true,
  },
});
