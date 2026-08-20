import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/styles/lively-mascot.css"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
