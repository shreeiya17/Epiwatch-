const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(path, content, 'utf8');
}

fixFile('src/pages/Dashboard.jsx');
fixFile('src/pages/CountryAnalysis.jsx');
console.log('Fixed files');