export type ClawdTask = {
  id: string;
  label: string;
  description: string;
};

export const CLAWD_TASKS: ClawdTask[] = [
  {
    id: "deploy",
    label: "Deploy",
    description: "Deploy the current project to your hosting provider.",
  },
  {
    id: "push",
    label: "Push to GitHub",
    description: "Push the current project to a GitHub repository.",
  },
  {
    id: "email",
    label: "Send Email",
    description: "Send a project update email to a client.",
  },
  {
    id: "buy-domain",
    label: "Buy Domain",
    description: "Purchase a domain name and attach it to the project.",
  },
  {
    id: "generate-images",
    label: "Generate Images",
    description: "Generate image assets for the current project.",
  },
];
