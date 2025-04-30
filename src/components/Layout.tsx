
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Suspense, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { LocomotiveScrollProvider } from 'react-locomotive-scroll';
import { useRef } from 'react';
import 'locomotive-scroll/dist/locomotive-scroll.css';

const Layout = () => {
  const containerRef = useRef(null);
  
  // Add scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize smooth scroll observer
  useEffect(() => {
    const scrollElements = document.querySelectorAll('.reveal-on-scroll, .fade-in-bottom, .fade-in-left, .fade-in-right');
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    
    scrollElements.forEach(element => {
      observer.observe(element);
    });
    
    return () => {
      scrollElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow pt-24 md:pt-28">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        }>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
