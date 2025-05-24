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
import { roomsAPI, resourcesAPI, quizzesAPI } from '@/services/api';

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

const RoomDetails: React.FC = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      
      try {
        const [roomData, resourcesData, quizzesData] = await Promise.all([
          roomsAPI.getRoomDetails(roomId),
          resourcesAPI.getResources(roomId),
          quizzesAPI.getQuizzes(roomId)
        ]);
        
        setRoom(roomData);
        setResources(resourcesData);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('Failed to fetch room data:', error);
        toast({
          title: "Error",
          description: "Failed to load room data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, toast]);

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
    setResources(prev => [...prev, resource]);
  };

  const handleQuizAdded = (quiz: any) => {
    setQuizzes(prev => [...prev, quiz]);
  };

  const downloadQuizResource = async (resourceId: string, filename: string) => {
    try {
      const blob = await quizzesAPI.downloadQuizResource(resourceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Failed to download resource:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the resource",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading room details...</div>
        </div>
      </MainLayout>
    );
  }

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
            
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <Card key={resource.id}>
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
              <h2 className="text-xl font-semibold">Room Quizzes</h2>
              {isTeacher && (
                <AddQuizDialog onQuizAdded={handleQuizAdded} />
              )}
            </div>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quizzes available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onDownloadResource={downloadQuizResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Extract QuizCard component to keep file focused
const QuizCard: React.FC<{ 
  quiz: any; 
  onDownloadResource: (resourceId: string, filename: string) => void;
}> = ({ quiz, onDownloadResource }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [showResources, setShowResources] = useState(false);

  const fetchQuizResources = async () => {
    try {
      const resourcesData = await quizzesAPI.getQuizResources(quiz.id);
      setResources(resourcesData);
      setShowResources(true);
    } catch (error) {
      console.error('Failed to fetch quiz resources:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{quiz.title}</CardTitle>
        <CardDescription>{quiz.questions_count} Questions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {quiz.description && (
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
        )}
        
        <div className="flex flex-col gap-2">
          <Button className="w-full" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Take Quiz
          </Button>
          
          {quiz.resources_count > 0 && (
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={fetchQuizResources}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Resources ({quiz.resources_count})
            </Button>
          )}
        </div>
        
        {showResources && resources.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Quiz Resources:</h4>
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground truncate">
                  {resource.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadResource(resource.id, resource.filename)}
                  className="h-6 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomDetails;
