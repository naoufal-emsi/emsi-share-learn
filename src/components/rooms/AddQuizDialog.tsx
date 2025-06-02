import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizzesAPI } from '@/services/api';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AddQuizDialogProps {
  onQuizAdded: (quiz: any) => void;
  roomId: string;
}

const AddQuizDialog: React.FC<AddQuizDialogProps> = ({ onQuizAdded, roomId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    }
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateQuiz = () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive"
      });
      return false;
    }

    if (maxAttempts < 1) {
      toast({
        title: "Error",
        description: "Maximum attempts must be at least 1",
        variant: "destructive"
      });
      return false;
    }

    for (const [qIndex, question] of questions.entries()) {
      if (!question.question) {
        toast({
          title: "Error",
          description: `Question ${qIndex + 1} is missing text`,
          variant: "destructive"
        });
        return false;
      }

      for (const [oIndex, option] of question.options.entries()) {
        if (!option) {
          toast({
            title: "Error",
            description: `Question ${qIndex + 1} option ${oIndex + 1} is empty`,
            variant: "destructive"
          });
          return false;
        }
      }

      if (question.correctAnswer === null || question.correctAnswer === undefined) {
        toast({
          title: "Error",
          description: `Question ${qIndex + 1} needs a correct answer selected`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleAddQuiz = async () => {
    if (!validateQuiz()) return;

    setIsSubmitting(true);

    try {
      // Transform questions for API
      const apiQuestions = questions.map(question => ({
        text: question.question,
        options: question.options.map((text, index) => ({
          text,
          is_correct: index === question.correctAnswer
        }))
      }));

      const quizData = {
        title,
        description,
        room: roomId,
        max_attempts: maxAttempts,
        questions: apiQuestions
      };

      const newQuiz = await quizzesAPI.createQuiz(quizData);
      
      onQuizAdded(newQuiz);
      toast({
        title: "Quiz Created!",
        description: "Quiz has been successfully added to the room",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setMaxAttempts(1);
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setOpen(false);
    } catch (error) {
      console.error('Quiz creation failed:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Add Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Quiz</DialogTitle>
          <DialogDescription>
            Create a new quiz for students to take. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quizTitle">Quiz Title *</Label>
            <Input
              id="quizTitle"
              placeholder="Quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quizDescription">Description</Label>
            <Textarea
              id="quizDescription"
              placeholder="Quiz description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="maxAttempts">Maximum Attempts *</Label>
            <Input
              id="maxAttempts"
              type="number"
              min="1"
              placeholder="Maximum attempts allowed"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Number of times a student can take this quiz
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions *</Label>
              <Button 
                type="button" 
                onClick={addQuestion} 
                size="sm" 
                variant="outline"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>
            
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label>Question {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeQuestion(qIndex)} 
                      size="sm" 
                      variant="destructive"
                      disabled={isSubmitting}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Enter question *"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  disabled={isSubmitting}
                />
                
                <div className="space-y-2">
                  <Label>Options *</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder={`Option ${oIndex + 1} *`}
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleAddQuiz}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Quiz'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizDialog;