const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace imports
  if (content.includes('@/state/useCanvasStore') || content.includes('@/state/useDesignStore') || content.includes('./useCanvasStore') || content.includes('../useDesignStore') || content.includes('../useCanvasStore') || content.includes('./useDesignStore') || content.includes('../../../state/useCanvasStore')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"](@\/state\/useCanvasStore|@\/state\/useDesignStore|\.\/useCanvasStore|\.\/useDesignStore|\.\.\/useDesignStore|\.\.\/useCanvasStore|\.\.\/\.\.\/\.\.\/state\/useCanvasStore)['"]/g, (match, imports) => {
      // If it only imports Project/Element/etc, we leave it for manual fix, or replace with useProjectStore
      // For now, let's just blindly replace the store names
      return `import { ${imports} } from "@/state/useProjectStore"`;
    });
    
    content = content.replace(/import\s+type\s+{([^}]*)}\s+from\s+['"](@\/state\/useCanvasStore|@\/state\/useDesignStore)['"]/g, (match, imports) => {
      return `import type { ${imports} } from "@/state/useProjectStore"`;
    });
    
    // Replace standalone hook calls
    content = content.replace(/useCanvasStore\s*\(/g, 'useProjectStore(');
    content = content.replace(/useCanvasStore\./g, 'useProjectStore.');
    content = content.replace(/useDesignStore\s*\(/g, 'useProjectStore(');
    content = content.replace(/useDesignStore\./g, 'useProjectStore.');
    
    changed = true;
  }

  // Remove useSyncStores imports and usage
  if (content.includes('useSyncStores')) {
    content = content.replace(/import\s*({\s*useSyncStores\s*}|useSyncStores)\s*from\s*['"]@\/hooks\/useSyncStores['"];?\n?/g, '');
    content = content.replace(/\s*useSyncStores\(\);\n?/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
