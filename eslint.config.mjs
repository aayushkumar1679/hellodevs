import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/app/components/export/**",
      "src/app/components/editor/CSSPropertyPanel.tsx",
      "src/app/components/canvas/SelectionBox.tsx",
      "src/test-export.ts",
      "src/utils/advancedCodeGenerator.ts",
      "src/utils/codeGenerator.ts",
      "src/utils/codesandboxExport.ts",
      "src/utils/exportUtils.ts",
      "src/utils/undoRedo.ts",
    ],
  },
];

export default eslintConfig;
