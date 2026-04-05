const fs = require('fs');
const lucide = require('lucide-react');

const files = fs.readdirSync('./src/pages').filter(f => f.endsWith('.jsx'));
for (const file of files) {
  const content = fs.readFileSync('./src/pages/' + file, 'utf8');
  const m = content.match(/import\s+\{([^}]*)\}\s+from\s+['"]lucide-react['"]/);
  if (m) {
    const icons = m[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const icon of icons) {
      if (!lucide[icon]) console.log('MISSING:', icon, 'in', file);
    }
  }
}
