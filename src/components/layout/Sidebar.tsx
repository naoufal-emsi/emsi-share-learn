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
  Settings,
  DoorOpen
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
    ...(user?.role === 'teacher' ? [
      { name: 'My Rooms', href: '/rooms', icon: DoorOpen },
    ] : []),
    ...(user?.role === 'student' ? [
      { name: 'My Rooms', href: '/student-rooms', icon: DoorOpen },
    ] : []),
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
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col shadow-sm">
      <div className="p-4">
        <div className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center mb-4">
          <div className="flex items-center justify-center bg-gradient-to-r from-primary to-primary-light text-white rounded-full w-10 h-10 shadow-sm">
            {user?.role === 'admin' ? 'A' : user?.role === 'teacher' ? 'T' : 'S'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-primary-dark">{user?.name}</p>
            <p className="text-xs text-neutral capitalize">{user?.role}</p>
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
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md"
                  : "text-neutral-dark hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-neutral")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <h3 className="text-sm font-medium text-primary-dark">Need Help?</h3>
          <p className="text-xs text-neutral mt-1">Check our documentation for help with EMSI Share.</p>
          <Button variant="outline" size="sm" className="mt-3 w-full text-xs border-primary/30 text-primary hover:bg-primary hover:text-white">
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
