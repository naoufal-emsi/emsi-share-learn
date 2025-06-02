import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { eventsAPI } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus, Users, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  profile_picture_data?: string;
  role: string;
}

interface TeacherSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onTeacherAdded?: () => void;
}

const TeacherSearchDialog: React.FC<TeacherSearchDialogProps> = ({
  open,
  onOpenChange,
  eventId,
  onTeacherAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('teachers');

  // Load all teachers/students when dialog opens or tab changes
  useEffect(() => {
    if (open) {
      if (activeTab === 'teachers') {
        searchTeachers(searchQuery);
      } else {
        searchStudents(searchQuery);
      }
    }
  }, [open, activeTab]);

  // Search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (open) {
        if (activeTab === 'teachers') {
          searchTeachers(searchQuery);
        } else {
          searchStudents(searchQuery);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, open]);

  const searchTeachers = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await eventsAPI.searchTeachers(query);
      console.log('Teacher search results:', results);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching teachers:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchStudents = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await eventsAPI.searchStudents(query);
      console.log('Student search results:', results);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsAdding(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const user of selectedUsers) {
        // Students can't be admins
        const isUserAdmin = user.role === 'student' ? false : true;
        
        try {
          await eventsAPI.addCollaborator(eventId, user.id, isUserAdmin);
          successCount++;
        } catch (error) {
          console.error(`Error adding collaborator ${user.first_name}:`, error);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Added ${successCount} collaborator${successCount !== 1 ? 's' : ''} successfully`);
      }
      
      if (failCount > 0) {
        toast.error(`Failed to add ${failCount} collaborator${failCount !== 1 ? 's' : ''}`);
      }
      
      // Clear selections
      setSelectedUsers([]);
      
      // Refresh the collaborators list
      if (onTeacherAdded) {
        onTeacherAdded();
      }
    } catch (error) {
      console.error('Error in batch adding collaborators:', error);
      toast.error('Failed to add collaborators');
    } finally {
      setIsAdding(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Keep the search query and selected users when switching tabs
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      // Check if user is already selected
      const isSelected = prev.some(u => u.id === user.id);
      
      if (isSelected) {
        // Remove user from selection
        return prev.filter(u => u.id !== user.id);
      } else {
        // Add user to selection
        return [...prev, user];
      }
    });
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(user => user.id === userId);
  };

  const handleClearSelections = () => {
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Collaborators</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select multiple users from both teachers and students tabs
          </p>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder={`Search ${activeTab === 'teachers' ? 'teachers' : 'students'} by name...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Selected:</span>
                {selectedUsers.map(user => (
                  <Badge 
                    key={user.id} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {user.first_name} {user.last_name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleUserSelection(user)}
                    />
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearSelections}
                  className="ml-auto"
                >
                  Clear all
                </Button>
              </div>
            )}
            
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No {activeTab === 'teachers' ? 'teachers' : 'students'} found
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchResults.map((user) => {
                      const selected = isUserSelected(user.id);
                      return (
                        <div 
                          key={user.id}
                          className={`p-3 flex items-center justify-between hover:bg-muted cursor-pointer ${
                            selected ? 'bg-muted' : ''
                          }`}
                          onClick={() => toggleUserSelection(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              {user.profile_picture_data ? (
                                <AvatarImage src={user.profile_picture_data} alt={`${user.first_name} ${user.last_name}`} />
                              ) : user.avatar ? (
                                <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                              ) : (
                                <AvatarFallback>
                                  {user.first_name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{`${user.first_name} ${user.last_name}`}</div>
                              <div className="text-sm text-muted-foreground">{user.username}</div>
                            </div>
                          </div>
                          {selected ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                {activeTab === 'teachers' ? 'Teachers' : 'Students'} will be added as collaborators. 
                {activeTab === 'teachers' ? ' Teachers will have edit permissions.' : ' Students will not have edit permissions.'}
              </p>
            </div>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddUsers} 
            disabled={selectedUsers.length === 0 || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${selectedUsers.length} Collaborator${selectedUsers.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherSearchDialog;