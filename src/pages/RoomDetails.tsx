import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RoomResourceUploadWrapper from '@/components/rooms/RoomResourceUploadWrapper';
import AddQuizDialog from '@/components/rooms/AddQuizDialog';
import { roomsAPI, resourcesAPI, quizzesAPI } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Copy, FileText, BookOpen, Download, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Quiz from './Quiz';
import ResourceDetailDialog from '@/components/resources/ResourceDetailDialog';
import RoomResourceCard from '@/components/RoomResourceCard';
import RoomQuizCard from '@/components/RoomQuizCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Option = {
  id: number;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  text: string;
  options: Option[];
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  questions_count: number;
  resources_count: number;
  is_active: boolean;
  student_attempts?: number;
  max_attempts?: number;
};

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

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_name: string;
  file_size: number;
  bookmark_count?: number;
  uploaded_at?: string;
  uploaded_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  category?: number | null;
  category_name?: string | null;
}

const RoomDetails: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [quizResources, setQuizResources] = useState<any[]>([]);
  const [selectedQuizForResources, setSelectedQuizForResources] = useState<string | null>(null);
  const isTeacher = user?.role === 'teacher';
  const navigate = useNavigate();

  const handleTakeQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowQuizModal(true);
  };

  const handleQuizDeleted = async (quizId: string) => {
    try {
      await quizzesAPI.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const [roomData, resourcesData, quizzesData] = await Promise.all([
          roomsAPI.getRoomDetails(roomId),
          resourcesAPI.getResources({ roomId }),
          quizzesAPI.getQuizzes(roomId)
        ]);
        setRoom(roomData);

        let resourceArr = [];
        if (Array.isArray(resourcesData)) {
          resourceArr = resourcesData;
        } else if (resourcesData && Array.isArray(resourcesData.results)) {
          resourceArr = resourcesData.results;
        } else {
          resourceArr = [];
        }
        setResources(resourceArr);

        let quizArr = [];
        if (Array.isArray(quizzesData)) {
          quizArr = quizzesData;
        } else if (quizzesData && Array.isArray(quizzesData.results)) {
          quizArr = quizzesData.results;
        } else {
          quizArr = [];
        }
        setQuizzes(quizArr);

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

  useEffect(() => {
    if (selectedResource) {
      setIsDetailDialogOpen(true);
    }
  }, [selectedResource]);

  const copyRoomId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id);
      toast({
        title: "Room ID Copied!",
        description: "Share this ID with students to join the room",
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomId || !room) return;
  
    try {
      await roomsAPI.deleteRoom(roomId);
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      navigate('/rooms');
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive"
      });
    }
  };

  const handleResourceAdded = (resource: any) => {
    setResources(prev => [...prev, resource]);
  };

  const handleQuizAdded = (quiz: any) => {
    setQuizzes(prev => [...prev, quiz]);
  };

  const handleQuizUpdated = (updatedQuiz: Quiz) => {
    setQuizzes(prev => prev.map(quiz => quiz.id === updatedQuiz.id ? updatedQuiz : quiz));
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await resourcesAPI.deleteResource(resourceId, roomId);
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive"
      });
    }
  };

  const downloadResource = async (resourceId: string, filename: string) => {
    try {
      const blob = await resourcesAPI.downloadResource(resourceId);
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

  const handleViewQuizResources = async (quizId: string) => {
    try {
      const resourcesData = await quizzesAPI.getQuizResources(quizId);
      setQuizResources(resourcesData);
      setSelectedQuizForResources(quizId);
      setShowResourcesDialog(true);
    } catch (error) {
      console.error('Failed to fetch quiz resources:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz resources",
        variant: "destructive"
      });
    }
  };

  const handleToggleQuizActive = async (quizId: string, isActive: boolean) => {
    try {
      await quizzesAPI.toggleQuizActiveStatus(quizId);
      handleQuizUpdated({ 
        ...quizzes.find(q => q.id === quizId)!, 
        is_active: isActive 
      });
      toast({
        title: "Success",
        description: `Quiz ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz status",
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
          {room.is_owner && (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Room</span>
              </Button>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Room</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to delete this room? This action cannot be undone.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { setShowDeleteDialog(false); handleDeleteRoom(); }}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
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
                <RoomResourceUploadWrapper 
                  roomId={roomId || ''}
                  onSuccess={handleResourceAdded}
                  triggerButton={
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  }
                />
              )}
            </div>
            {Array.isArray(resources) && resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <RoomResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => setSelectedResource(resource)}
                    onDownload={downloadResource}
                    onDelete={isTeacher ? handleDeleteResource : undefined}
                    showDeleteButton={isTeacher}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="quizzes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Room Quizzes</h2>
              {isTeacher && (
                <AddQuizDialog 
                  roomId={roomId} 
                  onQuizAdded={handleQuizAdded} 
                />
              )}
            </div>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quizzes available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <RoomQuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onTakeQuiz={handleTakeQuiz}
                    onViewResources={() => handleViewQuizResources(quiz.id)}
                    onToggleActive={handleToggleQuizActive}
                    onDelete={handleQuizDeleted}
                    isTeacher={isTeacher}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Take Quiz</DialogTitle>
          </DialogHeader>
          {selectedQuizId && (
            <Quiz 
              quizId={selectedQuizId} 
              onClose={() => setShowQuizModal(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Resource Detail Dialog */}
      <ResourceDetailDialog
        resource={selectedResource as any}
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) setSelectedResource(null);
        }}
      />

      {/* Quiz Resources Dialog */}
      <Dialog open={showResourcesDialog} onOpenChange={setShowResourcesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quiz Resources</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {quizResources.length > 0 ? (
              quizResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{resource.title}</span>
                  <Button size="sm" onClick={() => downloadResource(resource.id, resource.filename || resource.title)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))
            ) : (
              <p>No resources available for this quiz.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResourcesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RoomDetails;