// app/components/menu/ItemCard.js
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/app/contexts/CartContext';
import Button from '../ui/Button';
import QuantityControl from '../ui/QuantityControl';
import Modal from '../ui/Modal';

export default function ItemCard({ item }) {
  const [showAddons, setShowAddons] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { addToCart, cart, updateQuantity } = useCart();
  const [addedAddons, setAddedAddons] = useState([]);

  const matchingCartItems = cart.filter(cartItem => cartItem.id === item._id);
  const cartItem = cart.find(
    cartItem =>
      cartItem.id === item._id &&
      JSON.stringify(cartItem.selectedAddons) === JSON.stringify(addedAddons)
  );


  const handleAddToCart = () => {
    if (item.addons?.length > 0) {
      setShowAddons(true);
    } else {
      addToCart(item, 1);
    }
  };

  const handleAddWithAddons = () => {
    addToCart(item, quantity, selectedAddons);
    setShowAddons(false);
    setQuantity(1);
    setAddedAddons(selectedAddons);
    setSelectedAddons([]);
  };

  const toggleAddon = (addon) => {
    setSelectedAddons(prev =>
      prev.includes(addon)
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold font-md">{item.name}</h3>
          <p className="text-sm text-gray-900">₹{item.price}</p>

          {cartItem ? (
            <div className="mt-2 w-fit">
              <QuantityControl
                quantity={cartItem.quantity}
                onIncrease={() =>
                  updateQuantity(item._id, addedAddons, cartItem.quantity + 1)
                }
                onDecrease={() =>
                  updateQuantity(item._id, addedAddons, cartItem.quantity - 1)
                }
                size="sm"
              />
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="mt-2"
            >
              Add
            </Button>
          )}

        </div>
      </motion.div>

      <Modal
        isOpen={showAddons}
        onClose={() => {
          setShowAddons(false);
          setQuantity(1);
          setSelectedAddons([]);
        }}
        title="Customize Your Order"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-md font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-900">₹{item.price}</p>
            </div>
            <div className="mt-2 w-fit">
              <QuantityControl
                quantity={quantity}
                onIncrease={() => setQuantity(prev => prev + 1)}
                onDecrease={() => setQuantity(prev => Math.max(1, prev - 1))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Add-ons</h4>
            {item.addons?.map((addon, index) => (
              <label
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon)}
                    onChange={() => toggleAddon(addon)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>{addon.name}</span>
                </div>
                <span className="text-gray-600">₹{addon.price}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddons(false);
                setQuantity(1);
                setSelectedAddons([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWithAddons}>
              Add to Cart - ₹{(item.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0)) * quantity}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}