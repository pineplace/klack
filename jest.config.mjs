/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["esbuild-jest"],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
