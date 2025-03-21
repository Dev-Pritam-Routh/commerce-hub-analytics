
import React from 'react';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  // Placeholder data - in a real app this would come from an API
  const orders = [
    { id: '1', date: '2023-05-15', total: 259.99, status: 'delivered' },
    { id: '2', date: '2023-05-20', total: 129.50, status: 'shipped' },
    { id: '3', date: '2023-05-25', total: 399.99, status: 'processing' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">${order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{order.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
