
import React, { useEffect, useState } from 'react';
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
import { quizzesAPI } from '@/services/api';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [publicQuizzes, setPublicQuizzes] = useState<any[]>([]);
  
  // Fetch public quizzes
  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const quizzes = await quizzesAPI.getPublicQuizzes();
        setPublicQuizzes(quizzes);
      } catch (error) {
        console.error('Failed to fetch public quizzes:', error);
      }
    };
    
    if (user) {
      fetchPublicQuizzes();
    }
  }, [user]);
  
  // Define navigation items based on user role
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Resources', href: '/resources', icon: FileText },
    ...(user?.role === 'teacher' ? [
      { name: 'My Rooms', href: '/rooms', icon: DoorOpen },
    ] : []),
    ...(user?.role === 'student' ? [
      { name: 'My Rooms', href: '/student-rooms', icon: DoorOpen },
    ] : []),
    ...(user?.role === 'teacher' || user?.role === 'admin' ? [
      { name: 'Analytics', href: '/analytics', icon: BarChart },
    ] : []),
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Events', href: '/events', icon: Calendar },
    ...(user?.role === 'admin' ? [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Settings', href: '/settings', icon: Settings },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] flex flex-col shadow-sm">
      <div className="p-4">
        <div className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary-dark/20 dark:to-accent/20 border border-primary/20 dark:border-primary-dark/30 flex items-center mb-4">
          <div className="flex items-center justify-center bg-gradient-to-r from-primary to-primary-light dark:from-primary-dark dark:to-primary text-white rounded-full w-10 h-10 shadow-sm">
            {user?.role === 'admin' ? 'A' : user?.role === 'teacher' ? 'T' : 'S'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-primary-dark dark:text-primary-light">{user?.name}</p>
            <p className="text-xs text-neutral dark:text-gray-400 capitalize">{user?.role}</p>
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
                  ? "bg-gradient-to-r from-primary to-primary-light dark:from-primary-dark dark:to-primary text-white shadow-md"
                  : "text-neutral-dark dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary-dark/10 hover:text-primary dark:hover:text-primary-light"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-neutral dark:text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
        
        {/* Public Quizzes Section */}
        {publicQuizzes.length > 0 && (
          <div className="pt-4">
            <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Public Quizzes
            </h3>
            {publicQuizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="flex items-center px-4 py-2 text-sm text-neutral-dark dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary-dark/10 hover:text-primary dark:hover:text-primary-light rounded-lg transition-all duration-200"
              >
                <GraduationCap className="mr-3 h-4 w-4 text-neutral dark:text-gray-400" />
                <span className="truncate">{quiz.title}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 dark:border-accent/30">
          <h3 className="text-sm font-medium text-primary-dark dark:text-primary-light">Need Help?</h3>
          <p className="text-xs text-neutral dark:text-gray-400 mt-1">Check our documentation for help with EMSI Share.</p>
          <Button variant="outline" size="sm" className="mt-3 w-full text-xs border-primary/30 dark:border-primary-dark/50 text-primary dark:text-primary-light hover:bg-primary dark:hover:bg-primary-dark hover:text-white">
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
