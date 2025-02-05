import process from "process";
import * as esbuild from "esbuild";
import * as dotenv from "dotenv";

dotenv.config({
  path: [".env"],
  override: true,
});

/** @type {import("esbuild").BuildOptions} */
const contextOptions = {
  logLevel: "info",
  entryPoints: [
    "./src/background/offscreen.ts",
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
  define: {
    "process.env.APP_TITLE": JSON.stringify(process.env.npm_package_name),
    "process.env.APP_VERSION": JSON.stringify(process.env.npm_package_version),
    "process.env.FEATURES_BETA_RECORDING_CHUNKS_SERIALIZATION":
      process.env.FEATURES_BETA_RECORDING_CHUNKS_SERIALIZATION,
  },
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
