import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "convex/_generated/**",
      "Search/**",
      "src/data/**/*.json",
      "scraper/**",
      "scripts/**",
      "**/*.ndjson",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["convex/**/*.{ts,tsx,js}"],
    rules: {
      // Convex handlers still use contextual `any` in several hot paths; tighten in a later typing pass.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
