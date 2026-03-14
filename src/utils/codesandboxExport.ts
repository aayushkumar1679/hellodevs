// src/utils/codesandboxExport.ts
import {  Project  } from "@/state/useProjectStore";

export interface CodeSandboxPayload {
  files: {
    [key: string]: {
      content: string;
      isBinary?: boolean;
    };
  };
  template?: string;
  description?: string;
  tags?: string[];
}

export function generateCodeSandboxPayload(
  project: Project,
  code: string,
  framework: string
): CodeSandboxPayload {
  const projectSlug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Determine template based on framework
  let template = "create-react-app";
  let packageJson: any = {
    name: projectSlug,
    version: "1.0.0",
    description: `${project.name} - Generated from CanvasBuilder`,
    main: "index.js",
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
    },
    scripts: {
      start: "react-scripts start",
      build: "react-scripts build",
      test: "react-scripts test",
      eject: "react-scripts eject",
    },
    eslintConfig: {
      extends: ["react-app"],
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
  };

  // Configure based on framework
  switch (framework) {
    case "nextjs-app":
      template = "next";
      packageJson.dependencies = {
        next: "^14.0.0",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      };
      packageJson.scripts = {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      };
      break;
    case "vue-tailwind":
      template = "vue";
      packageJson.dependencies = {
        vue: "^3.3.0",
      };
      break;
    case "svelte-tailwind":
      template = "svelte";
      packageJson.dependencies = {
        svelte: "^4.0.0",
      };
      break;
  }

  return {
    files: {
      "package.json": {
        content: JSON.stringify(packageJson, null, 2),
      },
      "public/index.html": {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="${project.name} - Generated from CanvasBuilder"
    />
    <title>${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
      },
      "src/index.js": {
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      "src/App.jsx": {
        content: code,
      },
    },
    template,
    description: `${project.name} - Generated from CanvasBuilder`,
    tags: ["canvasbuilder", "generated", framework],
  };
}

export function openInCodeSandbox(payload: CodeSandboxPayload) {
  const parameters = {
    files: payload.files,
  };

  const encodedPayload = encodeURIComponent(JSON.stringify(parameters));
  const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${encodedPayload}&query=file=/src/App.jsx`;

  window.open(url, "_blank");
}

export function openInStackBlitz(payload: CodeSandboxPayload) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://stackblitz.com/run";
  form.target = "_blank";

  Object.entries(payload.files).forEach(([key, file]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = `files[${key}]`;
    input.value = file.content;
    form.appendChild(input);
  });

  const titleInput = document.createElement("input");
  titleInput.type = "hidden";
  titleInput.name = "title";
  titleInput.value = payload.description || "Project";
  form.appendChild(titleInput);

  const templateInput = document.createElement("input");
  templateInput.type = "hidden";
  templateInput.name = "template";
  templateInput.value = payload.template || "node";
  form.appendChild(templateInput);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
