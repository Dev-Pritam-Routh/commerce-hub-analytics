
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';

const SellerEditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
    status: 'active'
  });
  
  useEffect(() => {
    // Simulate API call to fetch product
    setTimeout(() => {
      // Mock data
      setProduct({
        name: 'Wireless Earbuds',
        description: 'High-quality wireless earbuds with noise cancellation.',
        category: 'Electronics',
        price: '59.99',
        stock: '12',
        imageUrl: 'https://example.com/earbuds.jpg',
        status: 'active'
      });
      setIsLoading(false);
    }, 500);
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!product.name || !product.description || !product.category || !product.price || !product.stock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Product has been updated successfully.",
      });
      setIsSubmitting(false);
      navigate('/seller/products');
    }, 1000);
  };
  
  const categories = ['Electronics', 'Accessories', 'Clothing', 'Home', 'Beauty'];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-slate-600 dark:text-slate-400">Update your product information</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Status
                </label>
                <select
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={product.imageUrl}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/seller/products')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerEditProductPage;
