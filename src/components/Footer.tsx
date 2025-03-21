
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">CommerceHub</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Your one-stop destination for all your shopping needs. Quality products from trusted sellers.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Home</Link></li>
              <li><Link to="/products" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Products</Link></li>
              <li><Link to="/cart" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Cart</Link></li>
              <li><Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Login</Link></li>
              <li><Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Electronics" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Electronics</Link></li>
              <li><Link to="/products?category=Clothing" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Clothing</Link></li>
              <li><Link to="/products?category=Home" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Home & Kitchen</Link></li>
              <li><Link to="/products?category=Books" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Books</Link></li>
              <li><Link to="/products?category=Beauty" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Beauty</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contact</h3>
            <address className="not-italic text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>123 Commerce Street</p>
              <p>Hub City, HC 12345</p>
              <p>Email: support@commercehub.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            &copy; {currentYear} CommerceHub. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex space-x-4">
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm">Terms of Service</a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
