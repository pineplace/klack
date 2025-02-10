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
    "./src/background/background.ts",
    "./src/background/offscreen.ts",
    "./src/ui/camera_bubble/camera_bubble.ts",
    "./src/ui/recording_start_counter/recording_start_counter.ts",
    "./src/ui/popup/popup.ts",
    "./src/ui/camera_bubble_stream/camera_bubble_stream.ts",
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
