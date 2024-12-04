import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: "$1",
      },
    ],
  },
  optimizeDeps: {
    include: ["react-leaflet", "leaflet"],
  },
  build: {
    rollupOptions: {
      external: ["react-leaflet", "leaflet"],
    },
  },
});
