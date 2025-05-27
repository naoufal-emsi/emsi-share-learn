import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ProfileForm } from '@/components/ui/ProfileEditDialog';

const Profile: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <ProfileForm />
      </div>
    </MainLayout>
  );
};

export default Profile;