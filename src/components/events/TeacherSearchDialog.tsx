import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { eventsAPI } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  profile_picture_data?: string;
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
  const [searchResults, setSearchResults] = useState<Teacher[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [makeAdmin, setMakeAdmin] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);
    try {
      const results = await eventsAPI.searchTeachers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching teachers:', error);
      toast.error('Failed to search teachers');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacher) return;

    setIsAdding(true);
    try {
      await eventsAPI.addCollaborator(eventId, selectedTeacher.id, makeAdmin);
      toast.success(`${selectedTeacher.first_name} ${selectedTeacher.last_name} added as collaborator`);
      setSelectedTeacher(null);
      setMakeAdmin(false);
      onOpenChange(false);
      if (onTeacherAdded) {
        onTeacherAdded();
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Teacher Collaborator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search teachers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || searchQuery.length < 2}
              variant="secondary"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {isSearching ? 'Searching...' : 'No teachers found'}
                </div>
              ) : (
                <div className="divide-y">
                  {searchResults.map((teacher) => (
                    <div 
                      key={teacher.id}
                      className={`p-3 flex items-center justify-between hover:bg-muted cursor-pointer ${
                        selectedTeacher?.id === teacher.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          {teacher.profile_picture_data ? (
                            <AvatarImage src={teacher.profile_picture_data} alt={`${teacher.first_name} ${teacher.last_name}`} />
                          ) : teacher.avatar ? (
                            <AvatarImage src={teacher.avatar} alt={`${teacher.first_name} ${teacher.last_name}`} />
                          ) : (
                            <AvatarFallback>
                              {teacher.first_name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${teacher.first_name} ${teacher.last_name}`}</div>
                          <div className="text-sm text-muted-foreground">{teacher.username}</div>
                        </div>
                      </div>
                      {selectedTeacher?.id === teacher.id && (
                        <UserPlus className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {selectedTeacher && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="make-admin"
                checked={makeAdmin}
                onChange={(e) => setMakeAdmin(e.target.checked)}
              />
              <label htmlFor="make-admin" className="text-sm">
                Make this teacher an admin (can edit event details)
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddTeacher} 
            disabled={!selectedTeacher || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Collaborator'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherSearchDialog;