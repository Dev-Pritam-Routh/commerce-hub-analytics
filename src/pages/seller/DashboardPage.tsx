
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  AlertCircle,
  Plus,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  getSellerDashboardOverview, 
  getSellerSalesData, 
  getSellerRecentOrders, 
  getSellerLowStockProducts 
} from '@/services/sellerDashboardService';
import { toast } from 'sonner';

const SellerDashboardPage = () => {
  const { user, token } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch dashboard overview data
  const { 
    data: overviewData, 
    isLoading: isOverviewLoading,
    error: overviewError
  } = useQuery({
    queryKey: ['sellerDashboardOverview'],
    queryFn: () => token ? getSellerDashboardOverview(token) : Promise.resolve(null),
    enabled: !!token
  });
  
  // Fetch sales data
  const { 
    data: salesData, 
    isLoading: isSalesLoading,
    error: salesError 
  } = useQuery({
    queryKey: ['sellerSalesData', timeFrame],
    queryFn: () => token ? getSellerSalesData(token, timeFrame) : Promise.resolve(null),
    enabled: !!token
  });
  
  // Fetch recent orders
  const { 
    data: recentOrders, 
    isLoading: isRecentOrdersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['sellerRecentOrders'],
    queryFn: () => token ? getSellerRecentOrders(token) : Promise.resolve([]),
    enabled: !!token
  });
  
  // Fetch low stock products
  const { 
    data: lowStockProducts, 
    isLoading: isLowStockLoading,
    error: stockError
  } = useQuery({
    queryKey: ['sellerLowStockProducts'],
    queryFn: () => token ? getSellerLowStockProducts(token) : Promise.resolve([]),
    enabled: !!token
  });
  
  useEffect(() => {
    if (overviewError) toast.error("Failed to load dashboard overview");
    if (salesError) toast.error("Failed to load sales data");
    if (ordersError) toast.error("Failed to load recent orders");
    if (stockError) toast.error("Failed to load stock information");
  }, [overviewError, salesError, ordersError, stockError]);
  
  const isLoading = isOverviewLoading || isSalesLoading || isRecentOrdersLoading || isLowStockLoading;
  
  // Fallback data if API fails or during development
  const fallbackSalesData = salesData?.salesData || Array(12).fill(0).map((_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    sales: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 50) + 10
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const orderStatusData = salesData?.orderStatusBreakdown || {
    pending: 5,
    processing: 8,
    shipped: 12,
    delivered: 25,
    cancelled: 2
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gold-dark dark:from-gold-light dark:to-gold bg-clip-text text-transparent">
          Seller Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {user?.name}
        </p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Products"
            value={overviewData?.productStats.totalProducts || 0}
            icon={<ShoppingBag className="h-full w-full" />}
            description={`${overviewData?.productStats.totalActiveProducts || 0} active products`}
            className="hover:shadow-lg dark:hover:shadow-gold/20 transition-all duration-300"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Sales"
            value={`$${(overviewData?.orderStats.totalSales || 0).toLocaleString()}`}
            icon={<DollarSign className="h-full w-full" />}
            trend={{ value: 12, isPositive: true }}
            description="Compared to last month"
            className="hover:shadow-lg dark:hover:shadow-gold/20 transition-all duration-300"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Orders"
            value={overviewData?.orderStats.totalOrders || 0}
            icon={<Package className="h-full w-full" />}
            trend={{ value: 8, isPositive: true }}
            description="Compared to last month"
            className="hover:shadow-lg dark:hover:shadow-gold/20 transition-all duration-300"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Low Stock Items"
            value={overviewData?.productStats.lowStockProducts || 0}
            icon={<AlertCircle className="h-full w-full" />}
            description="Products below threshold"
            className={cn(
              "hover:shadow-lg dark:hover:shadow-gold/20 transition-all duration-300",
              overviewData?.productStats.lowStockProducts > 0 ? "border-amber-500" : ""
            )}
          />
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-md dark:hover:shadow-gold/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Your sales performance over time</CardDescription>
              </div>
              <Tabs 
                defaultValue="monthly" 
                value={timeFrame}
                onValueChange={(value) => setTimeFrame(value as 'daily' | 'weekly' | 'monthly')}
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fallbackSalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#f8fafc' 
                      }} 
                      itemStyle={{ color: '#f8fafc' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#D4AF37" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#D4AF37" }}
                      activeDot={{ r: 6, fill: "#F5D76E" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-md dark:hover:shadow-gold/10 transition-all duration-300">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Distribution of your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: orderStatusData.pending },
                        { name: 'Processing', value: orderStatusData.processing },
                        { name: 'Shipped', value: orderStatusData.shipped },
                        { name: 'Delivered', value: orderStatusData.delivered },
                        { name: 'Cancelled', value: orderStatusData.cancelled }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={400}
                      animationDuration={800}
                    >
                      {[...Array(5)].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#f8fafc' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-[#0088FE] mr-2"></span>
                  <span className="text-xs">Pending</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-[#00C49F] mr-2"></span>
                  <span className="text-xs">Processing</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-[#FFBB28] mr-2"></span>
                  <span className="text-xs">Shipped</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-[#FF8042] mr-2"></span>
                  <span className="text-xs">Delivered</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-[#8884D8] mr-2"></span>
                  <span className="text-xs">Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-md dark:hover:shadow-gold/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <Link to="/seller/orders">
                  <ChevronRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <motion.div 
                      key={order.id} 
                      className="bg-slate-50 dark:bg-slate-800/70 rounded-md p-3 flex items-center justify-between hover:shadow-sm transition-all duration-300"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center">
                        <span className={cn(
                          "w-2 h-2 rounded-full mr-3",
                          order.status === 'delivered' ? "bg-green-500" : 
                          order.status === 'shipped' ? "bg-blue-500" : 
                          order.status === 'processing' ? "bg-amber-500" : 
                          order.status === 'pending' ? "bg-purple-500" : "bg-red-500"
                        )}></span>
                        <div>
                          <p className="text-sm font-medium">{order.id.substring(0, 8)}...</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                        <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{order.status}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-md">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p>No recent orders found</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" asChild className="w-full hover:bg-gold/5 hover:text-gold dark:hover:bg-gold-dark/10 dark:hover:text-gold-light transition-all">
                <Link to="/seller/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-md dark:hover:shadow-gold/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Low Stock Products</CardTitle>
                <CardDescription>Items that need to be restocked</CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <Link to="/seller/products">
                  <ChevronRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts && lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <motion.div 
                      key={product.id} 
                      className="bg-slate-50 dark:bg-slate-800/70 rounded-md p-3 flex items-center justify-between hover:shadow-sm transition-all duration-300"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {product.id.substring(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          product.stock <= product.threshold / 2 ? "text-red-500" : "text-amber-500"
                        )}>
                          {product.stock} left
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Threshold: {product.threshold}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-md">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p>No low stock products found</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" asChild className="w-full hover:bg-gold/5 hover:text-gold dark:hover:bg-gold-dark/10 dark:hover:text-gold-light transition-all">
                <Link to="/seller/products">Manage Inventory</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="hover:shadow-md dark:hover:shadow-gold/10 transition-all duration-300">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-slate-50 dark:bg-slate-800/70 rounded-md p-4 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Most Popular Product</h3>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-bold text-xl bg-gradient-to-r from-primary to-gold-dark dark:from-gold-light dark:to-gold bg-clip-text text-transparent">Wireless Earbuds</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">126 units sold</p>
              </motion.div>
              
              <motion.div 
                className="bg-slate-50 dark:bg-slate-800/70 rounded-md p-4 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Best Selling Day</h3>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-bold text-xl bg-gradient-to-r from-primary to-gold-dark dark:from-gold-light dark:to-gold bg-clip-text text-transparent">Tuesday</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">$2,845 in sales</p>
              </motion.div>
              
              <motion.div 
                className="bg-slate-50 dark:bg-slate-800/70 rounded-md p-4 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Average Order Value</h3>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <p className="font-bold text-xl bg-gradient-to-r from-primary to-gold-dark dark:from-gold-light dark:to-gold bg-clip-text text-transparent">$113.20</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">+8% from last month</p>
              </motion.div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button asChild className="w-full bg-gold hover:bg-gold-dark text-white dark:bg-gold-dark dark:hover:bg-gold dark:text-slate-900 transition-all duration-300">
              <Link to="/seller/analytics">
                View Detailed Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button 
          asChild 
          size="lg"
          className="bg-gold hover:bg-gold-dark text-white dark:bg-gold-dark dark:hover:bg-gold dark:text-slate-900 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Link to="/seller/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default SellerDashboardPage;
