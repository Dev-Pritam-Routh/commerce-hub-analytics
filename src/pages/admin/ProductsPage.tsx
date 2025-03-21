
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Edit, Trash, CheckCircle, XCircle } from 'lucide-react';

const AdminProductsPage = () => {
  // Placeholder data - in a real app this would come from an API
  const [products, setProducts] = useState([
    { id: '1', name: 'Wireless Earbuds', seller: 'Tech Shop', category: 'Electronics', price: 59.99, stock: 12, status: 'active' },
    { id: '2', name: 'Smart Watch Pro', seller: 'Tech Shop', category: 'Electronics', price: 199.99, stock: 8, status: 'active' },
    { id: '3', name: 'Bluetooth Speaker', seller: 'Audio Store', category: 'Electronics', price: 79.99, stock: 5, status: 'active' },
    { id: '4', name: 'Leather Wallet', seller: 'Fashion Hub', category: 'Accessories', price: 39.99, stock: 20, status: 'active' },
    { id: '5', name: 'Phone Case', seller: 'Phone Accessories', category: 'Accessories', price: 19.99, stock: 15, status: 'inactive' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const filteredProducts = products.filter(product => {
    return (
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === '' || product.category === categoryFilter) &&
      (statusFilter === '' || product.status === statusFilter)
    );
  });
  
  const categories = ['Electronics', 'Accessories', 'Clothing', 'Home', 'Beauty'];
  
  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };
  
  const handleToggleStatus = (id: string) => {
    setProducts(
      products.map(product => 
        product.id === id 
          ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' } 
          : product
      )
    );
  };
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all products in the marketplace</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products or sellers..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-40">
            <select
              className="w-full p-2 border rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-40">
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">ID: {product.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.seller}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(product.id)}
                      className="mr-2"
                    >
                      {product.status === 'active' ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
