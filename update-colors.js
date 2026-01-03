const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mappings
const colorReplacements = [
  // Primary colors - replace old primary (slate) with new primary (green)
  { from: /from-primary-600/g, to: 'from-primary-400' },
  { from: /to-secondary-600/g, to: 'to-accent-400' },
  { from: /from-primary-700/g, to: 'from-primary-500' },
  { from: /to-secondary-700/g, to: 'to-accent-500' },
  { from: /bg-primary-600/g, to: 'bg-primary-400' },
  { from: /bg-primary-700/g, to: 'bg-primary-500' },
  { from: /text-primary-600/g, to: 'text-primary-400' },
  { from: /text-primary-700/g, to: 'text-primary-500' },
  { from: /border-primary-600/g, to: 'border-primary-400' },
  { from: /border-primary-700/g, to: 'border-primary-500' },
  { from: /ring-primary-600/g, to: 'ring-primary-400' },
  { from: /ring-primary-500/g, to: 'ring-primary-400' },

  // Blue colors - replace with primary (green)
  { from: /from-blue-600/g, to: 'from-primary-400' },
  { from: /from-blue-700/g, to: 'from-primary-500' },
  { from: /bg-blue-600/g, to: 'bg-primary-400' },
  { from: /bg-blue-700/g, to: 'bg-primary-500' },
  { from: /text-blue-600/g, to: 'text-primary-400' },
  { from: /border-blue-600/g, to: 'border-primary-400' },

  // Indigo colors - replace with accent (cyan)
  { from: /from-indigo-600/g, to: 'from-accent-400' },
  { from: /from-indigo-700/g, to: 'from-accent-500' },
  { from: /bg-indigo-600/g, to: 'bg-accent-400' },
  { from: /bg-indigo-700/g, to: 'bg-accent-500' },
  { from: /text-indigo-600/g, to: 'text-accent-400' },
  { from: /border-indigo-600/g, to: 'border-accent-400' },

  // Hover states
  { from: /hover:from-primary-700/g, to: 'hover:from-primary-500' },
  { from: /hover:to-secondary-700/g, to: 'hover:to-accent-500' },
  { from: /hover:bg-primary-700/g, to: 'hover:bg-primary-500' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-primary-500' },

  // Focus states
  { from: /focus:ring-primary-500/g, to: 'focus:ring-primary-400' },
  { from: /focus:border-primary-500/g, to: 'focus:border-primary-400' },
];

// Find all TSX, JSX, TS, JS files
const files = glob.sync('apps/customer-web/**/*.{tsx,ts,jsx,js}', {
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
});

console.log(`Found ${files.length} files to process\n`);

let totalReplacements = 0;
let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  colorReplacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(from, to);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesChanged++;
    totalReplacements += fileReplacements;
    console.log(`✓ ${file.replace(/\\/g, '/')} - ${fileReplacements} replacements`);
  }
});

console.log(`\n✅ Done!`);
console.log(`Files changed: ${filesChanged}/${files.length}`);
console.log(`Total replacements: ${totalReplacements}`);
