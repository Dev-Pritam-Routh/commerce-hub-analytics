
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Edit, Trash, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const AdminUsersPage = () => {
  // Placeholder data - in a real app this would come from an API
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', createdAt: '2023-04-10' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'seller', status: 'active', createdAt: '2023-04-15' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', createdAt: '2023-04-20' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'seller', status: 'active', createdAt: '2023-04-25' },
    { id: '5', name: 'Admin User', email: 'pritamrouth20032gmail.com', role: 'admin', status: 'active', createdAt: '2023-03-01' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const filteredUsers = users.filter(user => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === '' || user.role === roleFilter) &&
      (statusFilter === '' || user.status === statusFilter)
    );
  });
  
  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };
  
  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map(user => 
        user.id === id 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
          : user
      )
    );
  };
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage system users</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-40">
            <select
              className="w-full p-2 border rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="w-full md:w-40">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                        : user.role === 'seller'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(user.id)}
                      disabled={user.role === 'admin'} // Can't deactivate admins
                      className="mr-2"
                    >
                      {user.status === 'active' ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'} // Can't delete admins
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No users found
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

export default AdminUsersPage;
