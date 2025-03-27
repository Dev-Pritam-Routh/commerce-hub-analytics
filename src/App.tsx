
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SellerRegisterPage from "./pages/SellerRegisterPage";
import AssistantPage from "./pages/AssistantPage";
import NotFound from "./pages/NotFound";

// User Pages
import ProfilePage from "./pages/user/ProfilePage";
import OrdersPage from "./pages/user/OrdersPage";
import OrderDetailPage from "./pages/user/OrderDetailPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";

// Seller Pages
import SellerDashboardPage from "./pages/seller/DashboardPage";
import SellerProductsPage from "./pages/seller/ProductsPage";
import SellerAddProductPage from "./pages/seller/AddProductPage";
import SellerEditProductPage from "./pages/seller/EditProductPage";
import SellerOrdersPage from "./pages/seller/OrdersPage";
import SellerAnalyticsPage from "./pages/seller/AnalyticsPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminSellersPage from "./pages/admin/SellersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster closeButton={true} position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="seller/register" element={<SellerRegisterPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                
                {/* User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                </Route>
                
                {/* Seller Routes */}
                <Route element={<RoleRoute allowedRoles={['seller', 'admin']} />}>
                  <Route path="seller/dashboard" element={<SellerDashboardPage />} />
                  <Route path="seller/products" element={<SellerProductsPage />} />
                  <Route path="seller/products/add" element={<SellerAddProductPage />} />
                  <Route path="seller/products/edit/:id" element={<SellerEditProductPage />} />
                  <Route path="seller/orders" element={<SellerOrdersPage />} />
                  <Route path="seller/analytics" element={<SellerAnalyticsPage />} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="admin/users" element={<AdminUsersPage />} />
                  <Route path="admin/products" element={<AdminProductsPage />} />
                  <Route path="admin/orders" element={<AdminOrdersPage />} />
                  <Route path="admin/sellers" element={<AdminSellersPage />} />
                </Route>
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
