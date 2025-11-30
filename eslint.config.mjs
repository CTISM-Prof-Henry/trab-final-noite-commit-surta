import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

// Configuração simples focada em JavaScript (projeto não usa React)
export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
]);
