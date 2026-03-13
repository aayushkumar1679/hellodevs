import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy prototypes and dead files not wired into the current product.
    "src/app/components/export/**",
    "src/app/components/editor/CSSPropertyPanel.tsx",
    "src/app/components/canvas/SelectionBox.tsx",
    "src/test-export.ts",
    "src/utils/advancedCodeGenerator.ts",
    "src/utils/codeGenerator.ts",
    "src/utils/codesandboxExport.ts",
    "src/utils/exportUtils.ts",
    "src/utils/undoRedo.ts",
  ]),
]);

export default eslintConfig;
