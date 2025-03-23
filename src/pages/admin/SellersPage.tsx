
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, XCircle, Trash, ExternalLink } from 'lucide-react';
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
  fetchAllSellers,
  updateSellerStatus,
  deleteSeller 
} from '@/services/adminService';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Seller {
  _id: string;
  name: string;
  email: string;
  products: number;
  revenue: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const AdminSellersPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminSellers', { search: searchTerm, status: statusFilter, page, limit }],
    queryFn: () => fetchAllSellers({ search: searchTerm, status: statusFilter, page, limit }),
    keepPreviousData: true,
  });
  
  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ sellerId, status }: { sellerId: string, status: 'active' | 'inactive' }) => 
      updateSellerStatus(sellerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSellers'] });
      toast.success('Seller status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update seller status');
    }
  });
  
  const deleteSellerMutation = useMutation({
    mutationFn: (sellerId: string) => deleteSeller(sellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSellers'] });
      toast.success('Seller account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete seller account');
    }
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Failed to load sellers');
      console.error('Error loading sellers:', error);
    }
  }, [error]);
  
  const handleToggleStatus = (seller: Seller) => {
    const newStatus = seller.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ sellerId: seller._id, status: newStatus });
  };
  
  const handleDeleteSeller = (sellerId: string) => {
    if (window.confirm('Are you sure you want to delete this seller account? This action cannot be undone.')) {
      deleteSellerMutation.mutate(sellerId);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h1 className="text-3xl font-bold">Sellers</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage marketplace sellers</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search sellers..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="w-full sm:w-48">
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
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {data && data.total > 0 
                ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.total)} of ${data.total} sellers`
                : 'No sellers found'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.sellers && data.sellers.length > 0 ? (
                data.sellers.map((seller: Seller) => (
                  <TableRow key={seller._id}>
                    <TableCell className="font-medium">
                      <div>{seller.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: {seller._id}</div>
                    </TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>{seller.products}</TableCell>
                    <TableCell>${seller.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        seller.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : seller.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {seller.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(seller.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(seller)}
                        disabled={toggleStatusMutation.isLoading}
                        className="mr-2"
                        title={seller.status === 'active' ? 'Deactivate seller' : 'Activate seller'}
                      >
                        {seller.status === 'active' ? (
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
                        title="View seller products"
                      >
                        <Link to={`/admin/products?seller=${seller._id}`}>
                          <ExternalLink size={16} />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSeller(seller._id)}
                        disabled={deleteSellerMutation.isLoading}
                        title="Delete seller account"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No sellers found matching your filters
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

export default AdminSellersPage;
