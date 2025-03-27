
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerRegisterPage from './pages/SellerRegisterPage';
import NotFound from './pages/NotFound';
import AssistantPage from './pages/AssistantPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ProductDetailPage from './pages/ProductDetailPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminSellersPage from './pages/admin/SellersPage';

// Seller Pages
import SellerDashboardPage from './pages/seller/DashboardPage';
import SellerProductsPage from './pages/seller/ProductsPage';
import SellerOrdersPage from './pages/seller/OrdersPage';
import SellerAddProductPage from './pages/seller/AddProductPage';
import SellerEditProductPage from './pages/seller/EditProductPage';
import SellerAnalyticsPage from './pages/seller/AnalyticsPage';

// User Pages
import UserProfilePage from './pages/user/ProfilePage';
import UserOrdersPage from './pages/user/OrdersPage';
import UserOrderDetailPage from './pages/user/OrderDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'seller/register', element: <SellerRegisterPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      
      // Admin routes
      {
        path: 'admin',
        element: <RoleRoute role="admin" />,
        children: [
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'sellers', element: <AdminSellersPage /> },
        ],
      },
      
      // Seller routes
      {
        path: 'seller',
        element: <RoleRoute role="seller" />,
        children: [
          { path: 'dashboard', element: <SellerDashboardPage /> },
          { path: 'products', element: <SellerProductsPage /> },
          { path: 'products/add', element: <SellerAddProductPage /> },
          { path: 'products/edit/:id', element: <SellerEditProductPage /> },
          { path: 'orders', element: <SellerOrdersPage /> },
          { path: 'analytics', element: <SellerAnalyticsPage /> },
        ],
      },
      
      // Protected user routes
      {
        path: 'user',
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'orders', element: <UserOrdersPage /> },
          { path: 'orders/:id', element: <UserOrderDetailPage /> },
        ],
      },
      
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },
    ],
  },
]);

export default router;
