// app/components/ui/QuantityControl.js
'use client';
import { motion } from 'framer-motion';
import { IoAdd, IoRemove } from 'react-icons/io5';

export default function QuantityControl({ 
  quantity, 
  onIncrease, 
  onDecrease,
  size = 'md'
}) {
  const sizes = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  return (
    <motion.div 
      className={`flex items-center border border-gray-300 rounded-lg overflow-hidden ${sizes[size]}`}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <button
        onClick={onDecrease}
        className="px-3 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <IoRemove />
      </button>
      <div className="px-3 h-full flex items-center justify-center border-x border-gray-300 min-w-[40px]">
        {quantity}
      </div>
      <button
        onClick={onIncrease}
        className="px-3 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <IoAdd />
      </button>
    </motion.div>
  );
}