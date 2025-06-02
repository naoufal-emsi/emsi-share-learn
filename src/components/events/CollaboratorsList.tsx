import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { eventsAPI } from '@/services/api';

interface Collaborator {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    profile_picture_data?: string;
  };
  is_admin: boolean;
}

interface CollaboratorsListProps {
  eventId: string;
  collaborators: Collaborator[];
  canManage: boolean;
  onCollaboratorUpdated: () => void;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  eventId,
  collaborators,
  canManage,
  onCollaboratorUpdated
}) => {
  // Only allow administration users to manage collaborators
  const handleToggleAdmin = async (collaborator: Collaborator) => {
    if (!canManage) return;
    
    try {
      await eventsAPI.updateCollaborator(
        eventId,
        collaborator.id,
        !collaborator.is_admin
      );
      toast.success(`${collaborator.user.first_name} ${collaborator.is_admin ? 'is no longer an admin' : 'is now an admin'}`);
      onCollaboratorUpdated();
    } catch (error) {
      console.error('Error updating collaborator:', error);
      toast.error('Failed to update collaborator');
    }
  };

  const handleRemoveCollaborator = async (collaborator: Collaborator) => {
    if (!canManage) return;
    
    if (!confirm(`Are you sure you want to remove ${collaborator.user.first_name} ${collaborator.user.last_name} as a collaborator?`)) {
      return;
    }
    
    try {
      await eventsAPI.removeCollaborator(eventId, collaborator.id);
      toast.success(`${collaborator.user.first_name} ${collaborator.user.last_name} removed as collaborator`);
      onCollaboratorUpdated();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

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
          className="flex items-center justify-between p-3 border rounded-md"
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
              </div>
              <div className="text-sm text-muted-foreground">{collaborator.user.username}</div>
            </div>
          </div>
          
          {canManage && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={collaborator.is_admin}
                  onCheckedChange={() => handleToggleAdmin(collaborator)}
                  size="sm"
                  disabled={!canManage}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCollaborator(collaborator)}
                disabled={!canManage}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollaboratorsList;