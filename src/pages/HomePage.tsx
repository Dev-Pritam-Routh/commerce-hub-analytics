
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const fetchFeaturedProducts = async () => {
  try {
    const response = await axios.get('/api/products?featured=true');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

const fetchCategories = async () => {
  // In a real app, this would be an API call
  return [
    { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'clothing', name: 'Clothing', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'home', name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1583845112203-29329902332e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'books', name: 'Books', image: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];
};

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate content loading for smooth animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const { data: featuredProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
    // Using a fallback for demo purposes when API is not available
    placeholderData: [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 249.99,
        discountedPrice: 199.99,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        averageRating: 4.5,
        stock: 25,
        sellerId: '1'
      },
      {
        id: '2',
        name: 'Smart Watch Series 7',
        price: 399.99,
        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        averageRating: 4.8,
        stock: 12,
        sellerId: '2'
      },
      {
        id: '3',
        name: 'Ultra Slim Laptop Pro',
        price: 1299.99,
        discountedPrice: 1099.99,
        images: ['https://images.unsplash.com/photo-1504707748692-419802cf939d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        averageRating: 4.7,
        stock: 8,
        sellerId: '1'
      },
      {
        id: '4',
        name: 'Professional Camera Kit',
        price: 899.99,
        images: ['https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        averageRating: 4.6,
        stock: 5,
        sellerId: '3'
      },
    ]
  });
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Discover, Shop & Thrive
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Find all your favorite products from trusted sellers at the best prices. Your one-stop destination for quality shopping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/products">
                  Browse Products
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register?role=seller">Become a Seller</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <p className="text-slate-600 dark:text-slate-400">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="text-primary flex items-center hover:underline">
              All Categories
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate={isLoaded ? "show" : "hidden"}
          >
            {categories?.map((category) => (
              <motion.div key={category.id} variants={item}>
                <Link 
                  to={`/products?category=${category.name}`}
                  className="relative block h-64 rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 z-10"></div>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-slate-600 dark:text-slate-400">Handpicked items you'll love</p>
            </div>
            <Link to="/products" className="text-primary flex items-center hover:underline">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isProductsLoading ? (
            <div className="py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate={isLoaded ? "show" : "hidden"}
            >
              {featuredProducts?.map((product) => (
                <motion.div key={product.id} variants={item}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-12">Why Choose CommerceHub</h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate={isLoaded ? "show" : "hidden"}
          >
            <motion.div variants={item} className="p-6 rounded-lg">
              <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Shopping</h3>
              <p className="text-slate-600 dark:text-slate-400">Your transactions are protected with industry-leading security measures.</p>
            </motion.div>
            
            <motion.div variants={item} className="p-6 rounded-lg">
              <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-slate-600 dark:text-slate-400">Get your products delivered quickly and efficiently to your doorstep.</p>
            </motion.div>
            
            <motion.div variants={item} className="p-6 rounded-lg">
              <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Returns</h3>
              <p className="text-slate-600 dark:text-slate-400">Not satisfied? Return products hassle-free within 30 days of purchase.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to start selling?</h2>
            <p className="text-lg mb-8 text-white/90">Join thousands of sellers who are growing their business on our platform.</p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/register?role=seller">Become a Seller</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
