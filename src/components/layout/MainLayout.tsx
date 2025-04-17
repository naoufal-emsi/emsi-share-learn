
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // If user is not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="md:hidden mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
