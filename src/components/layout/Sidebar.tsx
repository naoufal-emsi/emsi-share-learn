
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  MessageSquare, 
  BarChart, 
  FileText, 
  Home, 
  Users, 
  Calendar,
  GraduationCap,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Define navigation items based on user role
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Resources', href: '/resources', icon: FileText },
    { name: 'Quiz', href: '/quiz', icon: GraduationCap },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    ...(user?.role === 'teacher' || user?.role === 'admin' ? [
      { name: 'Analytics', href: '/analytics', icon: BarChart },
    ] : []),
    { name: 'Events', href: '/events', icon: Calendar },
    ...(user?.role === 'admin' ? [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Settings', href: '/settings', icon: Settings },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4">
        <div className="py-3 px-4 rounded-md bg-primary bg-opacity-10 flex items-center mb-4">
          <div className="flex items-center justify-center bg-primary text-white rounded-full w-10 h-10">
            {user?.role === 'admin' ? 'A' : user?.role === 'teacher' ? 'T' : 'S'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-md bg-neutral-light bg-opacity-20">
          <h3 className="text-sm font-medium text-neutral-dark">Need Help?</h3>
          <p className="text-xs text-gray-500 mt-1">Check our documentation for help with EMSI Share.</p>
          <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
