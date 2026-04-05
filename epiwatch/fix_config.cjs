const fs = require('fs');

// tailwind.config.js
let twVars = fs.readFileSync('tailwind.config.js', 'utf8');
twVars = twVars.replace('bg: "#0a0e1a"', 'bg: "#f8fafc"');
twVars = twVars.replace('bg2: "#111827"', 'bg2: "#ffffff"');
twVars = twVars.replace('bg3: "#1a2235"', 'bg3: "#f1f5f9"');
twVars = twVars.replace('bg4: "#1f2d45"', 'bg4: "#e2e8f0"');
twVars = twVars.replace('border: "rgba(255, 255, 255, 0.05)"', 'border: "rgba(0, 0, 0, 0.05)"');

fs.writeFileSync('tailwind.config.js', twVars, 'utf8');

// index.css
let idxCss = fs.readFileSync('src/index.css', 'utf8');
idxCss = idxCss.replace('background-color: #0a0e1a', 'background-color: #f8fafc');
idxCss = idxCss.replace('color: #e8edf5', 'color: #0f172a');
fs.writeFileSync('src/index.css', idxCss, 'utf8');

console.log('Fixed configs');
