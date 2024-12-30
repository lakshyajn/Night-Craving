// app/components/menu/SectionNav.js
'use client';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SectionNav({ sections, activeSection, onSectionSelect }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const activeElement = document.getElementById(`nav-${activeSection}`);
    if (activeElement && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = activeElement.offsetLeft - (container.offsetWidth / 2) + (activeElement.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeSection]);

  return (
    <div 
      ref={scrollRef}
      className="mt-2 left-0 right-0 bg-white z-10 border-b shadow-sm overflow-x-auto scrollbar-hide"
    >
      <div className="flex space-x-2 p-4 min-w-max">
        {sections.map((section) => (
          <motion.button
            key={section}
            id={`nav-${section}`}
            onClick={() => onSectionSelect(section)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeSection === section ? 'bg-[#37DD00] text-[#f5f5f5]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            whileTap={{ scale: 0.95 }}
          >
            {section}
          </motion.button>
        ))}
      </div>
    </div>
  );
}