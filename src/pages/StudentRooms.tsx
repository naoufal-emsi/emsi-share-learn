
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import JoinRoomDialog from '@/components/rooms/JoinRoomDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
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
}

const StudentRooms: React.FC = () => {
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

  const handleRoomJoined = () => {
    // Refresh rooms list after joining
    window.location.reload();
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await roomsAPI.leaveRoom(roomId);
      toast.success('Successfully left the room.');
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Failed to leave room:', error);
      toast.error('Failed to leave room.');
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
              Access your joined learning rooms
            </p>
          </div>
          
          <JoinRoomDialog onRoomJoined={handleRoomJoined} />
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
                ? "No rooms joined yet. Use a room ID to join your first room!"
                : "No rooms match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden h-[260px] sm:h-[280px] md:h-[300px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg line-clamp-1">{room.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-1 text-xs sm:text-sm">{room.subject}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                      {room.id}
                    </Badge>
                  </div>
                  <div className="h-10 mt-2">
                    {room.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex space-x-4 text-sm mb-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-primary" />
                      <span>{room.resources_count} Resources</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-accent" />
                      <span>{room.quizzes_count} Quizzes</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/rooms/${room.id}`} className="flex-grow">
                      <Button className="w-full">
                        Enter Room
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => handleLeaveRoom(room.id)}>
                      Leave Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentRooms;
