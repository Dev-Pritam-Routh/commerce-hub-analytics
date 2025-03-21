
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Edit, Trash, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSellersPage = () => {
  // Placeholder data - in a real app this would come from an API
  const [sellers, setSellers] = useState([
    { id: '1', name: 'Tech Shop', email: 'contact@techshop.com', products: 45, revenue: 12500, status: 'active', joined: '2023-01-15' },
    { id: '2', name: 'Fashion Hub', email: 'sales@fashionhub.com', products: 78, revenue: 9800, status: 'active', joined: '2023-02-10' },
    { id: '3', name: 'Home Goods', email: 'info@homegoods.com', products: 34, revenue: 5600, status: 'active', joined: '2023-03-05' },
    { id: '4', name: 'Beauty Store', email: 'hello@beautystore.com', products: 22, revenue: 3200, status: 'inactive', joined: '2023-04-20' },
    { id: '5', name: 'Sport Outlet', email: 'support@sportoutlet.com', products: 15, revenue: 2100, status: 'pending', joined: '2023-05-12' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const filteredSellers = sellers.filter(seller => {
    return (
      (seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || seller.status === statusFilter)
    );
  });
  
  const handleDeleteSeller = (id: string) => {
    setSellers(sellers.filter(seller => seller.id !== id));
  };
  
  const handleToggleStatus = (id: string) => {
    setSellers(
      sellers.map(seller => 
        seller.id === id 
          ? { ...seller, status: seller.status === 'active' ? 'inactive' : 'active' } 
          : seller
      )
    );
  };
  
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{seller.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">ID: {seller.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{seller.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{seller.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${seller.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      seller.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : seller.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{seller.joined}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(seller.id)}
                      className="mr-2"
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
                    >
                      <Link to={`/admin/products?seller=${seller.id}`}>
                        <ExternalLink size={16} />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSeller(seller.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No sellers found
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

export default AdminSellersPage;
