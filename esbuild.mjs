import process from "process";
import * as esbuild from "esbuild";

/** @type {import("esbuild").BuildOptions} */
const contextOptions = {
  logLevel: "info",
  entryPoints: [
    "./src/background.ts",
    "./src/popup.tsx",
    "./src/scripts/camera_bubble.ts",
    "./src/scripts/camera_bubble_stream.ts",
    "./src/scripts/screen_sharing.ts",
    "./src/scripts/recording_start_countdown.ts",
  ],
  outdir: "./public",
  outExtension: {
    ".js": ".mjs",
  },
  entryNames: "[name].bundle",
  format: "iife",
  bundle: true,
  sourcemap: true,
};

if (process.argv.includes("--release")) {
  contextOptions.pure = ["console.log"];
  contextOptions.minify = true;
}

if (process.argv.includes("--build")) {
  await esbuild.build(contextOptions);
} else if (process.argv.includes("--watch")) {
  const context = await esbuild.context(contextOptions);
  await context.watch();
}
