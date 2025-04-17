
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Clock,
  GraduationCap,
  CalendarDays,
  BookMarked,
  MessageSquare
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  // Mock data for UI demonstration
  const recentResources = [
    { id: 1, title: 'Introduction to React', type: 'PDF', createdBy: 'Prof. Ahmed' },
    { id: 2, title: 'Database Design Patterns', type: 'Video', createdBy: 'Prof. Sara' },
    { id: 3, title: 'Advanced Algorithms', type: 'PDF', createdBy: 'Prof. Karim' },
  ];
  
  const upcomingQuizzes = [
    { id: 1, title: 'React Fundamentals', dueDate: '2023-11-20', subject: 'Web Development' },
    { id: 2, title: 'Database Concepts', dueDate: '2023-11-22', subject: 'Databases' },
  ];
  
  const upcomingEvents = [
    { id: 1, title: 'Tech Workshop', date: '2023-11-18', location: 'Amphi A' },
    { id: 2, title: 'Career Fair', date: '2023-11-25', location: 'Main Campus' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Web Development</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Databases</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Algorithms</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Resources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Resources</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResources.map(resource => (
              <div key={resource.id} className="flex items-start">
                {resource.type === 'PDF' ? (
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                ) : (
                  <BookMarked className="h-4 w-4 mr-2 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.type} by {resource.createdBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/resources" className="text-xs text-primary hover:underline">
            View all resources
          </Link>
        </CardFooter>
      </Card>
      
      {/* Upcoming Quizzes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Quizzes</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingQuizzes.map(quiz => (
              <div key={quiz.id} className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <div>
                  <p className="text-sm font-medium">{quiz.title}</p>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-muted-foreground mr-2">
                      Due: {new Date(quiz.dueDate).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {quiz.subject}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/quiz" className="text-xs text-primary hover:underline">
            View all quizzes
          </Link>
        </CardFooter>
      </Card>
      
      {/* Forum Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Forum Activity</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Unread Posts</span>
              <Badge>3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Posts</span>
              <span className="text-sm text-muted-foreground">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Replies</span>
              <span className="text-sm text-muted-foreground">8</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/forum" className="text-xs text-primary hover:underline">
            Go to forum
          </Link>
        </CardFooter>
      </Card>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-start">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} at {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/events" className="text-xs text-primary hover:underline">
            View all events
          </Link>
        </CardFooter>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <CardDescription className="text-xs">Access your most used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-18 flex flex-col items-center justify-center py-3">
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Find Resources</span>
            </Button>
            <Button variant="outline" size="sm" className="h-18 flex flex-col items-center justify-center py-3">
              <GraduationCap className="h-4 w-4 mb-1" />
              <span className="text-xs">Take a Quiz</span>
            </Button>
            <Button variant="outline" size="sm" className="h-18 flex flex-col items-center justify-center py-3">
              <MessageSquare className="h-4 w-4 mb-1" />
              <span className="text-xs">Forum Discussions</span>
            </Button>
            <Button variant="outline" size="sm" className="h-18 flex flex-col items-center justify-center py-3">
              <CalendarDays className="h-4 w-4 mb-1" />
              <span className="text-xs">Check Events</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
