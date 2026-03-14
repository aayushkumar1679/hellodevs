import {  CanvasComponent  } from "@/state/useProjectStore";
import {  Element  } from "@/state/useProjectStore";

export interface ExportOptions {
  format: "react" | "tailwind" | "css";
  withComments?: boolean;
  prettify?: boolean;
}

function cssPropertiesToStyle(cssProps: Record<string, any>): string {
  return Object.entries(cssProps)
    .map(([key, value]) => {
      const camelKey = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      return `${camelKey}: '${value}'`;
    })
    .join(", ");
}

function cssPropertiesToTailwind(cssProps: Record<string, any>): string[] {
  const tailwindClasses: string[] = [];

  if (cssProps.display === "flex") tailwindClasses.push("flex");
  if (cssProps.display === "grid") tailwindClasses.push("grid");

  if (cssProps.flexDirection === "column") tailwindClasses.push("flex-col");
  if (cssProps.justifyContent === "center")
    tailwindClasses.push("justify-center");
  if (cssProps.alignItems === "center") tailwindClasses.push("items-center");

  if (cssProps.width) tailwindClasses.push(`w-[${cssProps.width}]`);
  if (cssProps.height) tailwindClasses.push(`h-[${cssProps.height}]`);

  if (cssProps.padding) tailwindClasses.push(`p-[${cssProps.padding}]`);
  if (cssProps.margin) tailwindClasses.push(`m-[${cssProps.margin}]`);
  if (cssProps.gap) tailwindClasses.push(`gap-[${cssProps.gap}]`);

  if (cssProps.fontSize) tailwindClasses.push(`text-[${cssProps.fontSize}]`);
  if (cssProps.fontWeight === "bold" || cssProps.fontWeight === "700")
    tailwindClasses.push("font-bold");

  if (cssProps.backgroundColor)
    tailwindClasses.push(`bg-[${cssProps.backgroundColor}]`);
  if (cssProps.color) tailwindClasses.push(`text-[${cssProps.color}]`);

  if (cssProps.borderRadius)
    tailwindClasses.push(`rounded-[${cssProps.borderRadius}]`);

  return tailwindClasses;
}

export function generateReactWithStyles(
  components: Record<string, CanvasComponent>,
  elements: Record<string, Element>
): string {
  let code = `import React from 'react';

export default function Design() {
  return (
`;

  Object.values(components).forEach((component) => {
    const element = elements[component.id];
    const styles = element?.cssProperties || {};
    const styleString = cssPropertiesToStyle(styles);

    code += `    <div style={{ ${styleString} }}>
`;
    if (component.children.length > 0) {
      component.children.forEach((childId) => {
        const childElement = elements[childId];
        if (childElement) {
          const childStyles = cssPropertiesToStyle(
            childElement.cssProperties || {}
          );
          code += `      <div style={{ ${childStyles} }}>Child Content</div>
`;
        }
      });
    }
    code += `    </div>
`;
  });

  code += `  );
}
`;

  return code;
}

export function generateTailwindCode(
  components: Record<string, CanvasComponent>,
  elements: Record<string, Element>
): string {
  let code = `import React from 'react';

export default function Design() {
  return (
    <div className="flex flex-col w-full h-full">
`;

  Object.values(components).forEach((component) => {
    const element = elements[component.id];
    const tailwindClasses = cssPropertiesToTailwind(
      element?.cssProperties || {}
    );
    const classList = tailwindClasses.join(" ");

    code += `      <div className="${classList}">
`;
    if (component.children.length > 0) {
      component.children.forEach(() => {
        code += `        <div className="p-4">Child Content</div>
`;
      });
    }
    code += `      </div>
`;
  });

  code += `    </div>
  );
}
`;

  return code;
}

export function generateCSSModule(
  components: Record<string, CanvasComponent>,
  elements: Record<string, Element>
): { css: string; jsx: string } {
  let css = "";
  let jsx = `import React from 'react';
import styles from './Design.module.css';

export default function Design() {
  return (
`;

  Object.values(components).forEach((component, index) => {
    const element = elements[component.id];
    const className = `component${index}`;

    css += `.${className} {
`;
    Object.entries(element?.cssProperties || {}).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      css += `  ${cssKey}: ${value};
`;
    });
    css += `}

`;

    jsx += `    <div className={styles.${className}}>
`;
    if (component.children.length > 0) {
      component.children.forEach(() => {
        jsx += `      <div>Child Content</div>
`;
      });
    }
    jsx += `    </div>
`;
  });

  jsx += `  );
}
`;

  return { css, jsx };
}

export function generateCode(
  components: Record<string, CanvasComponent>,
  elements: Record<string, Element>,
  options: ExportOptions
): string {
  switch (options.format) {
    case "react":
      return generateReactWithStyles(components, elements);
    case "tailwind":
      return generateTailwindCode(components, elements);
    case "css":
      const { jsx } = generateCSSModule(components, elements);
      return jsx;
    default:
      return "";
  }
}
