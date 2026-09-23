const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '../src');

const replacements = [
  { regex: /\bbg-white\b/g, replace: 'bg-background' },
  { regex: /\btext-charcoal\b/g, replace: 'text-foreground' },
  { regex: /\bborder-light\b/g, replace: 'border-card-border' },
  { regex: /\bbg-charcoal\b/g, replace: 'bg-inverted-bg' },
  { regex: /\btext-white\b/g, replace: 'text-inverted-text' },
  { regex: /\bbg-light\b/g, replace: 'bg-card-border' },
  { regex: /\btext-yellow\b/g, replace: 'text-primary' },
  { regex: /\bbg-yellow\b/g, replace: 'bg-primary' },
  { regex: /\btext-sage\b/g, replace: 'text-secondary' },
  { regex: /\bbg-sage\b/g, replace: 'bg-secondary' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log("Theme refactoring complete.");
