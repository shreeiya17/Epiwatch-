const fs = require("fs");
const path = require("path");

function fixTheme(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let fixed = content
    .replace(/bg-accent\/10/g, "bg-blue-50")
    .replace(/bg-accent\/5/g, "bg-blue-50/50")
    .replace(/text-accent/g, "text-blue-600")
    .replace(/bg-accent/g, "bg-blue-500")
    .replace(/border-accent\/\d+/g, "border-blue-200")
    .replace(/border-accent/g, "border-blue-500")
    
    .replace(/text-danger/g, "text-red-500")
    .replace(/bg-danger\/10/g, "bg-red-50")
    .replace(/bg-danger/g, "bg-red-500")
    .replace(/border-danger\/\d+/g, "border-red-200")
    .replace(/border-danger/g, "border-red-500")
    
    .replace(/text-muted/g, "text-slate-500")
    .replace(/bg-white2/g, "bg-slate-50")
    .replace(/bg-[#0a0e1a]/g, "bg-slate-50")
    .replace(/bg-bg/g, "bg-slate-50")
    .replace(/border-slate-800\/50/g, "border-slate-200")
    .replace(/text-slate-400/g, "text-slate-500");

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, "utf8");
    console.log("Fixed theme classes in", filePath);
  }
}

function walkSync(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath);
    } else if (fullPath.endsWith(".jsx") || fullPath.endsWith(".js")) {
      fixTheme(fullPath);
    }
  });
}

walkSync(path.join(__dirname, "src"));

