
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  User, 
  Users, 
  BarChart,
  GraduationCap,
  MessageSquare,
  PlusCircle,
  FileCheck,
  CalendarDays
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Class Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Class Overview</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Students</span>
              <span className="text-sm font-medium">126</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Classes</span>
              <span className="text-sm font-medium">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Engagement</span>
              <span className="text-sm font-medium">78%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resources Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resources Management</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Published Resources</span>
              <span className="text-sm font-medium">32</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resources to Review</span>
              <Badge variant="destructive">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Popular</span>
              <span className="text-sm text-muted-foreground">Database Design</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to="/resources" className="text-xs text-primary hover:underline">
            Manage resources
          </Link>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <PlusCircle className="h-3 w-3" />
            <span className="text-xs">Add</span>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Quiz Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quiz Management</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Quizzes</span>
              <span className="text-sm font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Quizzes</span>
              <span className="text-sm font-medium">14</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Score</span>
              <span className="text-sm font-medium">72%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to="/quiz" className="text-xs text-primary hover:underline">
            View all quizzes
          </Link>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <PlusCircle className="h-3 w-3" />
            <span className="text-xs">Create</span>
          </Button>
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
              <span className="text-sm font-medium">Discussions</span>
              <span className="text-sm font-medium">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Unanswered Questions</span>
              <Badge variant="destructive">7</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Replies</span>
              <span className="text-sm font-medium">42</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/forum" className="text-xs text-primary hover:underline">
            Moderate forum
          </Link>
        </CardFooter>
      </Card>
      
      {/* Resource Approval */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resource Approval</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Advanced Algorithms Notes</span>
                <Badge variant="outline">PDF</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Submitted by: Mohammed A. - 2 days ago
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="default" className="h-7 text-xs">Approve</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Web Dev Project Example</span>
                <Badge variant="outline">Video</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Submitted by: Fatima L. - 1 day ago
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="default" className="h-7 text-xs">Approve</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/resources/approval" className="text-xs text-primary hover:underline">
            View all pending resources
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
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Tech Workshop</p>
              <p className="text-xs text-muted-foreground">Nov 18, 2023 - Amphi A</p>
              <Badge variant="outline" className="mt-1 text-xs">Organizer</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Database Exam</p>
              <p className="text-xs text-muted-foreground">Nov 22, 2023 - Room C12</p>
              <Badge variant="outline" className="mt-1 text-xs">Proctor</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to="/events" className="text-xs text-primary hover:underline">
            View all events
          </Link>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <PlusCircle className="h-3 w-3" />
            <span className="text-xs">Create</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
