import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileEditDialog } from '@/components/ui/ProfileEditDialog';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-accent text-white text-3xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
        <p className="text-gray-500 mb-2">{user.email}</p>
        <p className="text-gray-400 mb-4 capitalize">{user.role}</p>
        {/* Add bio here if available: <p className="mb-4">{user.bio}</p> */}
        <ProfileEditDialog
          trigger={<Button variant="outline" className="mt-2">Edit Profile</Button>}
        />
      </div>
    </MainLayout>
  );
};

export default Profile;