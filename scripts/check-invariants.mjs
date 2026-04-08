#!/usr/bin/env node
/**
 * Wick invariant checker.
 *
 * Enforces non-obvious rules that cannot (or should not) be expressed as
 * ESLint rules. Run in CI. See docs/GOTCHAS.md for the "why" behind each
 * invariant.
 *
 * Usage: node scripts/check-invariants.mjs
 * Exit code 0 = clean, 1 = violations.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PACKAGES_DIR = join(ROOT, 'packages');

/** @type {{ file: string; line: number; rule: string; message: string }[]} */
const violations = [];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (st.isFile() && /\.ts$/.test(entry) && !/\.test\.ts$/.test(entry)) yield full;
  }
}

/**
 * Invariant 1 (GOTCHAS #1): no class extending LitElement may define
 * a method named `update(...)`.
 *
 * We parse line-by-line for two cheap signals:
 *   - a line declaring a class that extends (Lit|Wick)Element
 *   - after that, a line inside the class that looks like `update(`
 *     and is NOT `this.update(` / `super.update(` / a string
 */
function checkNoUpdateOverride(file, source) {
  const lines = source.split('\n');
  let inLitClass = false;
  let braceDepth = 0;
  let classStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');

    // Detect entry into a Lit-extending class
    const classMatch = stripped.match(/class\s+(\w+)\s+extends\s+(LitElement|WickElement)\b/);
    if (classMatch && !inLitClass) {
      inLitClass = true;
      braceDepth = 0;
      classStartLine = i + 1;
    }

    if (inLitClass) {
      for (const ch of stripped) {
        if (ch === '{') braceDepth++;
        else if (ch === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            inLitClass = false;
            break;
          }
        }
      }

      // Only check lines that are inside the class body (depth >= 1)
      // and look like a method declaration (not a call)
      if (inLitClass && braceDepth >= 1 && i > classStartLine) {
        // Match: optional access modifiers, then `update(` as a method decl.
        // Reject: `this.update(`, `super.update(`, `.update(`
        const methodMatch = stripped.match(
          /^\s*(?:override\s+|public\s+|protected\s+|private\s+|async\s+)*update\s*\(/,
        );
        if (methodMatch && !/[.\w]update\s*\(/.test(stripped)) {
          violations.push({
            file: relative(ROOT, file),
            line: i + 1,
            rule: 'no-lit-update-override',
            message:
              'Class extends LitElement and defines update(). This shadows ' +
              "Lit's reactive update cycle. Rename to patch(), applyUpdate(), " +
              'or applyDelta(). See docs/GOTCHAS.md #1.',
          });
        }
      }
    }
  }
}

/**
 * Invariant 2 (GOTCHAS #2): component test files must side-effect import
 * the component module, not only `import type`.
 */
function checkTestSideEffectImport(file, source) {
  // Only apply to *.test.ts colocated with a wick-*.ts component
  if (!/\/wick-[\w-]+\.test\.ts$/.test(file)) return;
  const componentRel = file.replace(/\.test\.ts$/, '.js');
  const componentBase = componentRel.split('/').pop();
  if (!componentBase) return;

  // Look for any side-effect import of the component module
  const sideEffectRe = new RegExp(
    `^\\s*import\\s+['"]\\./${componentBase.replace('.', '\\.')}['"]`,
    'm',
  );
  // Or an import with bindings (non-type-only)
  const valueImportRe = new RegExp(
    `^\\s*import\\s+(?!type\\b)[\\s\\S]*?\\s+from\\s+['"]\\./${componentBase.replace('.', '\\.')}['"]`,
    'm',
  );

  if (!sideEffectRe.test(source) && !valueImportRe.test(source)) {
    violations.push({
      file: relative(ROOT, file),
      line: 1,
      rule: 'test-side-effect-import',
      message:
        `Test file does not side-effect import ${componentBase}. ` +
        'Type-only imports get tree-shaken and the @customElement decorator ' +
        'never runs. Add `import \'./' +
        componentBase +
        "'` at the top. See docs/GOTCHAS.md #2.",
    });
  }
}

// ─── Main ──────────────────────────────────────────────────────────────
let filesScanned = 0;
for (const file of walk(PACKAGES_DIR)) {
  const source = readFileSync(file, 'utf8');
  filesScanned++;
  if (!/\.test\.ts$/.test(file)) checkNoUpdateOverride(file, source);
  else checkTestSideEffectImport(file, source);
}

// Also scan test files for the side-effect rule
for (const file of walk(PACKAGES_DIR)) {
  if (/\.test\.ts$/.test(file)) {
    const source = readFileSync(file, 'utf8');
    checkTestSideEffectImport(file, source);
  }
}

if (violations.length === 0) {
  console.log(`✓ check-invariants: ${filesScanned} files scanned, no violations.`);
  process.exit(0);
}

console.error(`✗ check-invariants: ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
  console.error(`    ${v.message}\n`);
}
process.exit(1);
