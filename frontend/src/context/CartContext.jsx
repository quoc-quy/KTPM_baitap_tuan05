import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Thêm món vào giỏ
  const addToCart = (food) => setCart(prev => {
    const exist = prev.find(i => i.id === food.id);
    return exist ? prev.map(i => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i) 
                 : [...prev, { ...food, quantity: 1 }];
  });

  // Tăng/giảm số lượng
  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Không cho giảm dưới 1
      }
      return item;
    }));
  };

  // Xóa hẳn 1 món khỏi giỏ
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);