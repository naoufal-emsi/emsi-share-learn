import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { roomsAPI } from '@/services/api';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';



const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [showAllRooms, setShowAllRooms] = useState(false);
  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await roomsAPI.getRooms();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // Create a new room (for teachers)
  const createRoom = async () => {
    try {
      if (!newRoomName || !newRoomSubject) {
        toast.error('Name and Subject are required');
        return;
      }
  
      const newRoom = await roomsAPI.createRoom({
        name: newRoomName,
        subject: newRoomSubject,
        description: newRoomDescription,
      });
      
      setRooms(prev => [...prev, newRoom]);
      toast.success('Room created successfully!');
      setShowCreateRoomModal(false);
      // Reset form fields
      setNewRoomName('');
      setNewRoomSubject('');
      setNewRoomDescription('');
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
        
        {user?.role === 'teacher' && (
  <Dialog open={showCreateRoomModal} onOpenChange={setShowCreateRoomModal}>
    <DialogTrigger asChild>
      <Button onClick={() => setShowCreateRoomModal(true)}>
        Create Room
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Room</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="roomName">Room Name</Label>
          <Input
            id="roomName"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name"
            required
          />
        </div>
        <div>
          <Label htmlFor="roomSubject">Subject</Label>
          <Input
            id="roomSubject"
            value={newRoomSubject}
            onChange={(e) => setNewRoomSubject(e.target.value)}
            placeholder="Enter subject"
            required
          />
        </div>
        <div>
          <Label htmlFor="roomDescription">Description</Label>
          <Textarea
            id="roomDescription"
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateRoomModal(false)}
          >
            Cancel
          </Button>
          <Button onClick={createRoom}>Create</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
        
        {loading ? (
          <div>Loading rooms...</div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your Rooms</h2>
            {rooms.length === 0 ? (
              <p className="text-muted-foreground">No rooms found.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(showAllRooms ? rooms : rooms.slice(0, 3)).map(room => (
                    <li
                      key={room.id}
                      className="p-3 border rounded-lg shadow-sm bg-background border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      <div className="font-medium text-foreground">{room.name}</div>
                      <div className="text-sm text-muted-foreground">{room.subject}</div>
                      <div className="text-xs text-muted-foreground">ID: {room.id}</div>
                    </li>
                  ))}
                </ul>
                {rooms.length > 3 && (
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={() => setShowAllRooms(!showAllRooms)}
                  >
                    {showAllRooms ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        
        {user?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
