import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  user: {
    name?: string;
    profilePicture?: string;
    avatar?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_AVATAR = "/placeholder.svg";

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const sizeClass = sizeClasses[size];
  const displayName = user?.name || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  
  // Debug the avatar source
  console.log('Avatar source:', {
    profilePicture: user?.profilePicture,
    avatar: user?.avatar,
    default: DEFAULT_AVATAR,
    final: user?.profilePicture || user?.avatar || DEFAULT_AVATAR
  });
  
  return (
    <Avatar className={`${sizeClass} ${className}`}>
      <AvatarImage 
        src={user?.avatar || DEFAULT_AVATAR} 
        alt={displayName} 
      />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;