
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, XCircle, Edit, Trash, ExternalLink } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  fetchAllProducts, 
  updateProductStatus, 
  deleteProduct 
} from '@/services/adminService';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  seller: {
    _id: string;
    name: string;
    email: string;
  };
}

const PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Books', 'Beauty', 'Toys', 'Sports', 'Food', 'Other'];

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProducts', { search: searchTerm, category: categoryFilter, status: statusFilter, page, limit }],
    queryFn: () => fetchAllProducts({ search: searchTerm, category: categoryFilter, status: statusFilter, page, limit }),
    keepPreviousData: true,
  });
  
  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ productId, status }: { productId: string, status: 'active' | 'inactive' }) => 
      updateProductStatus(productId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product status');
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    }
  }, [error]);
  
  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ productId: product._id, status: newStatus });
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
  };
  
  const renderPagination = () => {
    if (!data || !data.totalPages) return null;
    
    const totalPages = data.totalPages;
    const currentPage = data.page;
    
    // Simplified pagination for mobile
    if (isMobile) {
      return (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
    }
    
    // Create array of pages to show
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at edges
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis1');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis2');
      }
      
      // Add last page if not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pages.map((p, idx) => 
            typeof p === 'number' ? (
              <PaginationItem key={`page-${p}`}>
                <PaginationLink 
                  isActive={currentPage === p}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="w-full md:w-40">
            <select
              className="w-full p-2 border rounded-md"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-40">
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {data && data.total > 0 
                ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.total)} of ${data.total} products`
                : 'No products found'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.products && data.products.length > 0 ? (
                data.products.map((product: Product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      <div>{product.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: {product._id}</div>
                    </TableCell>
                    <TableCell>{product.seller ? product.seller.name : 'Unknown'}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock < 10 ? 'text-amber-500 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : product.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(product)}
                        disabled={toggleStatusMutation.isLoading}
                        className="mr-2"
                        title={product.status === 'active' ? 'Deactivate product' : 'Activate product'}
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
                        title="View product"
                      >
                        <Link to={`/products/${product._id}`}>
                          <ExternalLink size={16} />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        title="Edit product"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={deleteProductMutation.isLoading}
                        title="Delete product"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {renderPagination()}
      </div>
    </div>
  );
};

export default AdminProductsPage;
