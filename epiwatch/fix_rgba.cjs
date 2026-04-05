const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) results.push(file);
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace white alphas with black alphas
  content = content.replace(/rgba\(255\s*,\s*255\s*,\s*255\s*,/g, 'rgba(0, 0, 0,');
  // Also 'rgba(255,255,255,'
  content = content.replace(/rgba\(255,255,255,/g, 'rgba(0,0,0,');
  // and any remaining border-white/x
  content = content.replace(/border-white\/(\d+)/g, 'border-slate-200');
  content = content.replace(/bg-white\/(\d+)/g, 'bg-slate-100');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
