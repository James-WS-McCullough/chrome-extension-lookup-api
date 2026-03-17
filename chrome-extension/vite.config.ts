import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
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
