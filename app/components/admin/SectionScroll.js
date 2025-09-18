'use client';
import { useRef } from 'react';
import { IoChevronBack, IoChevronForward, IoTrash } from 'react-icons/io5';

export default function SectionScroll({
  sections = [],
  onBulkDelete
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth || scrollRef.current.offsetWidth || 300;
    const scrollAmount = direction === 'left' ? -containerWidth : containerWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {/* Left button */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-1 hover:shadow-lg focus:outline-none"
        title="Scroll left"
      >
        <IoChevronBack size={18} />
      </button>

      {/* Scroll container: padded so content isn't hidden under the nav buttons */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 py-2 pl-12 pr-12 scroll-smooth no-scrollbar"
        role="list"
      >
        {sections.map((section, idx) => {
          // ensure a stable unique key
          const key = section._id ?? section.id ?? `${(section.name || 'section')}-${idx}`;
          const name = section.name ?? 'Unnamed';

          return (
            <div
              key={key}
              role="listitem"
              className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-3 min-w-[140px] max-w-xs shrink-0"
            >
              <span className="truncate font-medium text-sm" title={name}>
                {name}
              </span>

              {/* show delete only if handler provided */}
              {typeof onBulkDelete === 'function' && (
                <button
                  onClick={() => onBulkDelete(section._id ?? section.id, section.name)}
                  aria-label={`Delete ${name}`}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full focus:outline-none"
                  title={`Delete ${name}`}
                >
                  <IoTrash size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-1 hover:shadow-lg focus:outline-none"
        title="Scroll right"
      >
        <IoChevronForward size={18} />
      </button>
    </div>
  );
}
