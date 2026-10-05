import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Tambah Produk ke Keranjang
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        return prevCart.map((item, index) => {
          if (index === existingIndex) {
            const currentQty = parseInt(item.quantity || item.qty || 1, 10);
            return { ...item, quantity: currentQty + 1, qty: currentQty + 1 };
          }
          return item;
        });
      }

      return [...prevCart, { ...product, quantity: 1, qty: 1 }];
    });
  };

  // Update Kuantitas Produk secara Presisi (+1 / -1)
  const updateQuantity = (productId, newQuantity) => {
    const targetQty = parseInt(newQuantity, 10);

    setCart((prevCart) => {
      if (isNaN(targetQty) || targetQty <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }

      return prevCart.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: targetQty,
            qty: targetQty,
          };
        }
        return item;
      });
    });
  };

  // Hapus Produk dari Keranjang
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Kosongkan Keranjang
  const clearCart = () => {
    setCart([]);
  };

  // Hitung Total Item dan Total Harga
  const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity || item.qty || 1, 10)), 0);

  const totalPrice = cart.reduce((sum, item) => {
    const price = Number(item.harga) || 0;
    const qty = parseInt(item.quantity || item.qty || 1, 10);
    return sum + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart, // Dual-alias untuk kompatibilitas
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
