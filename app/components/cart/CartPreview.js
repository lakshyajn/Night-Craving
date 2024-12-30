// app/components/cart/CartPreview.js
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/app/contexts/CartContext';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import Button from '../ui/Button';
import QuantityControl from '../ui/QuantityControl';
import { useRouter } from 'next/navigation';

export default function CartPreview() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart,
    calculateTotal 
  } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <>
    {isCartOpen && (
      <AnimatePresence>
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
        <motion.div
          key="cart-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="top-0 bg-white p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}-${JSON.stringify(item.selectedAddons)}-${Math.random()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-start space-x-4 border-b pb-4 mb-4 last:border-b-0"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium font-semibold">{item.name}</h3>
                      {item.selectedAddons?.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {item.selectedAddons.map(addon => addon.name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-900">
                        ₹{item.price + (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)}
                      </p>
                    </div>

                    <div>
                      <QuantityControl
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.id, item.selectedAddons, item.quantity + 1)}
                        onDecrease={() => updateQuantity(item.id, item.selectedAddons, item.quantity - 1)}
                        size="sm"
                      />
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedAddons)}
                        className="text-sm text-red-600 mt-2 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push('/checkout');
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    )}
  </>
  );
}