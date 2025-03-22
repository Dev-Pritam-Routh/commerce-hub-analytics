
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProducts } from '@/services/productService';

// Define the missing constants
const categories = [
  'Electronics',
  'Clothing',
  'Home',
  'Books',
  'Beauty',
  'Toys',
  'Sports',
  'Food',
  'Other'
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' }
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  
  // Get filter values from URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  
  // Initialize price range from URL params or defaults
  useEffect(() => {
    setPriceRange([
      minPrice !== undefined ? minPrice : 0,
      maxPrice !== undefined ? maxPrice : 2000
    ]);
  }, [minPrice, maxPrice]);
  
  // Handle search form submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };
  
  // Update URL when filters change
  const updateFilters = (key: string, value: string | number | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    
    setSearchParams(newParams);
  };
  
  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };
  
  // Apply price filter to URL
  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', String(priceRange[0]));
    newParams.set('maxPrice', String(priceRange[1]));
    setSearchParams(newParams);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setPriceRange([0, 2000]);
  };
  
  // Fetch products with filters
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search, category, minPrice, maxPrice, sort],
    queryFn: () => getAllProducts({
      search,
      category,
      minPrice,
      maxPrice,
      sort
    })
  });
  
  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (search) count++;
    if (category) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    return count;
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover our wide range of products from trusted sellers
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="font-medium mb-4 flex justify-between items-center">
                <h3>Filters</h3>
                
                {getActiveFiltersCount() > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="h-8 text-sm"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Search</h4>
                <form onSubmit={handleSearch} className="flex">
                  <Input 
                    placeholder="Search products..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none px-3">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center">
                      <Checkbox 
                        id={`category-${cat}`} 
                        checked={category === cat}
                        onCheckedChange={(checked) => {
                          updateFilters('category', checked ? cat : null);
                        }}
                      />
                      <Label 
                        htmlFor={`category-${cat}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-4">Price Range</h4>
                <Slider
                  value={priceRange}
                  min={0}
                  max={2000}
                  step={10}
                  onValueChange={handlePriceChange}
                  className="mb-4"
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={applyPriceFilter}
                  className="w-full"
                >
                  Apply Price
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile Filters - Slide Out */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
                <div className="absolute top-0 left-0 h-full w-80 bg-white dark:bg-slate-900 shadow-xl flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 space-y-6">
                    {/* Search */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Search</h4>
                      <form onSubmit={(e) => {
                        handleSearch(e);
                        setMobileFiltersOpen(false);
                      }} className="flex">
                        <Input 
                          placeholder="Search products..." 
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button type="submit" className="rounded-l-none px-3">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                    
                    {/* Categories */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Categories</h4>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <div key={cat} className="flex items-center">
                            <Checkbox 
                              id={`mobile-category-${cat}`} 
                              checked={category === cat}
                              onCheckedChange={(checked) => {
                                updateFilters('category', checked ? cat : null);
                              }}
                            />
                            <Label 
                              htmlFor={`mobile-category-${cat}`}
                              className="ml-2 text-sm cursor-pointer"
                            >
                              {cat}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price Range */}
                    <div>
                      <h4 className="text-sm font-medium mb-4">Price Range</h4>
                      <Slider
                        value={priceRange}
                        min={0}
                        max={2000}
                        step={10}
                        onValueChange={handlePriceChange}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">${priceRange[0]}</span>
                        <span className="text-sm">${priceRange[1]}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          applyPriceFilter();
                          setMobileFiltersOpen(false);
                        }}
                        className="w-full"
                      >
                        Apply Price
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        resetFilters();
                        setMobileFiltersOpen(false);
                      }}
                    >
                      Clear All
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Product Grid */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">
                    {category ? `${category} Products` : 'All Products'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {products?.length || 0} products found
                  </p>
                </div>
                
                <div className="flex gap-4 items-center ml-auto">
                  <Select
                    value={sort}
                    onValueChange={(value) => updateFilters('sort', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Search: {search}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-transparent"
                      onClick={() => updateFilters('search', null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {category && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Category: {category}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-transparent"
                      onClick={() => updateFilters('category', null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Price: ${minPrice || 0} - ${maxPrice || 2000}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-transparent"
                      onClick={() => {
                        updateFilters('minPrice', null);
                        updateFilters('maxPrice', null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {isLoading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={resetFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
