const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-[#0a0e1a]': 'bg-slate-50',
  'text-white': 'text-slate-900',
  'text-slate-400': 'text-slate-500',
  'text-slate-200': 'text-slate-700',
  'bg-[#0f172a]': 'bg-white',
  'bg-[#111827]': 'bg-white',
  'bg-slate-800': 'bg-slate-100',
  'text-slate-300': 'text-slate-600',
  'border-slate-800': 'border-slate-200',
  'bg-[#1e293b]': 'bg-white',
  'border-slate-700': 'border-slate-200',
  'bg-[#1a2235]': 'bg-white',
  'text-gray-400': 'text-slate-500',
  'bg-slate-700': 'bg-slate-200',
  'bg-slate-600': 'bg-slate-300',
  'bg-slate-500': 'bg-slate-400',
  'bg-blue-600': 'bg-blue-500',
  'text-blue-400': 'text-blue-600'
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) results.push(file);
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace each key
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // we use a regex to ensure we match whole words and handle escaping for brackets
    const escapedOld = oldClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const regex = new RegExp('(?<=[\\s"''])' + escapedOld + '(?=[\\s"''])', 'g');
    content = content.replace(regex, newClass);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
