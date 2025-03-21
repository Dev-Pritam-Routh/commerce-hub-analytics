
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Product Detail</h1>
      <p>Product ID: {id}</p>
      {/* Product details will be implemented later */}
      <div className="py-8">
        <p className="text-gray-500">Product details will be displayed here.</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
