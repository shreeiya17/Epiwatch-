const fs = require("fs");

let sidebar = fs.readFileSync("src/components/Sidebar.jsx", "utf8");
sidebar = sidebar.replace(/"fixed inset-y-0 left-0 z-50 w-\[220px\] [^"]+"/g, `"fixed md:sticky top-0 h-screen inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col md:translate-x-0"`);
fs.writeFileSync("src/components/Sidebar.jsx", sidebar, "utf8");

let pagelayout = fs.readFileSync("src/components/PageLayout.jsx", "utf8");
pagelayout = pagelayout.replace(/<main className="[^"]+">/, `<main className="flex-1 w-full flex flex-col min-w-0 min-h-screen box-border">`);
pagelayout = pagelayout.replace(/<div className="p-4 md:py-8 md:px-8 max-w-7xl mx-auto">/, `<div className="p-4 md:py-8 md:px-8 w-full max-w-7xl mx-auto flex-1">`);
fs.writeFileSync("src/components/PageLayout.jsx", pagelayout, "utf8");

console.log("Layout fixed");

