export const config = {
  app: {
    title: process.env.APP_TITLE,
    version: process.env.APP_VERSION,
  },
  features: {
    beta: {
      recordingChunksSerialization:
        process.env.FEATURES_BETA_RECORDING_CHUNKS_SERIALIZATION,
    },
  },
};

console.log(`Configuration: ${JSON.stringify(config, undefined, 2)}`);
