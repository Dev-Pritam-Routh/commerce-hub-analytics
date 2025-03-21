
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { 
  ShoppingCart, 
  Menu, 
  User, 
  Package, 
  LogOut, 
  BarChart, 
  ShoppingBag,
  Users,
  Home,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-primary tracking-tight"
          >
            Commerce<span className="text-slate-900 dark:text-white">Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            {isAuthenticated && (
              <Link to="/orders" className="nav-link">Orders</Link>
            )}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
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
                  
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <>
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
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <>
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
                        <Link to="/admin/products" className="cursor-pointer">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Products</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/register')}
                  className="hidden sm:inline-flex"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <Link to="/" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                <Home className="inline-block h-4 w-4 mr-2" />
                Home
              </Link>
              <Link to="/products" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                <ShoppingBag className="inline-block h-4 w-4 mr-2" />
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                    <User className="inline-block h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link to="/orders" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                    <Package className="inline-block h-4 w-4 mr-2" />
                    Orders
                  </Link>
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <Link to="/seller/dashboard" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                      <BarChart className="inline-block h-4 w-4 mr-2" />
                      Seller Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                      <BarChart className="inline-block h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }} 
                    className="py-2 px-4 text-left text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  >
                    <LogOut className="inline-block h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" onClick={toggleMenu}>
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
