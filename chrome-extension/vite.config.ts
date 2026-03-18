import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [vue(), tsconfigPaths({ root: "../local-api" })],
  define: mode === "test" ? {} : { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "dist",
    modulePreload: false,
    lib: {
      entry: "src/main.ts",
      formats: ["iife"],
      name: "AuthorLookup",
      fileName: () => "popup.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
      },
    },
  },
  test: {
    environment: "jsdom",
  },
}));
