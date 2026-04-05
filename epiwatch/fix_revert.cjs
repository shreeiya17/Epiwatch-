const fs = require("fs");
const path = require("path");

const componentsDir = path.join(__dirname, "src", "components");
const pagesDir = path.join(__dirname, "src", "pages");

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith(".jsx")) {
      callback(filepath);
    }
  });
}

function revertFile(filepath) {
  let content = fs.readFileSync(filepath, "utf8");
  let newContent = content;

  // Revert general layout/card styles
  newContent = newContent.replace(/bg-bg/g, "bg-white");
  newContent = newContent.replace(/border-accent\/30/g, "border-slate-200/60");
  newContent = newContent.replace(/border-accent\/10/g, "border-slate-200/60");
  newContent = newContent.replace(/border-accent\/20/g, "border-slate-200/60");
  newContent = newContent.replace(/border-accent/g, "border-slate-200/60");
  newContent = newContent.replace(/ring-1 ring-accent\/50/g, "shadow-sm shadow-slate-200/50");
  newContent = newContent.replace(/shadow-\[0_0_15px_rgba\(0\,255\,65\,0\.15\)\]/g, "shadow-sm shadow-slate-200/50");
  
  // Revert texts
  newContent = newContent.replace(/text-accent/g, "text-slate-900");
  newContent = newContent.replace(/text-slate-200/g, "text-slate-600");
  newContent = newContent.replace(/text-slate-300/g, "text-slate-600");
  newContent = newContent.replace(/text-slate-400/g, "text-slate-500");
  
  // Revert specific headers
  newContent = newContent.replace(/\[ GLOBAL OVERVIEW \]/g, "Global Overview");
  newContent = newContent.replace(/\[ COUNTRY ANALYSIS \]/g, "Country Analysis");
  newContent = newContent.replace(/\[ RISK MAP \]/g, "Risk Map");
  newContent = newContent.replace(/\[ HOTSPOT DETECTION \]/g, "Hotspot Detection");
  newContent = newContent.replace(/\[ EPIDEMIC INTEL \]/g, "Epidemic Intelligence");
  
  newContent = newContent.replace(/font-mono/g, "font-semibold");
  newContent = newContent.replace(/font-medium tracking-\[-0\.5px\]/g, "tracking-[-0.4px]");

  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, "utf8");
    console.log("Reverted: " + filepath);
  }
}

walkSync(componentsDir, revertFile);
walkSync(pagesDir, revertFile);

