
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
      const newRoom = await roomsAPI.createRoom({
        name: 'New Room',
        subject: 'Math',
        description: 'A new math room',
      });
      setRooms(prev => [...prev, newRoom]);
      toast.success('Room created successfully!');
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
          <Button onClick={createRoom}>
            Create Room
          </Button>
        )}
        
        {loading ? (
          <div>Loading rooms...</div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your Rooms</h2>
            {rooms.length === 0 ? (
              <p className="text-muted-foreground">No rooms found.</p>
            ) : (
              <ul className="space-y-2">
                {rooms.map(room => (
                  <li key={room.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">{room.subject}</div>
                    <div className="text-xs text-muted-foreground">ID: {room.id}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {user?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
