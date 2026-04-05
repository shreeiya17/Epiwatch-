const fs = require('fs');
const path = require('path');
const lucide = require('lucide-react');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if (f.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const m = content.match(/import\s+\{([^}]*)\}\s+from\s+['"]lucide-react['"]/);
      if (m) {
        const icons = m[1].split(',').map(s => {
          let str = s.trim();
          if (str.includes(' as ')) {
            return str.split(' as ')[0].trim();
          }
          return str;
        }).filter(Boolean);
        for (const icon of icons) {
          if (!lucide[icon]) console.log('MISSING LUCIDE:', icon, 'in', fullPath);
        }
      }
    }
  }
}
checkDir('./src');
