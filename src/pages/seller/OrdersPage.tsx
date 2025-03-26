import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSellerOrders, updateOrderStatus } from '@/services/orderService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}
interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  products: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
const SellerOrdersPage = () => {
  const {
    token
  } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch seller orders
  const {
    data: orders,
    isLoading,
    error
  } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: () => token ? getSellerOrders(token) : Promise.resolve([]),
    enabled: !!token
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status, token || ''),
    onSuccess: () => {
      // Invalidate and refetch orders after status update
      queryClient.invalidateQueries({
        queryKey: ['sellerOrders']
      });
      toast.success('Order status updated successfully');
    },
    onError: error => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  });
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({
      orderId,
      status: newStatus
    });
  };
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders based on search term and status filter
  const filteredOrders = orders ? orders.filter(order => {
    return (order._id?.toLowerCase().includes(searchTerm.toLowerCase()) || order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === '' || order.status === statusFilter);
  }) : [];

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Invalid date';
    }
  };
  if (isLoading) {
    return <div className="px-4 py-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>;
  }
  if (error) {
    return <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium">Error loading orders</h3>
          <p>There was a problem fetching your orders. Please try again later.</p>
          <Button onClick={() => queryClient.invalidateQueries({
          queryKey: ['sellerOrders']
        })} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      </div>;
  }
  return <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your customer orders</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search orders by ID or customer..." className="w-full pl-10 pr-4 py-2 border rounded-md" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border rounded-md bg-gray-600">
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
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredOrders.length > 0 ? filteredOrders.map(order => <React.Fragment key={order._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{order._id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2 py-1 text-xs rounded-full", order.status === 'delivered' ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : order.status === 'shipped' ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" : order.status === 'processing' ? "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100" : order.status === 'pending' ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100")}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => toggleOrderDetails(order._id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                          <ChevronDown size={16} className={expandedOrder === order._id ? "transform rotate-180" : ""} />
                        </button>
                      </td>
                    </tr>
                    
                    {expandedOrder === order._id && <tr>
                        <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-slate-700">
                          <div className="rounded-md p-4">
                            <h3 className="font-medium mb-2">Order Details</h3>
                            
                            <div className="mb-4">
                              <p className="text-sm mb-1">
                                <span className="font-medium">Items:</span> {order.products.length} products
                              </p>
                              <p className="text-sm mb-1">
                                <span className="font-medium">Customer Email:</span> {order.user?.email || 'Not available'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Shipping Address:</span> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                              </p>
                            </div>
                            
                            <div className="border-t pt-4 mb-4">
                              <h4 className="font-medium mb-2">Products</h4>
                              <ul className="space-y-2">
                                {order.products.map((item, index) => <li key={index} className="text-sm">
                                    {item.name} - {item.quantity} x ${item.price.toFixed(2)}
                                  </li>)}
                              </ul>
                            </div>
                            
                            <div className="border-t pt-4 mb-4">
                              <h4 className="font-medium mb-2">Update Status</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button variant={order.status === 'pending' ? "default" : "outline"} size="sm" onClick={() => handleStatusChange(order._id, 'pending')} disabled={order.status === 'pending' || updateStatusMutation.isPending}>
                                  Pending
                                </Button>
                                <Button variant={order.status === 'processing' ? "default" : "outline"} size="sm" onClick={() => handleStatusChange(order._id, 'processing')} disabled={order.status === 'processing' || updateStatusMutation.isPending}>
                                  Processing
                                </Button>
                                <Button variant={order.status === 'shipped' ? "default" : "outline"} size="sm" onClick={() => handleStatusChange(order._id, 'shipped')} disabled={order.status === 'shipped' || updateStatusMutation.isPending}>
                                  Shipped
                                </Button>
                                <Button variant={order.status === 'delivered' ? "default" : "outline"} size="sm" onClick={() => handleStatusChange(order._id, 'delivered')} disabled={order.status === 'delivered' || updateStatusMutation.isPending}>
                                  Delivered
                                </Button>
                                <Button variant={order.status === 'cancelled' ? "default" : "outline"} size="sm" onClick={() => handleStatusChange(order._id, 'cancelled')} disabled={order.status === 'cancelled' || updateStatusMutation.isPending}>
                                  Cancelled
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>}
                  </React.Fragment>) : <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No orders found
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default SellerOrdersPage;