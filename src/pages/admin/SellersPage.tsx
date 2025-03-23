
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Edit, Trash, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSellers, updateUserStatus, deleteUser } from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Seller {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  productsCount?: number;
  revenue?: number;
}

const AdminSellersPage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch sellers data from backend
  const { data: sellers, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => token ? fetchAllSellers(token) : Promise.resolve([]),
    enabled: !!token
  });
  
  // Mutation for toggling seller status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'active' | 'inactive' }) => 
      updateUserStatus(id, status, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: "Success",
        description: "Seller status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating seller status:', error);
      toast({
        title: "Error",
        description: "Failed to update seller status",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a seller
  const deleteSellerMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: "Success", 
        description: "Seller deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting seller:', error);
      toast({
        title: "Error",
        description: "Failed to delete seller",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteSeller = (id: string) => {
    if (confirm('Are you sure you want to delete this seller?')) {
      deleteSellerMutation.mutate(id);
    }
  };
  
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id, status: newStatus as 'active' | 'inactive' });
  };
  
  // Filter sellers based on search term and status
  const filteredSellers = sellers ? sellers.filter((seller: Seller) => {
    return (
      (seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || seller.status === statusFilter)
    );
  }) : [];
  
  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-7xl mx-auto flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Error Loading Sellers</h2>
          <p className="text-red-600 dark:text-red-300">There was a problem fetching the sellers data.</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['sellers'] })}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
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
              {filteredSellers.length > 0 ? (
                filteredSellers.map((seller: Seller) => (
                  <tr key={seller._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{seller.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: {seller._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{seller.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{seller.productsCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">${seller.revenue?.toLocaleString() || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        seller.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(seller.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(seller._id, seller.status)}
                        className="mr-2"
                        disabled={toggleStatusMutation.isPending}
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
                        <Link to={`/admin/products?seller=${seller._id}`}>
                          <ExternalLink size={16} />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSeller(seller._id)}
                        disabled={deleteSellerMutation.isPending}
                      >
                        <Trash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
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
