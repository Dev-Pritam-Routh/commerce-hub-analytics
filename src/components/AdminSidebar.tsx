
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { expanded, setExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      path: '/admin/dashboard',
      active: isActive('/admin/dashboard')
    },
    {
      icon: <Users size={20} />,
      label: 'Users',
      path: '/admin/users',
      active: isActive('/admin/users')
    },
    {
      icon: <Package size={20} />,
      label: 'Products',
      path: '/admin/products',
      active: isActive('/admin/products')
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Orders',
      path: '/admin/orders',
      active: isActive('/admin/orders')
    },
    {
      icon: <Store size={20} />,
      label: 'Sellers',
      path: '/admin/sellers',
      active: isActive('/admin/sellers')
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      path: '/admin/settings',
      active: isActive('/admin/settings')
    }
  ];
  
  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader>
        {expanded ? (
          <div className="flex items-center">
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={item.active ? 'bg-primary/10 text-primary' : ''}
                  >
                    <Link to={item.path}>
                      {item.icon}
                      {expanded && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="flex flex-col gap-2 px-2">
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>
        
        {expanded && (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="gap-1"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
