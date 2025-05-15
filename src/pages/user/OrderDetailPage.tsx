
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/services/orderService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ChevronLeft, Package, Truck, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => token && id ? getOrderById(id, token) : Promise.resolve(null),
    enabled: !!token && !!id,
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/orders"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Order not found or you don't have permission to view it</p>
          <Button asChild>
            <Link to="/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/orders"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Order #{order._id?.substring(0, 8)}</h1>
                <Badge className={getStatusColor(order.status || 'pending')} variant="outline">
                  {order.status || 'pending'}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="mr-1 h-4 w-4" />
                  Placed on {format(new Date(order.createdAt || Date.now()), 'MMMM d, yyyy')}
                </div>
                {order.isDelivered && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Delivered on {format(new Date(order.deliveredAt || Date.now()), 'MMMM d, yyyy')}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-3">Items</h2>
              <div className="space-y-4 mb-6">
                {order.products.map((item, index) => (
                  <div key={index} className="flex items-center border-b pb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mr-4 flex-shrink-0">
                      {item.product && typeof item.product === 'object' && item.product.images && item.product.images[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">
                        {item.name}
                        {item.product && typeof item.product === 'object' && item.product.seller && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 block">
                            Seller: {typeof item.product.seller === 'object' && item.product.seller.name 
                              ? item.product.seller.name 
                              : 'Unknown seller'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} x ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Truck className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Shipping Information</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Shipping Address:</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
                
                <div className="mt-4">
                  <p className="font-medium">Status:</p>
                  <div className="flex items-center mt-1">
                    <Badge className={getStatusColor(order.status || 'pending')} variant="outline">
                      {order.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Payment Information</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Payment Method:</p>
                  <p>{formatPaymentMethod(order.paymentMethod)}</p>
                  <p className="font-medium mt-4">Payment Status:</p>
                  <p>{order.isPaid ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="mr-1 h-4 w-4" /> Paid on {format(new Date(order.paidAt || Date.now()), 'MMMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="text-yellow-600">Not Paid</span>
                  )}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                If you have any questions or issues with your order, please contact our customer support.
              </p>
              <Button variant="outline" className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
