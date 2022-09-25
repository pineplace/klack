const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  devtool: "cheap-module-source-map",
  mode: "production",
  entry: {
    // ui
    popup: "./ui/popup.tsx",
    controls: "./ui/controls.tsx",
    // extension background
    background: "./src/background.ts",
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
      extensions: [".js", ".jsx"],
      useEslintrc: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx$/,
        include: [/islands/, /ui/, /src/],
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
        include: [/islands/, /src/, /ui/],
        use: "ts-loader",
      },
    ],
  },
};
