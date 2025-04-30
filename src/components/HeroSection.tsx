
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollDownIndicator from './ScrollDownIndicator';
import AnimatedBackground from './ui/AnimatedBackground';
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;

      const { clientX, clientY } = e;
      const { width, height } = imageRef.current.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate mouse position relative to image center
      const moveX = (clientX - centerX) / 25;
      const moveY = (clientY - centerY) / 25;

      // Apply 3D transform
      imageRef.current.style.transform = `perspective(1000px) rotateY(${moveX * 0.5}deg) rotateX(${-moveY * 0.5}deg) translateZ(10px)`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <AnimatedBackground density={20} dark={false} />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"></div>
      </div>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          className="w-full lg:w-1/2 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <motion.div 
              className="inline-block mb-4 px-4 py-1 rounded-full bg-gold/10 dark:bg-gold/20 text-gold-dark dark:text-gold-light text-sm font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Premium Quality Products
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-balance mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Discover <span className="text-gold-gradient">Exceptional</span> Products for Modern Living
            </motion.h1>
            <motion.p 
              className="text-lg text-slate-600 dark:text-slate-300 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Elevate your lifestyle with our curated selection of premium products designed for comfort, style, and functionality.
            </motion.p>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.a 
              href="#Collections" 
              className="px-8 py-3 rounded-lg bg-slate-900 dark:bg-gold text-white font-medium transition-all duration-300 hover:bg-slate-800 dark:hover:bg-gold-dark hover:shadow-xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Shop Collections
              <ArrowRight className="ml-2 w-4 h-4" />
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/products" className="px-8 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white font-medium transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 block">
                Explore Bestsellers
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 dark:text-white">24/7</span>
              <span className="text-slate-600 dark:text-slate-400">Customer Support</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 dark:text-white">Free</span>
              <span className="text-slate-600 dark:text-slate-400">Worldwide Shipping</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 dark:text-white">100%</span>
              <span className="text-slate-600 dark:text-slate-400">Money Back Guarantee</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="w-full lg:w-1/2 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="relative perspective-container">
            <div className="absolute -inset-4 rounded-full bg-gold/20 dark:bg-gold/10 filter blur-2xl animate-pulse-subtle"></div>
            <motion.div 
              className="relative z-10 product-shadow"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 6, 
                ease: "easeInOut" 
              }}
            >
              <img 
                ref={imageRef}
                alt="Premium Products" 
                className="w-full max-w-md rounded-3xl object-contain transition-transform duration-200"
                style={{ transformStyle: 'preserve-3d' }}
                src="../public/assets/images/fQ__-removebg-preview.png" 
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <ScrollDownIndicator targetId="Collections" />
    </section>
  );
};

export default HeroSection;
