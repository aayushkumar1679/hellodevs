import type { CanvasElement } from "@/lib/codeSync/canvasToCode";

// ─────────────────────────────────────────────────────────────────────────────
// parsePropsString
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lightweight JSX props string parser — no Babel required.
 * Handles:
 *   - string:  key="value"
 *   - JSON:    key={expr}  (numbers, booleans, objects, arrays)
 *   - bare:    key          (boolean true)
 *
 * @param propsStr - raw text between the opening tag name and the `>` / `/>`
 * @returns Record of parsed prop values
 */
export function parsePropsString(propsStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!propsStr.trim()) return result;

  // Match patterns:
  //  key="..."  → string (groups: 1=key, 2=value)
  //  key={...}  → expression (groups: 3=key, 4=value)
  //  key        → boolean true (group 5=key)
  const PROP_RE =
    /([a-zA-Z_][\w]*)\s*=\s*"([^"]*)"|([a-zA-Z_][\w]*)\s*=\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|([a-zA-Z_][\w]*)/g;

  let m: RegExpExecArray | null;
  while ((m = PROP_RE.exec(propsStr)) !== null) {
    if (m[1] !== undefined) {
      // key="value"
      result[m[1]] = m[2];
    } else if (m[3] !== undefined) {
      // key={expr}
      const raw = m[4].trim();
      try {
        // Try JSON parse for numbers / booleans / arrays / objects
        result[m[3]] = JSON.parse(raw);
      } catch {
        // Leave as raw string for complex expressions
        result[m[3]] = raw;
      }
    } else if (m[5] !== undefined) {
      // bare key → boolean
      result[m[5]] = true;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// parseJSXToElements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the return statement body from a React function component TSX source.
 * Returns the JSX content string between the outermost `return (` … `)`.
 */
function extractReturnJSX(source: string): string {
  const returnMatch = source.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/);
  return returnMatch ? returnMatch[1].trim() : source.trim();
}

/**
 * Lightweight, regex-based JSX → CanvasElement[] parser.
 * Handles self-closing and paired tags with nesting.
 * On any parse error returns [].
 *
 * Limitations (by design — no Babel dependency):
 * - Does not parse JS expressions inside children.
 * - Ignores text-only nodes.
 * - Stops recursing past depth 10 to avoid runaway loops.
 */
export function parseJSXToElements(jsx: string): CanvasElement[] {
  let pos = 0;
  let uid = 0;
  const MAX_DEPTH = 10;

  function nextId() {
    return `parsed_${++uid}`;
  }

  function skipWhitespace() {
    while (pos < jsx.length && /\s/.test(jsx[pos])) pos++;
  }

  /** Read a JSX tag starting at pos (pos must be at '<').
   *  Returns null on failure or text nodes / comments. */
  function readElement(depth: number): CanvasElement | null {
    if (depth > MAX_DEPTH) return null;
    skipWhitespace();
    if (pos >= jsx.length || jsx[pos] !== "<") return null;

    // Skip comments: <!-- -->
    if (jsx.startsWith("<!--", pos)) {
      const end = jsx.indexOf("-->", pos + 4);
      pos = end >= 0 ? end + 3 : jsx.length;
      return null;
    }

    // Skip closing tags
    if (jsx[pos + 1] === "/") return null;

    // Skip {…} expression blocks
    if (jsx[pos] === "{") {
      const end = jsx.indexOf("}", pos + 1);
      pos = end >= 0 ? end + 1 : jsx.length;
      return null;
    }

    pos++; // consume '<'

    // Read tag name
    const tagStart = pos;
    while (pos < jsx.length && /[a-zA-Z0-9._-]/.test(jsx[pos])) pos++;
    const tagName = jsx.slice(tagStart, pos);
    if (!tagName) return null;

    // Read attributes up to '>' or '/>'
    const attrStart = pos;
    let selfClose = false;
    let braceDepth = 0;

    while (pos < jsx.length) {
      const ch = jsx[pos];
      if (ch === "{") { braceDepth++; pos++; }
      else if (ch === "}") { braceDepth--; pos++; }
      else if (braceDepth === 0 && ch === "/" && jsx[pos + 1] === ">") {
        selfClose = true;
        pos += 2;
        break;
      } else if (braceDepth === 0 && ch === ">") {
        pos++;
        break;
      } else {
        pos++;
      }
    }

    const attrStr = jsx.slice(attrStart, selfClose ? pos - 2 : pos - 1).trim();
    const props = parsePropsString(attrStr);

    // Extract style prop → styles
    const styles: Record<string, string> = {};
    if (typeof props.style === "object" && props.style !== null) {
      for (const [k, v] of Object.entries(props.style as Record<string, unknown>)) {
        styles[k] = String(v);
      }
      delete props.style;
    }

    const el: CanvasElement = {
      id: nextId(),
      type: tagName,
      props,
      styles,
      children: [],
    };

    if (selfClose) return el;

    // Read children until matching closing tag
    const closingTag = `</${tagName}>`;
    let childDepth = 0;

    while (pos < jsx.length) {
      skipWhitespace();
      if (pos >= jsx.length) break;

      // Check for nested same-tag (to track depth for nested identical tags)
      if (jsx.startsWith(`<${tagName}`, pos) && /[\s/>]/.test(jsx[pos + 1 + tagName.length] ?? ">")) {
        childDepth++;
      }

      if (jsx.startsWith(closingTag, pos)) {
        if (childDepth > 0) {
          childDepth--;
          pos += closingTag.length;
          continue;
        }
        pos += closingTag.length;
        break;
      }

      if (jsx[pos] === "<" && jsx[pos + 1] !== "/") {
        const child = readElement(depth + 1);
        if (child) el.children.push(child);
      } else if (jsx[pos] === "{") {
        // skip expression block
        const end = jsx.indexOf("}", pos + 1);
        pos = end >= 0 ? end + 1 : jsx.length;
      } else {
        pos++;
      }
    }

    return el;
  }

  function parseAll(): CanvasElement[] {
    const elements: CanvasElement[] = [];
    while (pos < jsx.length) {
      skipWhitespace();
      if (pos >= jsx.length) break;
      if (jsx[pos] === "<") {
        const el = readElement(0);
        if (el) elements.push(el);
      } else if (jsx[pos] === "{") {
        const end = jsx.indexOf("}", pos + 1);
        pos = end >= 0 ? end + 1 : jsx.length;
      } else {
        pos++;
      }
    }
    return elements;
  }

  try {
    return parseAll();
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// codeToCanvas (main entry point)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a .tsx source string back to a CanvasElement array.
 *
 * - Uses lightweight regex-based parsing (no Babel dependency).
 * - On any parse failure, returns [] — never crashes the canvas.
 * - Designed to run debounced ~300 ms after Monaco content changes.
 *
 * @param tsxSource - Full content of a .tsx component file
 * @returns Top-level CanvasElement array parsed from the JSX return statement
 */
export function codeToCanvas(tsxSource: string): CanvasElement[] {
  try {
    const returnJSX = extractReturnJSX(tsxSource);
    if (!returnJSX) return [];
    return parseJSXToElements(returnJSX);
  } catch {
    return [];
  }
}
