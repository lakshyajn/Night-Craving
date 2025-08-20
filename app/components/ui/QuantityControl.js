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
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const commonBoxStyle = `flex items-center justify-center border-gray-300`;

  return (
    <motion.div 
      className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm shrink-0 w-fit"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
    >
      <button
        onClick={onDecrease}
        className={`${sizes[size]} ${commonBoxStyle} hover:bg-green-50 transition-colors`}
      >
        <IoRemove className="text-green-600" />
      </button>
      <div className={`${sizes[size]} ${commonBoxStyle} border-x font-semibold`}>
        {quantity}
      </div>
      <button
        onClick={onIncrease}
        className={`${sizes[size]} ${commonBoxStyle} hover:bg-green-50 transition-colors`}
      >
        <IoAdd className="text-green-600" />
      </button>
    </motion.div>
  );
}