
import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <p>Order ID: {id}</p>
      {/* Order details will be implemented later */}
      <div className="py-8">
        <p className="text-gray-500">Order details will be displayed here.</p>
      </div>
    </div>
  );
};

export default OrderDetailPage;
