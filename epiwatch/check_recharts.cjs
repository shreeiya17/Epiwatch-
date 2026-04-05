const fs = require('fs');
const recharts = require('recharts');

const files = fs.readdirSync('./src/pages').filter(f => f.endsWith('.jsx'));
for (const file of files) {
  const content = fs.readFileSync('./src/pages/' + file, 'utf8');
  const m = content.match(/import\s+\{([^}]*)\}\s+from\s+['"]recharts['"]/s);
  if (m) {
    const exports = m[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const exp of exports) {
      if (!recharts[exp]) console.log('MISSING:', exp, 'in', file);
    }
  }
}
