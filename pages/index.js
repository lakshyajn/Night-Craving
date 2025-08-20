// pages/index.js
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dbConnect from '../app/lib/db';
import Section from '../app/models/Section';
import Item from '../app/models/Item';

import ItemCard from '../app/components/menu/ItemCard';
import SectionNav from '../app/components/menu/SectionNav';
import CartPreview from '../app/components/cart/CartPreview';
import { useCart } from '@/app/contexts/CartContext';
import Button from '../app/components/ui/Button';
import Image from 'next/image';
import logo from '../public/logo.png';
import { IoCart } from 'react-icons/io5';
import { useLocation } from '../app/contexts/LocationContext';
import { LocationPrompt } from '../app/components/ui/LocationPrompt';

let cachedItems = null;
let cachedSections = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 1000;

export async function getServerSideProps() {
  const now = Date.now();

  if (cachedItems && cachedSections && now - lastCacheTime < CACHE_DURATION) {
    return {
      props: {
        initialSections: cachedSections,
        initialItems: cachedItems,
      },
    };
  }

  await dbConnect();

  const sectionsData = await Section.find({}, 'name').lean();
  const itemsData = await Item.find({})
    .select('name section price image inStock addons')
    .lean();

  const sectionNames = sectionsData.map((s) => s.name).sort();
  const items = JSON.parse(JSON.stringify(itemsData));

  cachedSections = sectionNames;
  cachedItems = items;
  lastCacheTime = now;

  return {
    props: {
      initialSections: sectionNames,
      initialItems: items,
    },
  };
}

export default function Home({ initialSections, initialItems }) {
  const [sections] = useState(initialSections);
  const [items] = useState(initialItems);
  const [activeSection, setActiveSection] = useState(sections[0] || '');
  const { setIsCartOpen, cart, calculateTotal } = useCart();
  const { showLocationPrompt } = useLocation();

  const sectionItemsMap = useMemo(() => {
    return sections.reduce((acc, section) => {
      const sectionItems = items.filter(
        item => item.section === section && item.inStock
      );
      acc[section] = sectionItems;
      return acc;
    }, {});
  }, [sections, items]);

  const handleSectionSelect = (section) => {
    setActiveSection(section);
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (sections.length === 0 || items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No menu items available
      </div>
    );
  }

  return (
    <div className="pb-20">
      {showLocationPrompt && <LocationPrompt />}

      <div className="flex justify-center items-center mx-auto relative py-4">
        <Image src={logo} alt="After 10" priority />
      </div>

      <div className="text-center py-8 bg-[#F5F5F5] text-xl text-[#333333] font-sans">
        Order Online
      </div>

      <SectionNav
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
      />

      <div className="mt-8 container mx-auto px-4">
        {sections.map((section) => {
          const sectionItems = sectionItemsMap[section] || [];
          if (sectionItems.length === 0) return null;

          return (
            <div key={section} id={section} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{section}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sectionItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
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
            <div className="text-lg font-semibold">₹{calculateTotal()}</div>
          </div>
        </motion.div>
      )}

      <CartPreview />
    </div>
  );
}