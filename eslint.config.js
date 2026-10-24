import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    // TypeScript already checks names; this rule can't see generics declared on <script generics="T">
    files: ["**/*.ts", "**/*.svelte"],
    rules: { "no-undef": "off" },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // {@html} is only used for our own SVG strings (icons, watch faces, scene art), never for PDF or user text
      "svelte/no-at-html-tags": "off",
    },
  },
  { ignores: ["dist/", "src-tauri/target/", "node_modules/", "playwright-report/", "test-results/"] },
);
