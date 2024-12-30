// app/components/ui/Modal.js
'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md' 
}) {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} z-50`}
              ref={modalRef}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <IoClose size={24} />
                  </button>
                </div>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}