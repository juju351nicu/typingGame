import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import vue from "eslint-plugin-vue";
import vueAccessibility from "eslint-plugin-vuejs-accessibility";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "blog_store/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...vueAccessibility.configs["flat/recommended"],
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "vue/multi-word-component-names": "off",
      "vue/valid-v-slot": ["error", { allowModifiers: true }],
      // BlogPost.vueの1箇所だけで、DOMPurifyを通したHTMLを表示する。
      "vue/no-v-html": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
  eslintConfigPrettier
);
