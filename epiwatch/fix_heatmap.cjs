const fs = require("fs");
const filepath = "src/components/HeatmapCalendar.jsx";
let content = fs.readFileSync(filepath, "utf8");

content = content.replace(/'#0d3321'/g, "'#dcfce3'");
content = content.replace(/'#1a5c35'/g, "'#86efac'");
content = content.replace(/'#2d8a4e'/g, "'#10b981'");
content = content.replace(/'#f1f5f9'/g, "'#f8fafc'");
// Also rewrite any remaining Biohazard specific CSS
content = content.replace(/bg-bg/g, "bg-white");
content = content.replace(/text-slate-400/g, "text-slate-500");
content = content.replace(/border-slate-800\/50/g, "border-slate-200");

fs.writeFileSync(filepath, content, "utf8");
console.log("Heatmap Calendar updated");

