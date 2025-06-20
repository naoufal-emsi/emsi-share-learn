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
import AdministrationDashboard from '@/components/dashboard/AdministrationDashboard';
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
        

        
        {user?.role === 'student' ? (
          <StudentDashboard />
        ) : user?.role === 'administration' ? (
          <AdministrationDashboard />
        ) : (
          <TeacherDashboard />
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
