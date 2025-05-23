
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AddQuizDialogProps {
  onQuizAdded: (quiz: any) => void;
}

const AddQuizDialog: React.FC<AddQuizDialogProps> = ({ onQuizAdded }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
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

  const handleAddQuiz = () => {
    if (!title || questions.some(q => !q.question || q.options.some(o => !o))) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newQuiz = {
      id: Date.now().toString(),
      title,
      description,
      questions,
      createdAt: new Date().toISOString()
    };

    onQuizAdded(newQuiz);
    
    toast({
      title: "Quiz Added!",
      description: "Quiz has been successfully added to the room",
    });

    // Reset form
    setTitle('');
    setDescription('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setOpen(false);
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
            Create a new quiz for students to take.
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quizDescription">Description</Label>
            <Textarea
              id="quizDescription"
              placeholder="Quiz description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions</Label>
              <Button type="button" onClick={addQuestion} size="sm" variant="outline">
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
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Enter question"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />
                
                <div className="space-y-2">
                  <Label>Options</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                      />
                      <Input
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddQuiz}>Add Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizDialog;
