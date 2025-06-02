import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Trash2, Settings, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoomQuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    questions_count: number;
    resources_count: number;
    is_active: boolean;
    student_attempts?: number;
    max_attempts?: number;
  };
  onTakeQuiz: (quizId: string) => void;
  onViewResources?: () => void;
  onToggleActive?: (quizId: string, isActive: boolean) => void;
  onDelete?: (quizId: string) => void;
  isTeacher: boolean;
}

const RoomQuizCard: React.FC<RoomQuizCardProps> = ({
  quiz,
  onTakeQuiz,
  onViewResources,
  onToggleActive,
  onDelete,
  isTeacher
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTakeQuiz = () => {
    onTakeQuiz(quiz.id);
  };

  const handleToggleActive = async () => {
    if (!onToggleActive) return;
    
    setIsLoading(true);
    try {
      await onToggleActive(quiz.id, !quiz.is_active);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quiz.id);
    }
  };

  // Determine if the student can take the quiz
  const attemptsExhausted = quiz.student_attempts !== undefined && 
                           quiz.max_attempts !== undefined && 
                           quiz.student_attempts >= quiz.max_attempts;
  const canTakeQuiz = quiz.is_active && !attemptsExhausted;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{quiz.questions_count} Questions</span>
              {quiz.is_active ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Inactive
                </Badge>
              )}
            </CardDescription>
          </div>
          
          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quiz Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleActive} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : quiz.is_active ? (
                    'Deactivate Quiz'
                  ) : (
                    'Activate Quiz'
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewResources} disabled={quiz.resources_count === 0}>
                  View Resources ({quiz.resources_count})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                      Delete Quiz
                    </DropdownMenuItem>
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
                      <AlertDialogAction onClick={handleDelete}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {quiz.description && (
          <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          className="w-full" 
          onClick={handleTakeQuiz}
          disabled={!canTakeQuiz && !isTeacher}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {isTeacher ? 'View Quiz' : 'Take Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomQuizCard;