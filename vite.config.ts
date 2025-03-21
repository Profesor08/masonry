import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ mode }) => {
  return {
    plugins: [react(), tsconfigPaths()],
    base: mode === "production" ? "/masonry" : "/",
  };
});
