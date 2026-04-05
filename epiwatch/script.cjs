const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.jsx') || file.endsWith('.css')) results.push(file);
    });
    return results;
}
const files = walk('./src');
let totalMatches = {};
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/bg-\[#?\w+\]|bg-slate-\d+|text-white|text-slate-\d+|border-slate-\d+|text-gray-\d+|bg-gray-\d+/g);
  if (matches) {
    matches.forEach(m => totalMatches[m] = (totalMatches[m] || 0) + 1);
  }
});
console.log(totalMatches);
