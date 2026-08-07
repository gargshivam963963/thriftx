import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const IGNORED_DIRS = ['node_modules', '.next', 'public', 'dist', 'build'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) await processFile(full);
  }
}

function parseButtonVariants(callText) {
  const m = callText.match(/buttonVariants\s*\(\s*\{([\s\S]*?)\}\s*\)/s);
  if (!m) return { attrs: '' };
  const obj = m[1];
  const pairs = {};
  for (const part of obj.split(',')) {
    const kv = part.split(':').map(s => s.trim());
    if (kv.length >= 2) {
      const k = kv[0];
      let v = kv.slice(1).join(':').trim();
      v = v.replace(/^['\"]|['\"]$/g, '');
      pairs[k] = v;
    }
  }
  const attrs = Object.entries(pairs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return { attrs };
}

async function processFile(file) {
  let raw = await fs.readFile(file, 'utf8');
  if (!/buttonVariants\s*\(/.test(raw)) return;

  let out = raw;
  const regex = /<(Link|a)([\s\S]*?)className=\{cn\(([^\)]*?buttonVariants\([^\)]*?\)[^\)]*?)\)\}([\s\S]*?)>([\s\S]*?)<\/\1>/g;

  let match;
  let changed = false;
  while ((match = regex.exec(raw)) !== null) {
    const full = match[0];
    const tag = match[1];
    const beforeAttrs = match[2];
    const variantsCall = match[3];
    const afterAttrs = match[4];
    const inner = match[5];

    const vbMatch = variantsCall.match(/buttonVariants\s*\(\s*\{([\s\S]*?)\}\s*\)/s);
    const variantsObj = vbMatch ? `{${vbMatch[1]}}` : null;
    const parsed = variantsObj ? parseButtonVariants('buttonVariants(' + variantsObj + ')') : { attrs: '' };
    const attrs = parsed.attrs;

    const otherAttrs = (beforeAttrs + ' ' + afterAttrs).replace(/\s+/g, ' ').trim();
    const reconstructedOpen = `<${tag}${otherAttrs ? ' ' + otherAttrs.trim() : ''}>`;

    const extraClassExpression = variantsCall.replace(/buttonVariants\s*\([^\)]*\)\s*,?\s*/s, '').trim();
    const classProp = extraClassExpression ? `className={${extraClassExpression}}` : '';

    const buttonOpen = `<Button asChild ${attrs} ${classProp}>\n  ${reconstructedOpen}`;
    const replacement = buttonOpen + inner + `</${tag}>\n</Button>`;

    out = out.replace(full, replacement);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(file, out, 'utf8');
    console.log('Wrapped Link/a buttons in:', file);
  }
}

(async () => {
  console.log('Wrapping Link/a elements using buttonVariants with Button asChild...');
  await walk(ROOT);
  console.log('Done.');
})();
