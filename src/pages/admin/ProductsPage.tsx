
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Search, Edit, Trash, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProductsForAdmin, updateProductStatus, deleteProductAdmin } from '@/services/adminService';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  seller: {
    _id: string;
    name: string;
  };
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'archived';
}

const AdminProductsPage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => token ? getAllProductsForAdmin(token) : Promise.resolve([]),
    enabled: !!token
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'active' | 'inactive' | 'archived' }) => 
      updateProductStatus(id, status, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Status Updated',
        description: 'Product status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error updating product status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update product status.',
        variant: 'destructive',
      });
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductAdmin(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Product Deleted',
        description: 'Product has been removed successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete product.',
        variant: 'destructive',
      });
    }
  });
  
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateStatusMutation.mutate({ id, status: newStatus as 'active' | 'inactive' | 'archived' });
  };
  
  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      deleteProductMutation.mutate(id);
    }
  };
  
  const filteredProducts = products.filter((product: Product) => {
    return (
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.seller?.name && product.seller.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (categoryFilter === '' || product.category === categoryFilter) &&
      (statusFilter === '' || product.status === statusFilter)
    );
  });
  
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Beauty', 'Toys', 'Sports', 'Food', 'Other'];
  
  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-7xl mx-auto flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Error Loading Products</h2>
          <p className="text-red-600 dark:text-red-400">
            Failed to load products. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
  
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
              <option value="archived">Archived</option>
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
              {filteredProducts.map((product: Product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">ID: {product._id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.seller?.name || 'Unknown Seller'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${product.price?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.stock || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : product.status === 'archived'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(product._id, product.status)}
                      className="mr-2"
                      disabled={updateStatusMutation.isPending}
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
                      asChild
                    >
                      <Link to={`/admin/products/edit/${product._id}`}>
                        <Edit size={16} />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deleteProductMutation.isPending}
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
