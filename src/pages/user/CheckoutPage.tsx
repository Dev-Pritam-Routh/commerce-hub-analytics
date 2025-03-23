import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { createOrder } from '@/services/orderService';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { token } = useAuth();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const createOrderMutation = useMutation(createOrder, {
    onSuccess: (data) => {
      toast.success('Order created successfully!');
      clearCart();
      navigate(`/orders/${data.order._id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        seller: item.seller
      })),
      shippingInfo,
      paymentMethod,
      totalAmount: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    };
    
    // Remove the token parameter
    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                id="city"
                name="city"
                value={shippingInfo.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                type="text"
                id="state"
                name="state"
                value={shippingInfo.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                value={shippingInfo.postalCode}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => setShippingInfo({ ...shippingInfo, country: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" defaultValue="USA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  {/* Add more countries as needed */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="credit_card" className="flex flex-col space-y-1" onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                  <Label htmlFor="cash_on_delivery">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" disabled={createOrderMutation.isLoading}>
              {createOrderMutation.isLoading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;
