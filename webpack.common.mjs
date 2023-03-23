import path from "path";
import { fileURLToPath } from "url";
import ESLintPlugin from "eslint-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    background: "./src/background.ts",
    popup: "./src/popup.tsx",
    cameraBubble: "./src/scripts/camera_bubble.ts",
    cameraBubbleStream: "./src/scripts/camera_bubble_stream.ts",
    screenSharing: "./src/scripts/screen_sharing.ts",
  },
  output: {
    path: path.join(__dirname, "./ext"),
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
      // extensions: [".js", ".jsx"],
      useEslintrc: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx$/,
        include: [/src/],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "defaults",
                  },
                ],
                "@babel/preset-react",
              ],
            },
          },
        ],
      },
      {
        test: /\.(ts|tsx)?$/,
        include: [/src/],
        use: "ts-loader",
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
};
