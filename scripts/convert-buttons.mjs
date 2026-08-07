import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const IGNORED_DIRS = ['node_modules', '.next', 'public', 'dist', 'build'];
const TARGET_IMPORT = "import { Button } from '@/components/ui/button';";

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) await processFile(full);
  }
}

async function processFile(file) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    if (!/\<button\b/.test(raw)) return;

    let out = raw.replace(/<button\b/g, '<Button').replace(/<\/button>/g, '</Button>');

    if (out === raw) return;

    // Skip node_modules files just in case
    if (file.includes('node_modules')) return;

    // Add import if missing
    if (!/from\s+['"]@\/components\/ui\/button['"]/.test(out)) {
      // place after 'use client' if present
      const useClientMatch = out.match(/^(['\"]use client['\"];\s*)/);
      if (useClientMatch) {
        const idx = useClientMatch[0].length;
        out = out.slice(0, idx) + '\n' + TARGET_IMPORT + out.slice(idx);
      } else {
        // try to insert after first block of imports
        const importBlock = out.match(/^(?:import .*\n)+/);
        if (importBlock) {
          const block = importBlock[0];
          out = out.replace(block, block + TARGET_IMPORT + '\n');
        } else {
          out = TARGET_IMPORT + '\n' + out;
        }
      }
    }

    await fs.writeFile(file, out, 'utf8');
    console.log('Converted:', file);
  } catch (err) {
    console.error('ERR', file, err.message);
  }
}

(async () => {
  console.log('Starting conversion from <button> to <Button>...');
  await walk(process.cwd());
  console.log('Done.');
})();
