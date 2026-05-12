import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scroller = document.getElementById('main-scroller');
    
    if (!scroller) return;

    const toggleVisibility = () => {
      if (scroller.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    scroller.addEventListener('scroll', toggleVisibility);
    return () => scroller.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const scroller = document.getElementById('main-scroller');
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-[9999] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-white/20"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTop;