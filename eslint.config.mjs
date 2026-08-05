import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

const recommendedTsdoc = jsdoc.configs["flat/recommended-tsdoc"];

export default [
  {
    ignores: ["dist/**", "dist-debug/**", "node_modules/**", "test.js", "test.ts"],
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
