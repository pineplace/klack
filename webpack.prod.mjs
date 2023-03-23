import common from "./webpack.common.mjs";

export default {
  ...common,
  mode: "production",
  devtool: "hidden-source-map",
};
