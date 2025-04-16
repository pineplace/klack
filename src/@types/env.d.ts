declare namespace NodeJS {
  interface ProcessEnv {
    APP_TITLE: string;
    APP_VERSION: string;
  }
}

declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}
