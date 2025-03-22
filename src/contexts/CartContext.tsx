import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast, Toaster } from 'sonner'; // Make sure to import Toaster if not already imported

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  sellerId: string;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Update local storage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Add product to cart
  const addToCart = (product: CartProduct) => {
    if (!product.sellerId) {
      console.error('Product missing seller ID', product);
      toast.error('Unable to add product to cart: Missing seller information', {
        dismissible: true, // Make toast dismissible
      });
      return;
    }
    
    setCart(prevCart => {
      const existingProductIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingProductIndex > -1) {
        const updatedCart = [...prevCart];
        const existingProduct = updatedCart[existingProductIndex];
        const newQuantity = existingProduct.quantity + product.quantity;
        
        if (newQuantity > product.stock) {
          toast.error(`Sorry, only ${product.stock} items available in stock`, {
            dismissible: true,
          });
          return prevCart;
        }
        
        updatedCart[existingProductIndex] = {
          ...existingProduct,
          quantity: newQuantity
        };
        
        toast.success(`Updated quantity for ${product.name} in cart`, {
          dismissible: true,
        });
        return updatedCart;
      } else {
        if (product.quantity > product.stock) {
          toast.error(`Sorry, only ${product.stock} items available in stock`, {
            dismissible: true,
          });
          return prevCart;
        }
        
        toast.success(`Added ${product.name} to cart`, {
          dismissible: true,
        });
        return [...prevCart, product];
      }
    });
  };
  
  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      if (product) {
        toast.success(`Removed ${product.name} from cart`, {
          dismissible: true,
        });
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };
  
  // Update product quantity
  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const productIndex = prevCart.findIndex(item => item.id === productId);
      
      if (productIndex === -1) return prevCart;
      
      const product = prevCart[productIndex];
      
      if (quantity > product.stock) {
        toast.error(`Sorry, only ${product.stock} items available in stock`, {
          dismissible: true,
        });
        return prevCart;
      }
      
      if (quantity <= 0) {
        toast.success(`Removed ${product.name} from cart`, {
          dismissible: true,
        });
        return prevCart.filter(item => item.id !== productId);
      }
      
      const updatedCart = [...prevCart];
      updatedCart[productIndex] = {
        ...product,
        quantity
      };
      
      return updatedCart;
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared', {
      dismissible: true,
    });
  };
  
  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
      {/* If you need to customize the Toaster component, add it here */}
      <Toaster closeButton={true} />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
