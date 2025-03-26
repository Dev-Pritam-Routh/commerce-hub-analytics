import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
const ProfilePage = () => {
  const {
    user
  } = useAuth();
  return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="p-6 rounded-lg shadow-md bg-gray-600">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
    </div>;
};
export default ProfilePage;