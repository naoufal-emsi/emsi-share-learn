import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const DEFAULT_AVATAR = "/placeholder.svg";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    async function fetchProfilePicture() {
      const token = document.cookie.split('; ').find(row => row.startsWith('emsi_access='))?.split('=')[1];
      const res = await fetch('http://127.0.0.1:8000/api/auth/profile/picture', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.image) setProfilePic(data.image);
        else setProfilePic(undefined);
      } else {
        setProfilePic(undefined);
      }
    }
    if (user) fetchProfilePicture();
  }, [user]);

  return (
    <header className="bg-gradient-to-r from-primary to-primary-light dark:from-primary-dark dark:to-primary shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-white">EMSI Share</h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-accent/20 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profilePic || user?.avatar || DEFAULT_AVATAR} alt={user?.name} />
                <AvatarFallback className="bg-white text-primary dark:bg-gray-800 dark:text-white">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
