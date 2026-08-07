import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

const recommendedTsdoc = jsdoc.configs["flat/recommended-tsdoc"];

export default [
  {
    ignores: ["dist/**", "dist-debug/**", "examples-dist/**", "node_modules/**", "test.js", "test.ts"],
  },
  ...tseslint.configs.recommended,
  {
    name: "jsbox-cview/typescript-compatibility",
    files: ["index.ts", "components/**/*.ts", "controller/**/*.ts", "utils/**/*.ts", "examples/**/*.ts"],
    rules: {
      // JSBox callback signatures often require parameters that a particular handler does not use.
      "@typescript-eslint/no-unused-vars": "off",
      // Objective-C bridge values and heterogeneous JSBox definitions do not have complete static types.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Short-circuit callback dispatch is an established JSBox pattern in this codebase.
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],
    },
  },
  {
    name: "jsbox-cview/commonjs-tests",
    files: ["tests/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-this-alias": "off",
    },
  },
  {
    ...recommendedTsdoc,
    name: "jsbox-cview/tsdoc",
    files: ["index.ts", "components/**/*.ts", "controller/**/*.ts", "utils/**/*.ts"],
    languageOptions: {
      ...recommendedTsdoc.languageOptions,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      ...recommendedTsdoc.rules,

      // Destructured option objects are documented on their TypeScript interfaces.
      "jsdoc/check-param-names": ["warn", { checkDestructured: false }],
      "jsdoc/require-param": [
        "warn",
        {
          checkDestructured: false,
          checkDestructuredRoots: false,
        },
      ],

      // Introduce documentation coverage incrementally and without blocking builds.
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: {
            cjs: false,
            esm: true,
            window: false,
          },
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSEnumDeclaration"],
        },
      ],
    },
  },
];
