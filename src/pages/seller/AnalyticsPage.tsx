
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/ui/StatsCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Calendar, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

const SellerAnalyticsPage = () => {
  // Mock data for charts
  const salesData = [
    { name: 'Jan', sales: 4000, orders: 24 },
    { name: 'Feb', sales: 3000, orders: 18 },
    { name: 'Mar', sales: 5000, orders: 32 },
    { name: 'Apr', sales: 2780, orders: 16 },
    { name: 'May', sales: 1890, orders: 12 },
    { name: 'Jun', sales: 2390, orders: 14 },
    { name: 'Jul', sales: 3490, orders: 22 },
    { name: 'Aug', sales: 4000, orders: 28 },
    { name: 'Sep', sales: 5000, orders: 38 },
    { name: 'Oct', sales: 4500, orders: 30 },
    { name: 'Nov', sales: 6000, orders: 42 },
    { name: 'Dec', sales: 7000, orders: 48 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 48 },
    { name: 'Clothing', value: 20 },
    { name: 'Home', value: 15 },
    { name: 'Beauty', value: 10 },
    { name: 'Books', value: 7 },
  ];

  const productData = [
    { name: 'Wireless Earbuds', sales: 125 },
    { name: 'Smart Watch', sales: 85 },
    { name: 'Bluetooth Speaker', sales: 65 },
    { name: 'Phone Case', sales: 45 },
    { name: 'USB Cable', sales: 30 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Insights and performance metrics for your store
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Sales"
          value="$28,950"
          icon={<DollarSign className="h-full w-full" />}
          trend={{ value: 12, isPositive: true }}
          description="Compared to last month"
        />
        
        <StatsCard 
          title="Average Order"
          value="$113.20"
          icon={<ShoppingBag className="h-full w-full" />}
          trend={{ value: 8, isPositive: true }}
          description="Compared to last month"
        />
        
        <StatsCard 
          title="Total Orders"
          value="256"
          icon={<Calendar className="h-full w-full" />}
          trend={{ value: 5, isPositive: true }}
          description="Compared to last month"
        />
        
        <StatsCard 
          title="Conversion Rate"
          value="3.2%"
          icon={<TrendingUp className="h-full w-full" />}
          trend={{ value: 1.5, isPositive: true }}
          description="Compared to last month"
        />
      </div>
      
      <Tabs defaultValue="sales" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Monthly order count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products by units sold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Sales distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Location</CardTitle>
            <CardDescription>Top regions by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>California</span>
                <span className="font-medium">$8,250</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>New York</span>
                <span className="font-medium">$6,380</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Texas</span>
                <span className="font-medium">$4,250</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Florida</span>
                <span className="font-medium">$3,750</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Illinois</span>
                <span className="font-medium">$2,830</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory Health</CardTitle>
            <CardDescription>Stock level insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  Healthy Stock
                </span>
                <span className="font-medium">38 products</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-amber-500 mr-2"></span>
                  Medium Stock
                </span>
                <span className="font-medium">5 products</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                  Low Stock
                </span>
                <span className="font-medium">5 products</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;
