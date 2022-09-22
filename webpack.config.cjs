const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  devtool: "cheap-module-source-map",
  mode: "production",
  entry: {
    popup: "./ui/popup.jsx",
    controls: "./ui/controls.jsx"
  },
  output: {
    path: path.join(__dirname, "./public"),
    filename: "[name].bundle.mjs",
    hashFunction: "xxhash64",
  },
  resolve: {
    extensions: [".js", ".jsx"],
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
        include: [/ui/],
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
    ],
  },
};
