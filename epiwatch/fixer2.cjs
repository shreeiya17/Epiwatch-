const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(path, content, 'utf8');
}

fixFile('src/pages/RiskMap.jsx');
fixFile('src/pages/HotspotDetection.jsx');
console.log('Fixed pages 3 and 4!');