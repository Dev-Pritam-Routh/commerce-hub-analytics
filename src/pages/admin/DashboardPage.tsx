import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  TrendingUp,
  UserPlus
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
import { fetchAdminStats } from '@/services/adminService';

const AdminDashboardPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    }
  }, [error]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFEAA7', '#FF6B6B'];
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const generateCategoryData = (categories: Record<string, number> = {}) => {
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };
  
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
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your e-commerce platform
        </p>
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
            value={data?.userStats.totalUsers || 0}
            icon={<Users className="h-full w-full" />}
            description="Active users on platform"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="New Users"
            value={data?.userStats.newUsers || 0}
            icon={<UserPlus className="h-full w-full" />}
            description="In the last 30 days"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Orders"
            value={data?.orderStats.totalOrders || 0}
            icon={<Package className="h-full w-full" />}
            description="All-time orders"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatsCard 
            title="Total Sales"
            value={`$${(data?.orderStats.totalSales || 0).toLocaleString()}`}
            icon={<DollarSign className="h-full w-full" />}
            description="All-time revenue"
          />
        </motion.div>
      </motion.div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
                  <CardDescription>Monthly sales for the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data?.salesData || []}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorSales)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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
                          data={[
                            { name: 'Pending', value: data?.orderStats.statusBreakdown?.pending || 0 },
                            { name: 'Processing', value: data?.orderStats.statusBreakdown?.processing || 0 },
                            { name: 'Shipped', value: data?.orderStats.statusBreakdown?.shipped || 0 },
                            { name: 'Delivered', value: data?.orderStats.statusBreakdown?.delivered || 0 },
                            { name: 'Cancelled', value: data?.orderStats.statusBreakdown?.cancelled || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {[...Array(5)].map((_, index) => (
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
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>Products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={generateCategoryData(data?.productStats.categories)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Detailed sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.salesData || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                      name="Sales ($)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Summary</CardTitle>
                <CardDescription>Overview of product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Total Products</span>
                    <span>{data?.productStats.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Featured Products</span>
                    <span>{data?.productStats.featuredProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Low Stock Products</span>
                    <span className="text-amber-500">{data?.productStats.lowStockProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Categories</span>
                    <span>{Object.keys(data?.productStats.categories || {}).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateCategoryData(data?.productStats.categories || {})}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateCategoryData(data?.productStats.categories || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Summary</CardTitle>
                <CardDescription>Overview of user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Total Users</span>
                    <span>{data?.userStats.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Customers</span>
                    <span>{data?.userStats.totalCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Sellers</span>
                    <span>{data?.userStats.totalSellers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">New Users (30 days)</span>
                    <span className="text-green-500">{data?.userStats.newUsers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data?.salesData || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                  <span className="bg-green-100 text-green-800 p-1.5 rounded-full mr-3">
                    <Package className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">New order #12345 was placed</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">12 minutes ago</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1.5 rounded-full mr-3">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">New seller account registered</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">45 minutes ago</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                  <span className="bg-amber-100 text-amber-800 p-1.5 rounded-full mr-3">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">New product "Smart Watch Pro" added</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex items-start">
                  <span className="bg-purple-100 text-purple-800 p-1.5 rounded-full mr-3">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Daily sales exceeded target by 15%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;
