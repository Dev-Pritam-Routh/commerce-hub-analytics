
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, XCircle, ExternalLink, Filter, ArrowDown, ArrowUp, Eye } from 'lucide-react';
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
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { fetchAdminOrders, updateOrderStatus } from '@/services/orderService';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  seller: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrders', { search: searchTerm, status: statusFilter, sortBy, sortOrder, page, limit }],
    queryFn: () => fetchAdminOrders({ 
      search: searchTerm, 
      status: statusFilter, 
      sortBy, 
      sortOrder, 
      page, 
      limit 
    }),
    keepPreviousData: true,
  });
  
  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => 
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Failed to load orders');
      console.error('Error loading orders:', error);
    }
  }, [error]);
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };
  
  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const renderStatusMenu = (order: Order) => {
    const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    return (
      <select
        className="w-full p-1 border rounded text-sm"
        value={order.status}
        onChange={(e) => updateStatusMutation.mutate({ 
          orderId: order._id, 
          status: e.target.value 
        })}
        disabled={updateStatusMutation.isLoading}
      >
        {statusOptions.map(status => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    );
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
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all customer orders</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {data && data.total > 0 
                ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.total)} of ${data.total} orders`
                : 'No orders found'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('_id')}
                >
                  <div className="flex items-center gap-1">
                    Order ID {getSortIcon('_id')}
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center gap-1">
                    Total {getSortIcon('totalAmount')}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.orders && data.orders.length > 0 ? (
                data.orders.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      <div className="text-xs">{order._id.substring(0, 10)}...</div>
                    </TableCell>
                    <TableCell>{order.user?.name || 'Unknown User'}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {renderStatusMenu(order)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{formatTimeAgo(order.createdAt)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="mr-2"
                        title="View order details"
                      >
                        <Link to={`/orders/${order._id}`}>
                          <Eye size={16} />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No orders found matching your filters
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

export default AdminOrdersPage;
