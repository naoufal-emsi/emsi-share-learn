import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/types/user';

interface Attendee {
  id: number;
  user: User;
  status: 'attending' | 'maybe' | 'declined';
  created_at?: string;
  updated_at?: string;
}

interface AttendeesListProps {
  attendees: Attendee[];
}

const AttendeesList: React.FC<AttendeesListProps> = ({ attendees }) => {
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  if (attendees.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No attendees registered yet
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {attendees.map((attendee) => (
          <div 
            key={attendee.id}
            className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-muted/50"
            onClick={() => setSelectedAttendee(attendee)}
          >
            <Avatar className="h-8 w-8 mr-2">
              {attendee.user.profile_picture_data ? (
                <AvatarImage 
                  src={attendee.user.profile_picture_data} 
                  alt={`${attendee.user.first_name} ${attendee.user.last_name}`} 
                />
              ) : attendee.user.avatar ? (
                <AvatarImage 
                  src={attendee.user.avatar} 
                  alt={`${attendee.user.first_name} ${attendee.user.last_name}`} 
                />
              ) : (
                <AvatarFallback>
                  {attendee.user.first_name?.charAt(0) || attendee.user.username?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {`${attendee.user.first_name} ${attendee.user.last_name}`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {attendee.user.role && (
                  <span className="mr-1">{attendee.user.role}</span>
                )}
                <Badge 
                  variant={attendee.status === 'attending' ? 'default' : 'outline'} 
                  className="text-xs py-0 h-4 ml-1"
                >
                  {attendee.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendee Details Dialog */}
      <Dialog open={!!selectedAttendee} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendee Profile</DialogTitle>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {selectedAttendee.user.profile_picture_data ? (
                    <AvatarImage 
                      src={selectedAttendee.user.profile_picture_data} 
                      alt={`${selectedAttendee.user.first_name} ${selectedAttendee.user.last_name}`} 
                    />
                  ) : selectedAttendee.user.avatar ? (
                    <AvatarImage 
                      src={selectedAttendee.user.avatar} 
                      alt={`${selectedAttendee.user.first_name} ${selectedAttendee.user.last_name}`} 
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {selectedAttendee.user.first_name?.charAt(0) || selectedAttendee.user.username?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">
                    {`${selectedAttendee.user.first_name} ${selectedAttendee.user.last_name}`}
                  </h3>
                  <p className="text-muted-foreground">{selectedAttendee.user.username}</p>
                  <Badge className="mt-1">{selectedAttendee.user.role}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> {selectedAttendee.user.email}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedAttendee.status}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendeesList;