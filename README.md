# klack

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./docs/assets/Lookup_512x257.png" alt="klack lookup">
</p>

## About

Chrome extension for recording quick videos of your screen and camera

> [!IMPORTANT]
> The project is under active development and still has a lot of bugs and issues.

## How to build

```shell
pnpm install
pnpm build:release
```

## Installation

At the moment, the project doesn't have an archive ready for distribution via the [Chrome Web Store](https://chromewebstore.google.com/category/extensions) and only supports manual installation of an unpacked extension.

To install it manually make installation instruction from the [How to build](#how-to-build) section. After running the command, you should see the generated files in the public directory.

Open the `chrome://extensions/` tab and follow the steps below:

- Click on the `Load unpacked` button in the upper left side of the screen
- In file explorer, specify the path to the public directory inside the `klack` project
