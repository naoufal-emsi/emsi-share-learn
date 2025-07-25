import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, CheckCircle2, XCircle, Download, FileText, AlertCircle } from 'lucide-react';
import { quizzesAPI } from '@/services/api';

interface QuizData {
  id: string;
  title: string;
  description: string;
  max_attempts: number;
  student_attempts: number;
  questions: Array<{
    id: number;
    text: string;
    options: Array<{
      id: number;
      text: string;
    }>;
  }>;
  quiz_resources?: Array<{
    id: string;
    title: string;
    filename: string;
  }>;
}

interface QuizResult {
  id: string;
  quiz: string;
  student: string;
  start_time: string;
  end_time: string;
  score: number;
  questions_total: number;
  questions_correct: number;
  max_attempts: number;
  attempts_used: number;
}

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{ question_id: number; option_id: number }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptsExhausted, setAttemptsExhausted] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      
      try {
        const data = await quizzesAPI.getQuizDetails(quizId);
        console.log('Quiz data:', data);
        setQuizData(data);
        
        // Check if student has reached max attempts
        if (data.student_attempts >= data.max_attempts) {
          setAttemptsExhausted(true);
          // Fetch the best result
          try {
            const studentResults = await quizzesAPI.getStudentResults(quizId);
            setResults(studentResults.best_attempt);
            setShowResults(true);
          } catch (error) {
            console.error('Failed to fetch student results:', error);
          }
        } else {
          // Initialize userAnswers with -1 for each question's option_id
          setUserAnswers(data.questions.map(q => ({
            question_id: q.id,
            option_id: -1, // -1 indicates no option selected yet
          })));
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, toast]);

  const downloadResource = async (resourceId: string, filename: string) => {
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

  const handleOptionChange = (value: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex].option_id = parseInt(value);
    setUserAnswers(updatedAnswers);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!quizData) return;

    const currentAnswer = userAnswers[currentQuestionIndex];
    if (currentAnswer.option_id === -1) {
      toast({
        title: "Please select an answer",
        description: "You need to select an option before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Filter out questions that were not answered before submitting
      const submittedAnswers = userAnswers.filter(answer => answer.option_id !== -1);
      await submitQuiz(submittedAnswers);
    }
  };

  const submitQuiz = async (answers: Array<{ question_id: number; option_id: number }>) => {
    if (!quizData) return;
    
    setSubmitting(true);
    try {
      console.log('Submitting quiz with answers:', answers);
      const result = await quizzesAPI.submitQuiz(quizData.id, answers);
      console.log('Quiz result:', result);
      setResults(result);
      setShowResults(true);
      
      // Update attempts count in quiz data
      setQuizData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          student_attempts: prev.student_attempts + 1
        };
      });
      
      toast({
        title: "Quiz Completed!",
        description: `You scored ${result.score}%`,
      });
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit quiz answers",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    if (!quizData) return;
    
    // Check if student has reached max attempts
    if (quizData.student_attempts >= quizData.max_attempts) {
      toast({
        title: "Maximum attempts reached",
        description: `You've used all ${quizData.max_attempts} attempts for this quiz.`,
        variant: "destructive"
      });
      return;
    }
    
    setCurrentQuestionIndex(0);
    setUserAnswers(quizData.questions.map(q => ({
      question_id: q.id,
      option_id: -1,
    })));
    setShowResults(false);
    setResults(null);
    toast({
      title: "Quiz Restarted",
      description: "Good luck on your new attempt!",
    });
  };

  const handleBackToRoom = () => {
    navigate(-1); // Go back to previous page
  };

  const handleViewResults = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      const studentResults = await quizzesAPI.getStudentResults(quizId);
      setResults(studentResults.best_attempt);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to fetch student results:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading quiz...</div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button onClick={handleBackToRoom} className="mt-4">
          Back to Room
        </Button>
      </div>
    );
  }

  // Show attempts exhausted message if applicable
  if (attemptsExhausted && !showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center tracking-tight">
            <GraduationCap className="mr-2 h-8 w-8" />
            {quizData.title}
          </h1>
          <Button variant="outline" onClick={handleBackToRoom}>
            Back to Room
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Maximum Attempts Reached</CardTitle>
            <CardDescription>
              You've used all {quizData.max_attempts} attempts for this quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-4">
              You can no longer take this quiz
            </p>
            <Button onClick={handleViewResults}>
              View Your Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // Get the selected option for the current question from userAnswers
  const selectedOptionId = userAnswers[currentQuestionIndex]?.option_id;

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center tracking-tight">
          <GraduationCap className="mr-2 h-8 w-8" />
          {quizData.title}
        </h1>
        <Button variant="outline" onClick={handleBackToRoom}>
          Back to Room
        </Button>
      </div>

      {/* Attempts information */}
      {!showResults && (
        <div className="bg-muted p-3 rounded-md text-sm">
          <p>
            Attempt {quizData.student_attempts + 1} of {quizData.max_attempts} allowed
          </p>
        </div>
      )}

      {/* Quiz Resources */}
      {quizData.quiz_resources && quizData.quiz_resources.length > 0 && !showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiz Resources</CardTitle>
            <CardDescription>Download these resources before taking the quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quizData.quiz_resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{resource.title}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResource(resource.id, resource.filename)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {!showResults ? (
          <Card>
            <CardHeader>
              <CardTitle>{quizData.title}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </CardDescription>
              <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
              </div>
              <RadioGroup onValueChange={handleOptionChange} value={selectedOptionId !== -1 ? selectedOptionId.toString() : ''}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 border rounded-md p-3 hover:border-primary hover:bg-muted/50">
                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                      <Label className="flex-1 cursor-pointer" htmlFor={`option-${option.id}`}>{option.text}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handlePreviousQuestion} 
                disabled={currentQuestionIndex === 0 || submitting}
                variant="outline"
              >
                Go Back
              </Button>
              <Button 
                onClick={handleNextQuestion} 
                disabled={selectedOptionId === -1 || submitting} 
              >
                {submitting ? "Submitting..." : 
                 currentQuestionIndex === quizData.questions.length - 1 ? "Submit Quiz" : "Next Question"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>
                You scored {results?.score}% ({results?.questions_correct}/{results?.questions_total})
              </CardDescription>
              <Progress value={results?.score || 0} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                {results?.score >= 70 ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                )}
                <p className="text-lg font-medium mb-2">
                  {results?.score >= 70 ? "Congratulations!" : "Keep studying!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Attempts used: {results?.attempts_used} of {results?.max_attempts}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleBackToRoom} variant="outline">Back to Room</Button>
              {results && results.attempts_used < results.max_attempts && (
                <Button onClick={handleRestartQuiz} className="ml-auto">Try Again</Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
      </div>
    </MainLayout>
  );
};

export default Quiz;