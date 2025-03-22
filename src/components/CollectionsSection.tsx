import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const fetchCategories = async () => {
  // In a real app, this would be an API call
  return [
    { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'clothing', name: 'Clothing', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'home', name: 'Home', image: 'https://images.unsplash.com/photo-1583845112203-29329902332e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'books', name: 'Books', image: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'beauty', name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'toys', name: 'Toys', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'sports', name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'food', name: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'other', name: 'Other', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];
};

const CollectionsSection = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const itemsPerSlide = 3; // Number of items to show per slide
  const totalSlides = Math.ceil((categories?.length || 0) / itemsPerSlide);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

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

    const element = document.getElementById("collections");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="collections" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Our Collections
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Explore our carefully curated collections designed to enhance every aspect of your lifestyle.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto mt-12 glass-card p-2 rounded-2xl">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="min-w-full p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((category, index) => (
                        <Link 
                          key={category.id}
                          to={`/products?category=${category.name}`}
                          className="block"
                        >
                          <motion.div 
                            className={cn(
                              "group overflow-hidden rounded-2xl relative hover-scale cursor-pointer",
                              isVisible ? "animate-fade-in" : "opacity-0"
                            )}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                          >
                            <div className="aspect-[4/5] overflow-hidden">
                              <img 
                                src={category.image} 
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500">
                              <div className="flex justify-between items-end">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                                  <p className="text-white/80 mb-4 max-w-xs">Explore our {category.name.toLowerCase()} collection</p>
                                  <span className="text-sm text-white/70 font-medium">Featured items</span>
                                </div>
                                
                                <div 
                                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-gold dark:hover:bg-gold-light hover:text-white dark:hover:text-slate-900 text-white group-hover:rotate-[15deg]"
                                >
                                  <ArrowRight className="w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              aria-label="Previous collection"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              aria-label="Next collection"
            >
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          {/* Indicator dots */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "w-8 bg-gold dark:bg-gold-light" 
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                )}
                aria-label={`Go to collection slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
