const fs = require('fs');
let cnt = fs.readFileSync('src/utils/chartDefaults.js', 'utf8');

cnt = cnt.replace('backgroundColor: "#1a2235"', 'backgroundColor: "#ffffff"');
cnt = cnt.replace('color: "#e8edf5"', 'color: "#0f172a"');
cnt = cnt.replace('color: ''#e8edf5''', 'color: ''#0f172a''');

fs.writeFileSync('src/utils/chartDefaults.js', cnt, 'utf8');
