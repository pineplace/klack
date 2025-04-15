import process from "node:process";
import { $ } from "execa";
import { task } from "hereby";
import shell from "shelljs";
import * as esbuild from "esbuild";
import * as dotenv from "dotenv";

const setupDotenv = task({
  name: "setupDotenv",
  run: () => {
    dotenv.config({
      path: [".env"],
      override: true,
    });
  },
});

/** @type {import("esbuild").BuildOptions} */
const buildOptions = {
  logLevel: "info",
  entryPoints: [
    "./src/background/background.ts",
    "./src/background/offscreen.ts",
    "./src/ui/injections/camera_bubble_stream/camera_bubble_stream.ts",
    "./src/ui/injections/recording_start_countdown/recording_start_countdown.ts",
    "./src/ui/pages/camera_bubble/camera_bubble.ts",
    "./src/ui/pages/permissions/permissions.ts",
    "./src/ui/pages/popup/popup.ts",
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

export const build = task({
  name: "build",
  dependencies: [setupDotenv],
  run: async () => {
    await $`tsc --noEmit`;
    await esbuild.build(buildOptions);
  },
});

export const buildRelease = task({
  name: "build:release",
  dependencies: [setupDotenv],
  run: async () => {
    await $`tsc --noEmit`;
    await esbuild.build({
      ...buildOptions,
      pure: ["console.log"],
      minify: true,
    });
  },
});

export const clean = task({
  name: "clean",
  run: () => {
    shell.rm(
      "-rf",
      "./public/*mjs",
      "./public/*mjs.map",
      "./coverage",
      ".jest-test-results.json",
    );
  },
});

export const dev = task({
  name: "dev",
  dependencies: [setupDotenv],
  run: async () => {
    const context = await esbuild.context(buildOptions);
    await Promise.all([context.watch()]);
  },
});
