
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SellerOrdersPage = () => {
  // Placeholder data - in a real app this would come from an API
  const [orders, setOrders] = useState([
    { id: 'ORD-12345', date: '2023-05-15', customer: 'John Doe', total: 259.99, status: 'delivered', items: 3 },
    { id: 'ORD-12346', date: '2023-05-16', customer: 'Jane Smith', total: 129.50, status: 'shipped', items: 2 },
    { id: 'ORD-12347', date: '2023-05-17', customer: 'Bob Johnson', total: 399.99, status: 'processing', items: 1 },
    { id: 'ORD-12348', date: '2023-05-18', customer: 'Alice Brown', total: 74.99, status: 'pending', items: 1 },
    { id: 'ORD-12349', date: '2023-05-19', customer: 'Charlie Davis', total: 149.95, status: 'shipped', items: 2 },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const filteredOrders = orders.filter(order => {
    return (
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || order.status === statusFilter)
    );
  });
  
  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your customer orders</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search orders by ID or customer..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          order.status === 'delivered' ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" :
                          order.status === 'shipped' ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" :
                          order.status === 'processing' ? "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100" :
                          order.status === 'pending' ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100" :
                          "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <ChevronDown size={16} className={expandedOrder === order.id ? "transform rotate-180" : ""} />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-slate-700">
                        <div className="rounded-md p-4">
                          <h3 className="font-medium mb-2">Order Details</h3>
                          
                          <div className="mb-4">
                            <p className="text-sm mb-1">
                              <span className="font-medium">Items:</span> {order.items} products
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Shipping Address:</span> 123 Main St, Anytown, USA
                            </p>
                          </div>
                          
                          <div className="border-t pt-4 mb-4">
                            <h4 className="font-medium mb-2">Update Status</h4>
                            <div className="flex space-x-2">
                              <Button
                                variant={order.status === 'pending' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'pending')}
                                disabled={order.status === 'pending'}
                              >
                                Pending
                              </Button>
                              <Button
                                variant={order.status === 'processing' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'processing')}
                                disabled={order.status === 'processing'}
                              >
                                Processing
                              </Button>
                              <Button
                                variant={order.status === 'shipped' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'shipped')}
                                disabled={order.status === 'shipped'}
                              >
                                Shipped
                              </Button>
                              <Button
                                variant={order.status === 'delivered' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                disabled={order.status === 'delivered'}
                              >
                                Delivered
                              </Button>
                              <Button
                                variant={order.status === 'cancelled' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                                disabled={order.status === 'cancelled'}
                              >
                                Cancelled
                              </Button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No orders found
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

export default SellerOrdersPage;
