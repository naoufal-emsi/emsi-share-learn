import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  ClipboardList,
  BarChart,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock quiz data
const quizzes = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Test your knowledge of React basics',
    subject: 'Web Development',
    questions: 15,
    duration: 30,
    difficulty: 'Medium',
    author: 'Prof. Ahmed',
    status: 'available'
  },
  {
    id: 2,
    title: 'Database Concepts',
    description: 'Assessment on database design and SQL',
    subject: 'Databases',
    questions: 20,
    duration: 45,
    difficulty: 'Hard',
    author: 'Prof. Sara',
    status: 'available'
  },
  {
    id: 3,
    title: 'Algorithm Basics',
    description: 'Test on fundamental algorithms and complexity',
    subject: 'Computer Science',
    questions: 12,
    duration: 25,
    difficulty: 'Easy',
    author: 'Prof. Karim',
    status: 'available'
  },
  {
    id: 4,
    title: 'JavaScript Essentials',
    description: 'Basic concepts of JavaScript programming',
    subject: 'Web Development',
    questions: 18,
    duration: 35,
    difficulty: 'Medium',
    author: 'Prof. Ahmed',
    status: 'completed',
    score: 85
  },
  {
    id: 5,
    title: 'Networking Basics',
    description: 'Fundamentals of computer networking',
    subject: 'Networks',
    questions: 25,
    duration: 50,
    difficulty: 'Hard',
    author: 'Prof. Lina',
    status: 'completed',
    score: 72
  }
];

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  // Filter quizzes based on status
  const availableQuizzes = quizzes.filter(quiz => quiz.status === 'available');
  const completedQuizzes = quizzes.filter(quiz => quiz.status === 'completed');
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
            <p className="text-muted-foreground">
              {isTeacher 
                ? 'Create and manage quizzes for your students' 
                : 'Test your knowledge and track your progress'}
            </p>
          </div>
          
          {isTeacher && (
            <Button className="bg-primary hover:bg-primary-dark">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          )}
        </div>
        
        {isTeacher ? (
          <TeacherQuizView />
        ) : (
          <StudentQuizView 
            availableQuizzes={availableQuizzes} 
            completedQuizzes={completedQuizzes} 
          />
        )}
      </div>
    </MainLayout>
  );
};

const StudentQuizView: React.FC<{
  availableQuizzes: any[];
  completedQuizzes: any[];
}> = ({ availableQuizzes, completedQuizzes }) => {
  return (
    <Tabs defaultValue="available">
      <TabsList className="mb-4">
        <TabsTrigger value="available">Available</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="progress">My Progress</TabsTrigger>
      </TabsList>
      
      <TabsContent value="available" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuizzes.map(quiz => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge 
                    variant={
                      quiz.difficulty === 'Easy' 
                        ? 'outline' 
                        : quiz.difficulty === 'Medium' 
                          ? 'secondary' 
                          : 'destructive'
                    }
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{quiz.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{quiz.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{quiz.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{quiz.author}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="completed" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedQuizzes.map(quiz => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge variant="secondary">
                    {quiz.score}%
                  </Badge>
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Your Score</span>
                    <span className="text-sm font-medium">{quiz.score}%</span>
                  </div>
                  <Progress 
                    value={quiz.score} 
                    className="h-2" 
                    indicatorClassName={quiz.score >= 70 ? "bg-green-500" : "bg-orange-500"}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{quiz.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{quiz.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{quiz.author}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="progress" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Track your quiz performance across subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Web Development</span>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2 quizzes completed</span>
                <span>1 quiz remaining</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Databases</span>
                </div>
                <span className="text-sm font-medium">0%</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 quizzes completed</span>
                <span>1 quiz remaining</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Computer Science</span>
                </div>
                <span className="text-sm font-medium">0%</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 quizzes completed</span>
                <span>1 quiz remaining</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Networks</span>
                </div>
                <span className="text-sm font-medium">72%</span>
              </div>
              <Progress value={72} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 quiz completed</span>
                <span>0 quizzes remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const TeacherQuizView: React.FC = () => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Quizzes</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge 
                    variant={
                      quiz.difficulty === 'Easy' 
                        ? 'outline' 
                        : quiz.difficulty === 'Medium' 
                          ? 'secondary' 
                          : 'destructive'
                    }
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{quiz.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{quiz.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{quiz.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="capitalize">
                      {quiz.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between space-x-2">
                <Button variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" className="flex-1">
                  View Results
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="active" className="mt-0">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Active quizzes will be displayed here.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="drafts" className="mt-0">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Draft quizzes will be displayed here.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="stats" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance Overview</CardTitle>
              <CardDescription>Average scores across all quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Performance charts would be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>Quiz participation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Engagement charts would be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default Quiz;
