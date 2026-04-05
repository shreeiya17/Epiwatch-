const fs = require('fs');

function injectSkeleton(path, imports, skeletonContent) {
  let content = fs.readFileSync(path, 'utf8');

  // Check if we already injected
  if (content.includes('SkeletonCard')) {
    console.log(`Skipping ${path}, already injected.`);
    return;
  }

  // Remove the old early return
  content = content.replace(/if\s*\(loading\)\s*(?:return|=>)\s*(?:<div[^>]*>|<PageLayout>[^<]*<\/PageLayout>)[^;]+;\s*\n?/, '');

  // Find the exact Return block
  const match = content.match(/return\s*\(\s*(<div[\s\S]+?)\s*\);\}\s*$/);
  if (match) {
    const originalRet = match[1];

    // Add imports
    content = content.replace(/(import React[^;]*;)/, `$1\nimport { ${imports} } from '../components/Skeleton';`);
    
    if (!content.includes('{ AnimatePresence }')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'framer-motion';?/, (m, p1) => {
           return `import { AnimatePresence, ${p1.trim()} } from 'framer-motion';`;
      });
    }

    const newReturn = `return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 font-sans">
            ${skeletonContent}
          </motion.div>
        ) : (
          <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
            ${originalRet}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}`;
    content = content.substring(0, match.index) + newReturn;
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  } else {
    console.log(`Could not find return match for ${path}`);
  }
}

// 1. Dashboard
injectSkeleton(
  'src/pages/Dashboard.jsx',
  'GlobalLoadingBar, SkeletonCard, SkeletonChart',
`
            <GlobalLoadingBar />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2"><SkeletonChart height={220} /></div>
              <div className="col-span-1"><SkeletonChart height={220} /></div>
            </div>
`
);

// 2. RiskMap
injectSkeleton(
  'src/pages/RiskMap.jsx',
  'GlobalLoadingBar, SkeletonMap, SkeletonCard, SkeletonTable',
`
            <GlobalLoadingBar />
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <SkeletonMap />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
               <SkeletonTable rows={8} />
            </div>
`
);

// 3. HotspotDetection
injectSkeleton(
  'src/pages/HotspotDetection.jsx',
  'GlobalLoadingBar, SkeletonCard, SkeletonChart, SkeletonTable',
`
            <GlobalLoadingBar />
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1"><SkeletonCard /></div>
              <div className="flex-1"><SkeletonCard /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart height={192} /><SkeletonChart height={192} />
            </div>
            <SkeletonTable rows={10} />
`
);

// 4. CountryAnalysis
// CountryAnalysis has {loading ? (...) : (<>...<div...></>)}
// It has a different return block, so I will manual modify that.
console.log('Script done');