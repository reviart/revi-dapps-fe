import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: "readonly",
        window: "readonly",
        process: "readonly",
        console: "readonly",
        TextEncoder: "readonly",
        btoa: "readonly",
        test: "readonly",
        expect: "readonly"
      }
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin
    },
    rules: {
      "no-unused-vars": ["error", { 
        "vars": "all",
        "args": "none",
        "varsIgnorePattern": "^(React|_)",
        "ignoreRestSiblings": true
      }],
      "no-var": "error",
      "prefer-const": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/no-duplicates": "error"
    },
    settings: {
      react: {
        version: "detect",
        createClass: "createReactClass",
        pragma: "React",
        fragment: "Fragment"
      }
    }
  }
];
