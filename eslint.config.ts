import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn", // Warn about unused variables
      "no-undef": "warn", // Warn about undefined variables,
      curly: "error", // Enforce consistent use of curly braces for all control statements
      semi: ["error", "always"], // require semicolons
      quotes: ["error", "double"], // enforce the consistent use of double quotes
      indent: ["error", 2], // enforce consistent indentation of 2 spaces
      "object-curly-spacing": ["error", "always"], // enforce consistent spacing inside braces
    },
  },
]);
