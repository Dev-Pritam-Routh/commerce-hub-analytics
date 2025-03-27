
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AssistantNavLink from './AssistantNavLink';

const MainNav = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <nav className="flex items-center space-x-1 lg:space-x-2">
      <Button variant="ghost" asChild className="hover:bg-primary/10">
        <Link to="/">Home</Link>
      </Button>
      <Button variant="ghost" asChild className="hover:bg-primary/10">
        <Link to="/products">Products</Link>
      </Button>
      <AssistantNavLink />
      
      {isAuthenticated && user?.role === 'admin' && (
        <Button variant="ghost" asChild className="hover:bg-primary/10">
          <Link to="/admin/dashboard">Admin</Link>
        </Button>
      )}
      
      {isAuthenticated && user?.role === 'seller' && (
        <Button variant="ghost" asChild className="hover:bg-primary/10">
          <Link to="/seller/dashboard">Seller</Link>
        </Button>
      )}
    </nav>
  );
};

export default MainNav;
