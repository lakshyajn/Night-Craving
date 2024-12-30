'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ItemCard from './components/menu/ItemCard';
import SectionNav from './components/menu/SectionNav';
import CartPreview from './components/cart/CartPreview';
import { useCart } from './contexts/CartContext';
import { IoCart } from 'react-icons/io5';
import Button from './components/ui/Button';
import Image from 'next/image';
import logo from '../public/logo.png'
import { useSync } from './contexts/SyncContext';


export default function Home() {
  const [items, setItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const { setIsCartOpen, cart, calculateTotal } = useCart();
  const { syncTrigger = 0 } = useSync() || {};
  const memoizedSyncTrigger = useMemo(() => syncTrigger, [syncTrigger]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchData = async () => {
      // Only fetch on client-side
      if (typeof window !== 'undefined') {
        try {
          setIsLoading(true);
          const [sectionsRes, itemsRes] = await Promise.all([
            fetch('/api/sections'),
            fetch('/api/items')
          ]);

          if (!sectionsRes.ok || !itemsRes.ok) {
            throw new Error('Failed to fetch menu data');
          }

          const [sectionsData, itemsData] = await Promise.all([
            sectionsRes.json(),
            itemsRes.json()
          ]);

          // Extract section names and sort
          const fetchedSections = sectionsData.sections
            .map(section => section.name)
            .sort();

          setSections(fetchedSections);
          setItems(itemsData.items || []);
          
          // Set initial active section to first section
          if (fetchedSections.length > 0) {
            setActiveSection(fetchedSections[0]);
          }
        } catch (err) {
          console.error('Error fetching menu data:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [syncTrigger]);

  // Memoized filtered items for performance
  const sectionItemsMap = useMemo(() => {
    return sections.reduce((acc, section) => {
      const sectionItems = items.filter(
        item => item.section === section && item.inStock
      );
      acc[section] = sectionItems;
      return acc;
    }, {});
  }, [sections, items]);

  // Handle section selection with smooth scroll
  const handleSectionSelect = (section) => {
    setActiveSection(section);
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Prevent server-side rendering
  if (!isClient) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen"
        suppressHydrationWarning
      >
        <span className="loading-spinner">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen text-red-500"
        suppressHydrationWarning
      >
        Error: {error}
      </div>
    );
  }

  // Empty state
  if (sections.length === 0 || items.length === 0) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen"
        suppressHydrationWarning
      >
        No menu items available
      </div>
    );
  }
  
  return (
    <div className="pb-20">
    <div className="justify-center items-center m-auto relative w-50"><Image src={logo} alt="After 10"></Image></div>
    <div className="justify-center items-center text-center px-0 py-8 m-auto justify-items-center text-nowrap bg-[#F5F5F5] text-xl text-[#333333] font-sans">Order Online</div>
    <SectionNav
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
      />

      <div className="mt-8 container mx-auto px-4">
        {sections.map((section) => {
          const sectionItems = sectionItemsMap[section] || [];
          
          // Skip sections with no in-stock items
          if (sectionItems.length === 0) return null;

          return (
            <div 
              key={section} 
              id={section} 
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">{section}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sectionItems.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    // Optional: pass additional props if needed
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-30"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2"
          >
            <IoCart size={24} />
            <span>{cart.length} items</span>
          </Button>
          <div className="text-lg font-semibold">
            ₹{calculateTotal()}
          </div>
        </div>
      </motion.div>

      <CartPreview />
    </div>
  );
}