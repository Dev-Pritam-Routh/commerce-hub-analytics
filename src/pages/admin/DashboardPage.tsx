import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  BarChart4,
  RefreshCcw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { 
  getDashboardOverview, 
  getSalesData, 
  getUsersData,
  getInventoryData,
  clearDashboardCache
} from '@/services/dashboardService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFEAA7', '#FF6B6B'];

const AdminDashboardPage = () => {
  const { user, token } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch overview data
  const { 
    data: overviewData, 
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: () => token ? getDashboardOverview(token) : Promise.reject('No token available'),
    enabled: !!token && !!user && user.role === 'admin'
  });
  
  // Fetch sales data with timeFrame parameter
  const { 
    data: salesData, 
    isLoading: isSalesLoading,
    error: salesError,
    refetch: refetchSales
  } = useQuery({
    queryKey: ['dashboardSales', timeFrame],
    queryFn: () => token ? getSalesData(token, timeFrame) : Promise.reject('No token available'),
    enabled: !!token && !!user && user.role === 'admin'
  });
  
  // Fetch users data
  const { 
    data: usersData, 
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['dashboardUsers'],
    queryFn: () => token ? getUsersData(token) : Promise.reject('No token available'),
    enabled: !!token && !!user && user.role === 'admin'
  });
  
  // Fetch inventory data
  const { 
    data: inventoryData, 
    isLoading: isInventoryLoading,
    error: inventoryError,
    refetch: refetchInventory
  } = useQuery({
    queryKey: ['dashboardInventory'],
    queryFn: () => token ? getInventoryData(token) : Promise.reject('No token available'),
    enabled: !!token && !!user && user.role === 'admin'
  });
  
  // Handle time frame change
  const handleTimeFrameChange = (value: 'daily' | 'weekly' | 'monthly') => {
    setTimeFrame(value);
  };
  
  // Handle refresh button click
  const handleRefresh = async (section: string) => {
    try {
      if (!token) return;
      
      await clearDashboardCache(token, section);
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been refreshed",
      });
      
      switch (section) {
        case 'overview':
          refetchOverview();
          break;
        case 'sales':
          refetchSales();
          break;
        case 'users':
          refetchUsers();
          break;
        case 'inventory':
          refetchInventory();
          break;
        default:
          refetchOverview();
          refetchSales();
          refetchUsers();
          refetchInventory();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data",
        variant: "destructive"
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Show loading state for the entire dashboard
  if (isOverviewLoading && isSalesLoading && isUsersLoading && isInventoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Check for errors and display error message
  if (overviewError || salesError || usersError || inventoryError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4 text-center">There was an error loading the dashboard data. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
      transition: { duration: 0.5 }
    }
  };

  // Default order status data in case the backend doesn't provide it
  const defaultOrderStatusData = [
    { name: 'Pending', value: 48 },
    { name: 'Processing', value: 36 },
    { name: 'Shipped', value: 58 },
    { name: 'Delivered', value: 982 },
    { name: 'Cancelled', value: 124 }
  ];

  // Use the order status data from the backend if available, otherwise fall back to default
  const orderStatusData = overviewData?.orderStatusData || defaultOrderStatusData;
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of your e-commerce platform
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => handleRefresh('all')}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh All
        </Button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Users"
            value={overviewData?.totalUsers || 0}
            icon={<Users className="h-full w-full" />}
            trend={{ value: 12, isPositive: true }}
            description="Compared to last month"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Orders"
            value={overviewData?.totalOrders || 0}
            icon={<Package className="h-full w-full" />}
            trend={{ value: 8, isPositive: true }}
            description="Compared to last month"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Revenue"
            value={formatCurrency(overviewData?.totalRevenue || 44000)}
            icon={<DollarSign className="h-full w-full" />}
            trend={{ value: 14, isPositive: true }}
            description="Compared to last month"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Recent Orders"
            value={overviewData?.recentOrdersCount || 0}
            icon={<ShoppingBag className="h-full w-full" />}
            description="In the last 7 days"
          />
        </motion.div>
      </motion.div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dashboard Overview</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRefresh('overview')}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Recent sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {salesData?.salesTrends && salesData.salesTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={salesData.salesTrends}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-500">No sales data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {orderStatusData.map((_, index) => (
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 overflow-auto">
                    {salesData?.topSellingProducts && salesData.topSellingProducts.length > 0 ? (
                      <div className="space-y-4">
                        {salesData.topSellingProducts.slice(0, 5).map((item, index) => (
                          <div key={item.product?._id || index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-slate-500">{item.product?.category || 'Unknown Category'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.totalSold} sold</p>
                              <p className="text-sm text-slate-500">{formatCurrency(item.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-500">No product data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="sales">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales Analytics</h2>
            <div className="flex items-center gap-2">
              <Select value={timeFrame} onValueChange={(value: any) => handleTimeFrameChange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRefresh('sales')}
                className="flex items-center gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>
                  {timeFrame === 'daily' && 'Daily sales for the past 30 days'}
                  {timeFrame === 'weekly' && 'Weekly sales for the past 12 weeks'}
                  {timeFrame === 'monthly' && 'Monthly sales for the past 12 months'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {salesData?.salesTrends && salesData.salesTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesData.salesTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                          name="Sales (₹)"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="count" 
                          stroke="#10b981" 
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No sales trends data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-auto">
                  {salesData?.topSellingProducts && salesData.topSellingProducts.length > 0 ? (
                    <div className="space-y-4">
                      {salesData.topSellingProducts.map((item, index) => (
                        <div key={item.product?._id || index} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-sm text-slate-500">{item.product?.category || 'Unknown Category'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.totalSold} sold</p>
                            <p className="text-sm text-slate-500">{formatCurrency(item.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No product data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {salesData?.salesByCategory && salesData.salesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData.salesByCategory}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="totalSales" fill="#3b82f6" name="Sales" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Analytics</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRefresh('users')}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registrations</CardTitle>
                <CardDescription>New user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {usersData?.registrationsOverTime && usersData.registrationsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={usersData.registrationsOverTime}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#colorUsers)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No user registration data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Distribution of user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {usersData?.userRoles && usersData.userRoles.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usersData.userRoles}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="role"
                          label
                        >
                          {usersData.userRoles.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No user role data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Top users by order count and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-auto">
                  {usersData?.userEngagement && usersData.userEngagement.length > 0 ? (
                    <div className="space-y-4">
                      {usersData.userEngagement.map((item, index) => (
                        <div key={item.user?._id || index} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.user?.name || 'Unknown User'}</p>
                            <p className="text-sm text-slate-500">{item.user?.email || 'No email'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.orderCount} orders</p>
                            <p className="text-sm text-slate-500">{formatCurrency(item.totalSpent)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No user engagement data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inventory Analytics</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRefresh('inventory')}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Products with low inventory levels</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-md bg-amber-500/10 p-1.5 text-amber-500">
                  <AlertTriangle className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-auto">
                  {inventoryData?.lowStockProducts && inventoryData.lowStockProducts.length > 0 ? (
                    <div className="space-y-4">
                      {inventoryData.lowStockProducts.map((product) => (
                        <div key={product._id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.category}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock <= 3 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {product.stock} in stock
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No low stock products</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>Product stock distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {inventoryData?.inventoryLevels && inventoryData.inventoryLevels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryData.inventoryLevels}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="level"
                          label
                        >
                          {inventoryData.inventoryLevels.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No inventory level data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock by Category</CardTitle>
                <CardDescription>Inventory levels across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {inventoryData?.stockByCategory && inventoryData.stockByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryData.stockByCategory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalStock" fill="#3b82f6" name="Total Stock" />
                        <Bar dataKey="productCount" fill="#10b981" name="Product Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">No category inventory data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <motion.div 
        className="grid grid-cols-1 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overviewData?.recentOrders && overviewData.recentOrders.slice(0, 4).map((order) => (
                  <div key={order._id} className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                    <span className="bg-green-100 text-green-800 p-1.5 rounded-full mr-3">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">New order #{order._id.substring(0, 6)} was placed</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!overviewData?.recentOrders || overviewData.recentOrders.length === 0) && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                    <span className="bg-blue-100 text-blue-800 p-1.5 rounded-full mr-3">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">No recent orders found</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Check back later for new activity</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;