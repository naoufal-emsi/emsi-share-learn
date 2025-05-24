
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import JoinRoomDialog from '@/components/rooms/JoinRoomDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  subject: string;
  description: string;
  participants: string[];
  createdAt: string;
  resources: any[];
  quizzes: any[];
}

const StudentRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load joined rooms from localStorage
    const savedRooms = localStorage.getItem('studentRooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          <JoinRoomDialog />
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
              <Card key={room.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      <CardDescription className="mt-1">{room.subject}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {room.id}
                    </Badge>
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm mb-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-primary" />
                      <span>{room.resources.length} Resources</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-accent" />
                      <span>{room.quizzes.length} Quizzes</span>
                    </div>
                  </div>
                  <Link to={`/rooms/${room.id}`}>
                    <Button className="w-full">
                      Enter Room
                    </Button>
                  </Link>
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
