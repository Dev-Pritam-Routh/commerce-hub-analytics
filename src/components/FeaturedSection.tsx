import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ProductCard from "./ProductCard";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const fetchFeaturedProducts = async () => {
  try {
    const response = await axios.get('/products?featured=true');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Sample products as fallback
const sampleProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    rating: 4.8,
    category: "Audio",
    stock: 25,
    sellerId: "seller1"
  },
  {
    id: "2",
    name: "Smart Watch Series X",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1598&q=80",
    rating: 4.7,
    category: "Wearables",
    stock: 15,
    sellerId: "seller2"
  },
  {
    id: "3",
    name: "Ultra HD Smart TV 65\"",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    rating: 4.9,
    category: "Electronics",
    stock: 8,
    sellerId: "seller3"
  },
  {
    id: "4",
    name: "Professional Camera Kit",
    price: 3499.99,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    rating: 4.9,
    category: "Photography",
    stock: 5,
    sellerId: "seller4"
  }
];

const FeaturedSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
  });

  // Map API products to the format expected by ProductCard
  const products = apiProducts?.map(product => ({
    id: product._id || product.id,
    name: product.name,
    price: product.discountedPrice || product.price,
    image: product.images?.[0] || '',
    rating: product.averageRating || 0,
    category: product.category,
    stock: product.stock || 0,
    sellerId: typeof product.seller === 'object' ? product.seller?._id : product.seller
  })) || sampleProducts;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("featured");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  if (isLoading) {
    return (
      <section id="featured" className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Featured Products
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our handpicked selection of premium products that exemplify quality, innovation, and style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              className={isVisible ? "opacity-100" : "opacity-0"}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
