
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, FileText, BookOpen, Download, Upload, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddResourceDialog from '@/components/rooms/AddResourceDialog';
import AddQuizDialog from '@/components/rooms/AddQuizDialog';

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

const RoomDetails: React.FC = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    // Load room data
    const teacherRooms = JSON.parse(localStorage.getItem('teacherRooms') || '[]');
    const studentRooms = JSON.parse(localStorage.getItem('studentRooms') || '[]');
    const allRooms = [...teacherRooms, ...studentRooms];
    
    const foundRoom = allRooms.find(r => r.id === roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId]);

  const copyRoomId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id);
      toast({
        title: "Room ID Copied!",
        description: "Share this ID with students to join the room",
      });
    }
  };

  const handleResourceAdded = (resource: any) => {
    if (!room) return;
    
    const updatedRoom = {
      ...room,
      resources: [...room.resources, resource]
    };
    
    setRoom(updatedRoom);
    updateRoomInStorage(updatedRoom);
  };

  const handleQuizAdded = (quiz: any) => {
    if (!room) return;
    
    const updatedRoom = {
      ...room,
      quizzes: [...room.quizzes, quiz]
    };
    
    setRoom(updatedRoom);
    updateRoomInStorage(updatedRoom);
  };

  const updateRoomInStorage = (updatedRoom: Room) => {
    const teacherRooms = JSON.parse(localStorage.getItem('teacherRooms') || '[]');
    const studentRooms = JSON.parse(localStorage.getItem('studentRooms') || '[]');
    
    const teacherIndex = teacherRooms.findIndex((r: Room) => r.id === updatedRoom.id);
    if (teacherIndex !== -1) {
      teacherRooms[teacherIndex] = updatedRoom;
      localStorage.setItem('teacherRooms', JSON.stringify(teacherRooms));
    }
    
    const studentIndex = studentRooms.findIndex((r: Room) => r.id === updatedRoom.id);
    if (studentIndex !== -1) {
      studentRooms[studentIndex] = updatedRoom;
      localStorage.setItem('studentRooms', JSON.stringify(studentRooms));
    }
  };

  if (!room) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Room not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
            <p className="text-muted-foreground">{room.subject}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Room ID: {room.id}</Badge>
              <Button variant="ghost" size="sm" onClick={copyRoomId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resources</h2>
              {isTeacher && (
                <AddResourceDialog onResourceAdded={handleResourceAdded} />
              )}
            </div>
            
            {room.resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {room.resources.map((resource, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <CardDescription>{resource.type.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      )}
                      <Button className="w-full" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quizzes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quizzes</h2>
              {isTeacher && (
                <AddQuizDialog onQuizAdded={handleQuizAdded} />
              )}
            </div>
            
            {room.quizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quizzes available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {room.quizzes.map((quiz, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.questions.length} Questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                      )}
                      <Button className="w-full" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Take Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RoomDetails;
