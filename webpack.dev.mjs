import common from "./webpack.common.mjs";

export default {
  ...common,
  mode: "development",
  devtool: "cheap-module-source-map",
};
