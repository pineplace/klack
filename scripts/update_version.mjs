#!/bin/env node

import { promises as fs } from "fs";
import { program } from "commander";

program
  .description("This script updates extension's version")
  .argument("<version x.y.z>")
  .parse();

const [version] = program.args;
const _opts = program.opts();

try {
  const data = await fs.readFile("./ext/manifest.json");
  const manifest = JSON.parse(data); // eslint-disable-line
  manifest.version = version; // eslint-disable-line
  await fs.writeFile(
    "./ext/manifest.json",
    JSON.stringify(manifest, null, 2) + "\n"
  );
} catch (err) {
  console.error("Can't update 'manifest.json' version", err);
}

try {
  const data = await fs.readFile("./package.json");
  const manifest = JSON.parse(data); // eslint-disable-line
  manifest.version = version; // eslint-disable-line
  await fs.writeFile(
    "./package.json",
    JSON.stringify(manifest, null, 2) + "\n"
  );
} catch (err) {
  console.error("Can't update 'package.json' version", err);
}
