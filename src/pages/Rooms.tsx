
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import CreateRoomDialog from '@/components/rooms/CreateRoomDialog';
import RoomCard from '@/components/rooms/RoomCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { roomsAPI } from '@/services/api';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  subject: string;
  description: string;
  participants_count: number;
  resources_count: number;
  quizzes_count: number;
  created_at: string;
  is_owner: boolean;
}

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
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

    fetchRooms();
  }, []);

  const handleRoomCreated = async (roomData: any) => {
    try {
      const newRoom = await roomsAPI.createRoom(roomData);
      setRooms(prev => [...prev, newRoom]);
      toast.success('Room created successfully!');
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading rooms...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Rooms</h1>
            <p className="text-muted-foreground">
              Create and manage your learning rooms
            </p>
          </div>
          
          {user?.role === 'teacher' && (
            <CreateRoomDialog onRoomCreated={handleRoomCreated} />
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {rooms.length === 0 
                ? "No rooms created yet. Create your first room to get started!"
                : "No rooms match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Rooms;
