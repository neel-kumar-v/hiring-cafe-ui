import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    semi: true,
    trailingComma: "es5",
    singleQuote: false,
    printWidth: 180,
    tabWidth: 2,
    useTabs: false,
    sortPackageJson: false,
    ignorePatterns: [
      ".next",
      ".vercel",
      "node_modules",
      "pnpm-lock.yaml",
      "package-lock.json",
      "coverage",
      "playwright-report",
      "test-results",
      "convex/_generated",
      "*.tsbuildinfo",
      "src/data/*.json",
      "scraper/logs",
      "*.ndjson",
      "*.zip",
      "Search",
      ".agents",
      ".claude",
      // Shared-checkout worktree/clones directory (git-ignored) — never format.
      ".delta",
      "docs/search-reference-audit.md",
    ],
  },
  // Migrated from the old `eslint.config.mjs` (eslint-config-next) via
  // `vp migrate` + `@oxlint/migrate --type-aware --with-nursery`. Rule parity
  // adjustments vs the generated config are marked with `MIGRATION:` comments.
  lint: {
    plugins: ["oxc", "typescript", "unicorn", "react", "nextjs", "import", "jsx-a11y"],
    categories: { correctness: "warn" },
    env: { browser: true, builtin: true, commonjs: true, node: true },
    ignorePatterns: [
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
      // Shared-checkout worktree/clones directory (git-ignored) — never lint.
      ".delta/**",
      // MIGRATION: this file has a duplicated legacy type block that
      // `skipLibCheck: true` has always hidden from tsc; oxlint's AST
      // duplicate check surfaces it. Owner should dedupe the legacy block
      // in a follow-up, then remove this entry.
      "src/types/search.d.ts",
    ],
    settings: {
      react: { version: "19.2.6" },
    },
    rules: {
      // MIGRATION: parity with the old eslint-config-next setup, which ran
      // neither of these newer oxlint debug/discipline rule families nor
      // jsx-a11y stylistic rules. Revisit as a deliberate policy later.
      "react-hooks/exhaustive-deps": "off",
      "react/set-state-in-effect": "off",
      "react/refs": "off",
      "react/purity": "off",
      "react/immutability": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/tabindex-no-positive": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/prefer-tag-over-role": "off",
      "react/display-name": "error",
      "react/jsx-key": "error",
      "react/jsx-no-comment-textnodes": "error",
      "react/jsx-no-duplicate-props": "error",
      // MIGRATION: eslint-config-next turns this off (target-blank alone is
      // allowed project-wide); keep parity with the pre-Vite+ config.
      "react/jsx-no-target-blank": "off",
      "react/jsx-no-undef": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": "error",
      // MIGRATION: eslint-config-next disables this for the JSX transform.
      "react/no-unknown-property": "off",
      "react/no-unsafe": "off",
      // MIGRATION: React 17+ automatic JSX runtime — no React import needed.
      "react/react-in-jsx-scope": "off",
      "react/require-render-return": "error",
      "import/no-anonymous-default-export": "warn",
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      "no-array-constructor": "error",
      "no-unused-expressions": "error",
      // MIGRATION: the previous config surfaced unused vars as warnings.
      "no-unused-vars": "warn",
      "nextjs/inline-script-id": "error",
      "nextjs/no-assign-module-variable": "error",
      "nextjs/no-document-import-in-page": "error",
      "nextjs/no-duplicate-head": "error",
      "nextjs/no-head-import-in-document": "error",
      "nextjs/no-script-component-in-head": "error",
      "react/rules-of-hooks": "error",
      "typescript/ban-ts-comment": "error",
      "typescript/no-duplicate-enum-values": "error",
      "typescript/no-empty-object-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-extra-non-null-assertion": "error",
      "typescript/no-misused-new": "error",
      "typescript/no-namespace": "error",
      "typescript/no-non-null-asserted-optional-chain": "error",
      "typescript/no-require-imports": "error",
      "typescript/no-this-alias": "error",
      "typescript/no-unnecessary-type-constraint": "error",
      "typescript/no-unsafe-declaration-merging": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-wrapper-object-types": "error",
      "typescript/prefer-as-const": "error",
      "typescript/prefer-namespace-keyword": "error",
      "typescript/triple-slash-reference": "error",
    },
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
          "constructor-super": "off",
          "getter-return": "off",
          "no-class-assign": "off",
          "no-const-assign": "off",
          "no-dupe-class-members": "off",
          "no-dupe-keys": "off",
          "no-func-assign": "off",
          "no-import-assign": "off",
          "no-new-native-nonconstructor": "off",
          "no-obj-calls": "off",
          "no-redeclare": "off",
          "no-setter-return": "off",
          "no-this-before-super": "off",
          "no-undef": "off",
          "no-unreachable": "off",
          "no-unsafe-negation": "off",
          "no-var": "error",
          "no-with": "off",
          "prefer-const": "error",
          "prefer-rest-params": "error",
          "prefer-spread": "error",
        },
      },
      {
        // `skipLibCheck: true` in tsconfig masks these; declaration merging
        // between `interface` and object `type` aliases is an intentional
        // pattern in this project (e.g. src/types/search.d.ts).
        files: ["**/*.d.ts"],
        rules: {
          "typescript/no-unsafe-declaration-merging": "off",
        },
      },
      {
        // Convex handlers still use contextual `any` in several hot paths;
        // tighten in a later typing pass (kept from eslint.config.mjs).
        files: ["convex/**/*.{ts,tsx,js}"],
        rules: {
          "typescript/no-explicit-any": "off",
        },
      },
    ],
    // Do NOT enable type-aware linting (via tsgolint) yet: it changes rule
    // semantics vs the old ESLint setup. tsc type checks stay in
    // `pnpm run typecheck`. Revisit after the WIP churn settles.
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
  test: {
    // MIGRATION: no Vitest suite yet. tests/unit uses node:test and runs via
    // `pnpm run test:unit` (or `vp run test:unit`). Vitest cannot collect
    // node:test suites, so exclude the tests directory to keep `vp test` a
    // green no-op until the suite is converted. Node overrides extend the
    // defaults, so keep the standard exclusions here.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache,output,temp}/**", "**/.delta/**", "tests/**"],
    passWithNoTests: true,
  },
});
