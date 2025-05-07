
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, CheckCircle2, XCircle } from 'lucide-react';

// Sample quiz data - this would typically come from an API
const quizData = {
  title: "JavaScript Fundamentals",
  description: "Test your knowledge of JavaScript basics",
  questions: [
    {
      id: 1,
      question: "Which of the following is NOT a JavaScript data type?",
      options: [
        "String",
        "Boolean",
        "Float",
        "Object"
      ],
      correctAnswer: "Float"
    },
    {
      id: 2,
      question: "Which method is used to add an element to the end of an array?",
      options: [
        "push()",
        "append()",
        "addToEnd()",
        "insertLast()"
      ],
      correctAnswer: "push()"
    },
    {
      id: 3,
      question: "What is the correct way to check if the variable 'x' is equal to 5 in value and type?",
      options: [
        "x == 5",
        "x === 5",
        "x = 5",
        "x.equals(5)"
      ],
      correctAnswer: "x === 5"
    },
    {
      id: 4,
      question: "What does the 'DOM' stand for?",
      options: [
        "Document Object Model",
        "Data Object Model",
        "Document Oriented Module",
        "Digital Ordinance Model"
      ],
      correctAnswer: "Document Object Model"
    },
    {
      id: 5,
      question: "Which of the following is not a looping structure in JavaScript?",
      options: [
        "for",
        "while",
        "do-while",
        "foreach"
      ],
      correctAnswer: "foreach"
    }
  ]
};

const Quiz: React.FC = () => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]>([]);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const handleNextQuestion = () => {
    if (!selectedOption) {
      toast({
        title: "Please select an answer",
        description: "You need to select an option before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Update score if answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Record user answer
    setUserAnswers([...userAnswers, {
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    }]);

    // Move to next question or show results
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
    setUserAnswers([]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center tracking-tight">
            <GraduationCap className="mr-2 h-8 w-8" />
            Quiz Portal
          </h1>
        </div>

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
                  <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
                </div>
                <RadioGroup onValueChange={handleOptionChange} value={selectedOption || ''}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 border rounded-md p-3 hover:border-primary hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label className="flex-1 cursor-pointer" htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNextQuestion} disabled={!selectedOption} className="ml-auto">
                  {currentQuestionIndex === quizData.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
                <CardDescription>
                  You scored {score} out of {quizData.questions.length}
                </CardDescription>
                <Progress value={(score / quizData.questions.length) * 100} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAnswers.map((answer, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="font-medium mb-2">Question {index + 1}: {answer.question}</div>
                      <div className="flex items-start space-x-2 text-sm">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <p>Your answer: {answer.userAnswer}</p>
                          {!answer.isCorrect && <p className="text-green-600 font-medium">Correct answer: {answer.correctAnswer}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRestartQuiz} className="ml-auto">Restart Quiz</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Quiz;
