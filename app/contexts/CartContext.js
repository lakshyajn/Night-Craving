// app/contexts/CartContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setCartLoaded(true);
  }, []);


  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1, selectedAddons = []) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem =>
          cartItem.id === item._id &&
          JSON.stringify(cartItem.selectedAddons) === JSON.stringify(selectedAddons)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, {
        id: item._id,
        cartItemId: `${item._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity,
        selectedAddons
      }];
    });
  };

  const removeFromCart = (itemId, selectedAddons = []) => {
    setCart(prevCart =>
      prevCart.filter(item =>
        !(item.id === itemId &&
          JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons))
      )
    );
  };

  const updateQuantity = (itemId, selectedAddons = [], newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, selectedAddons);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId &&
          JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = item.selectedAddons.reduce(
        (sum, addon) => sum + addon.price * item.quantity,
        0
      );
      return total + itemTotal + addonsTotal;
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
    // Optional: Clear from local storage if you're using it
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartLoaded,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      calculateTotal,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}