import { generateNextJsProject } from "../src/utils/exporter";

const mockProject = {
  id: "test-id",
  name: "Test Project",
  components: {
    "root-1": {
      id: "root-1",
      type: "section",
      props: {},
      children: ["child-1"]
    },
    "child-1": {
      id: "child-1",
      type: "heading",
      props: { text: "Hello Polyglot", level: 1 },
      children: []
    }
  },
  designElements: {
    "root-1": {
      id: "root-1",
      type: "section",
      cssProperties: {
        base: { backgroundColor: "#f0f0f0", padding: "40px" }
      }
    },
    "child-1": {
      id: "child-1",
      type: "heading",
      cssProperties: {
        base: { color: "#333333", fontSize: "48px" }
      }
    }
  },
  rootOrder: ["root-1"],
  rootComponent: "root-1"
};

const files = generateNextJsProject(mockProject as any, mockProject.designElements as any);

console.log("Generated Files:");
files.forEach(f => {
  console.log(`--- ${f.name} ---`);
  if (f.name.endsWith(".json")) {
    console.log(JSON.stringify(JSON.parse(f.content), null, 2).slice(0, 200) + "...");
  } else {
    console.log(f.content.slice(0, 500) + "...");
  }
});
