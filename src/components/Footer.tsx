import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 pt-16 pb-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-lg mb-4">CommerceHub</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your one-stop destination for quality products from trusted sellers.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary dark:text-slate-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary dark:text-slate-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary dark:text-slate-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary dark:text-slate-400">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link to="/products?bestseller=true" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/products?new=true" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-slate-600 hover:text-primary dark:text-slate-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CommerceHub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-slate-600 hover:text-primary dark:text-slate-400 text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-slate-600 hover:text-primary dark:text-slate-400 text-sm">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-slate-600 hover:text-primary dark:text-slate-400 text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
