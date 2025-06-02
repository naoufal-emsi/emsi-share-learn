import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Collaborator {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    profile_picture_data?: string;
    role?: string;
  };
  is_admin: boolean;
}

interface ReadOnlyCollaboratorsListProps {
  collaborators: Collaborator[];
}

const ReadOnlyCollaboratorsList: React.FC<ReadOnlyCollaboratorsListProps> = ({
  collaborators
}) => {
  if (collaborators.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No collaborators added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {collaborators.map((collaborator) => (
        <div 
          key={collaborator.id}
          className="flex items-center p-3 border rounded-md"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {collaborator.user.profile_picture_data ? (
                <AvatarImage 
                  src={collaborator.user.profile_picture_data} 
                  alt={`${collaborator.user.first_name} ${collaborator.user.last_name}`} 
                />
              ) : collaborator.user.avatar ? (
                <AvatarImage 
                  src={collaborator.user.avatar} 
                  alt={`${collaborator.user.first_name} ${collaborator.user.last_name}`} 
                />
              ) : (
                <AvatarFallback>
                  {collaborator.user.first_name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">
                {`${collaborator.user.first_name} ${collaborator.user.last_name}`}
                {collaborator.is_admin && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                {collaborator.user.role && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {collaborator.user.role.charAt(0).toUpperCase() + collaborator.user.role.slice(1)}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{collaborator.user.username}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReadOnlyCollaboratorsList;