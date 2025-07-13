import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist",
      "backend/venv/**/*",
      "backend/media/**/*",
      "public/sw.js",
      "backend/venv/Lib/site-packages/django/contrib/admin/static/admin/**/*",
      "backend/venv/Lib/site-packages/django/views/templates/**/*",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "tests/**/*.test.js",
      "tests/**/*.test.jsx"
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "no-empty": "warn",
      "no-useless-catch": "warn",
      "prefer-const": "warn",
      "prefer-rest-params": "warn",
      "no-useless-escape": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
