import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"></div>
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold-light/30 dark:bg-gold-light/10 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-gold/20 dark:bg-gold/10 rounded-full filter blur-3xl animate-float" style={{
          animationDelay: "2s"
        }}></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 space-y-8 animate-fade-in">
          <div>
            <div className="inline-block mb-4 px-4 py-1 rounded-full bg-gold/10 dark:bg-gold/20 text-gold-dark dark:text-gold-light text-sm font-medium">
              Premium Quality Products
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-balance mb-4">
              Discover <span className="text-gold-gradient">Exceptional</span> Products for Modern Living
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Elevate your lifestyle with our curated selection of premium products designed for comfort, style, and functionality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#Collections" className="px-8 py-3 rounded-lg bg-slate-900 dark:bg-gold text-white font-medium transition-all duration-300 hover:bg-slate-800 dark:hover:bg-gold-dark hover:shadow-xl flex items-center justify-center">
              Shop Collections
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <Link to="/products" className="px-8 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white font-medium transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              Explore Bestsellers
            </Link>
          </div>

          <div className="flex items-center gap-8 text-sm">
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
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center animate-slide-right">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gold/20 dark:bg-gold/10 filter blur-2xl animate-pulse-subtle"></div>
            <div className="relative z-10 product-shadow">
              <img alt="Premium Products" className="w-full max-w-md rounded-3xl object-none" src="../public/assets/images/fQ__-removebg-preview.png" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;