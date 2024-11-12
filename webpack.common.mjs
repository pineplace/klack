import path from "path";
import { fileURLToPath } from "url";
import ESLintPlugin from "eslint-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    background: "./src/background.ts",
    popup: "./src/popup.tsx",
    camera_bubble: "./src/scripts/camera_bubble.ts",
    camera_bubble_stream: "./src/scripts/camera_bubble_stream.ts",
    screen_sharing: "./src/scripts/screen_sharing.ts",
    recording_start_countdown: "./src/scripts/recording_start_countdown.ts",
  },
  output: {
    path: path.join(__dirname, "./public"),
    filename: "[name].bundle.mjs",
    hashFunction: "xxhash64",
  },
  performance: {
    /* NOTE: We don't need any source downloading for client side
     *       because extensions downloaded and installed immediately
     */
    hints: false,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new ESLintPlugin({
      useEslintrc: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "esbuild-loader",
        options: {
          target: "es2022",
        },
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
};
