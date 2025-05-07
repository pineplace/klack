import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    ".github/",
    ".vscode/",
    "coverage/",
    "node_modules/",
    "public/",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:react/recommended",
      "prettier",
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      react,
      "react-hooks": fixupPluginRules(reactHooks),
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        tsconfigRootDir: "./",
        project: "./tsconfig.json",

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prettier/prettier": ["warn"],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/unbound-method": [
        "warn",
        {
          ignoreStatic: true,
        },
      ],
    },
  },
  {
    files: ["**/*.mjs"],
    extends: compat.extends("eslint:recommended", "prettier"),

    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "prettier/prettier": ["warn"],
    },
  },
]);
