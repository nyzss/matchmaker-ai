// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "@repo/eslint-config/base";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    baseConfig
);
