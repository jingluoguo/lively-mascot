import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Demo 专用配置：把 `lively-mascot` 重定向到源码，
 * 让 demo 用和真实用户完全一致的引入方式（import "lively-mascot/styles.css"）。
 */
export default defineConfig({
  plugins: [react()],
  root: "demo",
  resolve: {
    alias: [
      /* 精确子路径必须排在裸包名之前，否则会被前缀吞掉 */
      {
        find: "lively-mascot/styles.css",
        replacement: path.resolve(__dirname, "src/styles/lively-mascot.css"),
      },
      {
        find: "lively-mascot",
        replacement: path.resolve(__dirname, "src/index.ts"),
      },
    ],
  },
});
