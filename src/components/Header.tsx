import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, Menu, User, Package, LogOut, BarChart, ShoppingBag, Users, Home, Search, X, Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={cn("fixed top-4 left-0 right-0 z-50 transition-all duration-300 py-3 mx-auto", isScrolled ? "max-w-[95%] lg:max-w-[90%] px-6" : "max-w-full px-6 md:px-10", isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-gold-sm dark:shadow-gold rounded-full" : "bg-transparent")}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-primary dark:text-primary px-[10px]">
          Commerce<span className="text-slate-900 dark:text-white">Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="nav-link font-medium text-slate-900 dark:text-white">Home</Link>
          <Link to="/products" className="nav-link font-medium text-slate-900 dark:text-white">Products</Link>
          <a
            href="/assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link font-medium text-slate-900 dark:text-white"
          >
            Assistant
          </a>
          {isAuthenticated && <Link to="/orders" className="nav-link font-medium text-slate-900 dark:text-white">Orders</Link>}
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              />
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Cart */}
          <Link 
            to="/cart" 
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300", 
              isScrolled ? "bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
          >
            <ShoppingCart className="w-5 h-5 text-slate-800 dark:text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary dark:bg-primary text-white dark:text-slate-900 text-xs flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300", 
                    isScrolled ? "bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  )}
                >
                  <User className="w-5 h-5 text-slate-800 dark:text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel>
                  {user?.name}
                  <p className="text-xs font-normal text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                
                {user?.role === 'seller' && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Seller Dashboard</DropdownMenuLabel>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/seller/dashboard" className="cursor-pointer">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/seller/products" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Products</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/seller/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                  </>}
                
                {user?.role === 'admin' && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Users</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/admin/sellers" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Sellers</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/admin/products" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Products</span>
                      </Link>
                    </DropdownMenuItem>
                  </>}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="font-medium">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')} className="font-medium">
                Register
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={cn(
              "md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300", 
              isScrolled ? "bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-slate-800 dark:text-primary" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800 dark:text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className={cn("md:hidden mt-3", isScrolled ? "hidden" : "block")}>
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-20 px-6"
          >
            <nav className="flex flex-col space-y-8 items-center">
              <Link to="/" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                <Home className="inline-block h-5 w-5 mr-2" />
                Home
              </Link>
              <Link to="/products" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                <ShoppingBag className="inline-block h-5 w-5 mr-2" />
                Products
              </Link>
              <a
                href="/assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-medium text-slate-900 dark:text-white flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bot className="inline-block h-5 w-5 mr-2" />
                Assistant
              </a>
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                    <User className="inline-block h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link to="/orders" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                    <Package className="inline-block h-5 w-5 mr-2" />
                    Orders
                  </Link>
                  
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <Link to="/seller/dashboard" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                      <BarChart className="inline-block h-5 w-5 mr-2" />
                      Seller Dashboard
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                      <BarChart className="inline-block h-5 w-5 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-xl font-medium text-red-500"
                  >
                    <LogOut className="inline-block h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                  Login
                  </Link>
                  <Link to="/register" className="text-xl font-medium text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
