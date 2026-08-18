import nextConfig from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";
import reactCompiler from "eslint-plugin-react-compiler";

const eslintConfig = [
  ...nextConfig,
  reactCompiler.configs.recommended,
  eslintConfigPrettier,
];

export default eslintConfig;
