
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById, updateProduct, Product } from '@/services/productService';

const SellerEditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{id: string}>();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
    status: 'active',
    images: [] as string[]
  });
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !token) return;
      
      try {
        setIsLoading(true);
        const fetchedProduct = await getProductById(id);
        console.log("Fetched product:", fetchedProduct);
        
        if (fetchedProduct) {
          setProduct({
            name: fetchedProduct.name,
            description: fetchedProduct.description,
            category: fetchedProduct.category,
            price: fetchedProduct.price.toString(),
            stock: fetchedProduct.stock.toString(),
            status: fetchedProduct.status || 'active',
            imageUrl: fetchedProduct.images && fetchedProduct.images.length > 0 ? fetchedProduct.images[0] : '',
            images: fetchedProduct.images || []
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setProduct({ 
      ...product, 
      imageUrl: value,
      images: value ? [value] : []
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !token) {
      toast({
        title: "Error",
        description: "Missing product ID or authentication token.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    try {
      const productData = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        status: product.status as 'active' | 'draft' | 'archived',
        images: product.imageUrl ? [product.imageUrl] : product.images
      };
      
      console.log("Updating product with data:", productData);
      
      const updatedProduct = await updateProduct(id, productData, token);
      console.log("Product updated:", updatedProduct);
      
      toast({
        title: "Success",
        description: "Product has been updated successfully.",
      });
      
      navigate('/seller/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Beauty', 'Toys', 'Sports', 'Food', 'Other'];
  
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
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
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
                  onChange={handleImageUrlChange}
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
