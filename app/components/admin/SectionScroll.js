'use client';
import { useRef } from 'react';
import { IoChevronBack, IoChevronForward, IoTrash } from 'react-icons/io5';

export default function SectionScroll({ 
  sections, 
  onBulkDelete // Renamed for clarity
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' 
        ? -scrollRef.current.offsetWidth 
        : scrollRef.current.offsetWidth;
      
      scrollRef.current.scrollBy({
        top: 0,
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Scroll Left Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 bg-white shadow-md rounded-full p-1"
      >
        <IoChevronBack />
      </button>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto space-x-2 py-2 px-10 scroll-smooth no-scrollbar"
      >
        {sections.map((section) => (
          <div 
            key={section._id || section.name}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2"
          >
            <span>{section.name}</span>
            <button 
              onClick={() => onBulkDelete(section._id, section.name)}
              className="text-red-500 hover:text-red-700"
            >
              <IoTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 bg-white shadow-md rounded-full p-1"
      >
        <IoChevronForward />
      </button>
    </div>
  );
}