import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AddResourceDialog from '@/components/rooms/AddResourceDialog';
import AddQuizDialog from '@/components/rooms/AddQuizDialog';
import { roomsAPI, resourcesAPI, quizzesAPI } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Copy, FileText, BookOpen, Download, Trash2 } from 'lucide-react';
import RoomResourceCard from '@/components/resources/RoomResourceCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Quiz from './Quiz'; // Import the Quiz component
import { Toggle } from '@/components/ui/toggle';
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
  is_active: boolean; // Add this line
  student_attempts?: number;  // Add this line
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

const RoomDetails: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [showQuizModal, setShowQuizModal] = useState(false); // New state for quiz modal visibility
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null); // New state to hold the selected quiz ID
  const isTeacher = user?.role === 'teacher';
  const navigate = useNavigate();

  // Add this function to RoomDetails component
  const handleTakeQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowQuizModal(true);
  };

  const handleQuizDeleted = async (quizId: string) => {
    try {
      await quizzesAPI.deleteQuiz(quizId); // Don't try to use the response
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
          resourcesAPI.getResources({ roomId }), // <--- Change this line
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
      navigate('/rooms'); // Alternative navigation method
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
      // Use roomId from the URL params (which is the room code)
      // if (!roomId) throw new Error('Room ID is missing'); // This line is no longer needed
      const blob = await resourcesAPI.downloadResource(resourceId); // Pass only resourceId
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
  <AddResourceDialog 
    roomId={roomId}
    onResourceAdded={handleResourceAdded}
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
                    onDownload={downloadResource}
                    onDelete={isTeacher ? handleDeleteResource : undefined}
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
                  <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onDownloadResource={downloadResource}
                  roomId={roomId}
                  onTakeQuiz={handleTakeQuiz}
                  isTeacher={isTeacher}
                  onQuizUpdated={handleQuizUpdated}
                  onQuizDeleted={handleQuizDeleted}
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
    </MainLayout>
  );
};

const QuizCard: React.FC<{
  quiz: Quiz;
  onDownloadResource: (resourceId: string, filename: string) => void;
  roomId?: string;
  onTakeQuiz: (quizId: string) => void;
  isTeacher: boolean;
  onQuizUpdated: (updatedQuiz: Quiz) => void;
  onQuizDeleted?: (quizId: string) => void;
}> = ({ quiz, onDownloadResource, roomId, onTakeQuiz, isTeacher, onQuizUpdated, onQuizDeleted }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [showResources, setShowResources] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchQuizResources = async () => {
    try {
      const resourcesData = await quizzesAPI.getQuizResources(quiz.id);
      setResources(resourcesData);
      setShowResources(true);
    } catch (error) {
      console.error('Failed to fetch quiz resources:', error);
    }
  };

  const handleTakeQuiz = async (quizId: string) => {
    onTakeQuiz(quizId);
    setSelectedQuiz(null);
    setQuizResult(null);
  };

  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      const newIsActive = !quiz.is_active;
      await quizzesAPI.toggleQuizActiveStatus(quiz.id);
      onQuizUpdated({ ...quiz, is_active: newIsActive });
      toast({
        title: "Success",
        description: `Quiz status updated to ${newIsActive ? 'Active' : 'Inactive'}`,
      });
    } catch (error) {
      console.error('Failed to toggle quiz active status:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz status",
        variant: "destructive"
      });
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    console.log('Attempting to delete quiz with ID:', quizId); // Add this line
    setIsDeleting(true);
    try {
      await quizzesAPI.deleteQuiz(quizId);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      <AlertDialogAction onClick={() => onQuizDeleted && onQuizDeleted(quiz.id)}>
        Continue
      </AlertDialogAction>
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if the student can take the quiz or should see results
  const attemptsExhausted = quiz.student_attempts !== undefined && quiz.max_attempts !== undefined && quiz.student_attempts >= quiz.max_attempts;
  const canTakeQuiz = quiz.is_active && !attemptsExhausted;
  const showResultsButton = quiz.is_active && attemptsExhausted;

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleQuizSubmit = async () => {
    if (!selectedQuiz) return;
  
    try {
      setIsSubmitting(true);
      
      const formattedAnswers = selectedQuiz.questions.map((question, qIndex) => {
        const selectedOptionIndex = answers[qIndex] ?? -1;
        return {
          question_id: question.id,
          option_id: selectedOptionIndex >= 0 ? question.options[selectedOptionIndex].id : null
        };
      });

      const result = await quizzesAPI.submitQuiz(selectedQuiz.id, formattedAnswers);
      setQuizResult(result);
      
      toast({
        title: "Quiz Submitted!",
        description: `Your score: ${result.score}%`,
      });
    } catch (error) {
      console.error('Quiz submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToQuizList = () => {
    setSelectedQuiz(null);
    setQuizResult(null);
  };

  return (
    <Card>
      {selectedQuiz ? (
        <div className="p-4 space-y-4">
          {quizResult ? (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">Quiz Results</CardTitle>
                <CardDescription>
                  Score: {quizResult.score}% | Correct: {quizResult.questions_correct}/{quizResult.questions_total}
                </CardDescription>
              </CardHeader>
              <Button 
                className="w-full" 
                onClick={handleBackToQuizList}
              >
                Back to Quizzes
              </Button>
            </div>
          ) : (
            <>
              <CardHeader className="p-0">
                <CardTitle>{selectedQuiz.title}</CardTitle>
                {selectedQuiz.description && (
                  <CardDescription>{selectedQuiz.description}</CardDescription>
                )}
              </CardHeader>
              
              <div className="space-y-6">
                {selectedQuiz.questions.map((question, qIndex) => (
                  <div key={question.id} className="space-y-2">
                    <h4 className="font-medium">{qIndex + 1}. {question.text}</h4>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <Button
                          key={option.id}
                          variant={answers[qIndex] === oIndex ? "default" : "outline"}
                          className="w-full text-left justify-start"
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full"
                onClick={handleQuizSubmit}
                disabled={isSubmitting || 
                  Object.keys(answers).length < selectedQuiz.questions.length
                }
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-base">{quiz.title}</CardTitle>
            <CardDescription>{quiz.questions_count} Questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quiz.description && (
              <p className="text-sm text-muted-foreground">{quiz.description}</p>
            )}
            
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => onTakeQuiz(quiz.id)} // Use onTakeQuiz prop
                disabled={isLoadingQuiz}
              >
                {isLoadingQuiz ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
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

              {isTeacher && ( // Show toggle button only for teachers
                <Toggle
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onPressedChange={handleToggleActive}
                  disabled={isTogglingActive}
                  pressed={quiz.is_active}
                >
                  {isTogglingActive ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : quiz.is_active ? (
                    'Deactivate Quiz' // Text for when quiz is active
                  ) : (
                    'Activate Quiz' // Text for when quiz is inactive
                  )}
                </Toggle>
              )}

              {isTeacher && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-2 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Quiz
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the quiz
                        and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {showResources && (
              <Dialog open={showResources} onOpenChange={setShowResources}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quiz Resources</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{resource.title}</span>
                          <Button size="sm" onClick={() => onDownloadResource(resource.id, resource.filename)}>
                            Download
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p>No resources available for this quiz.</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setShowResources(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default RoomDetails;
