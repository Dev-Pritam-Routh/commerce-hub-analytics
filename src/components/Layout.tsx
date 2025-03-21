
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Suspense } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
