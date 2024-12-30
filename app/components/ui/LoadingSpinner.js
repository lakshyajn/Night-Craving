// app/components/ui/LoadingSpinner.js
'use client';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`border-4 border-gray-200 border-t-blue-600 rounded-full ${sizes[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}