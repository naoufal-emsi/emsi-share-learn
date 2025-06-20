import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CalendarDays,
  TrendingUp,
  Zap,
  BarChart3,
  Globe,
  Activity
} from 'lucide-react';
import { roomsAPI, resourcesAPI, quizzesAPI, forumsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teacherStats, setTeacherStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalResources: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    averageScore: 0,
    forumTopics: 0,
    unsolvedTopics: 0,
    userPosts: 0,
    averageStudentsPerRoom: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [
        studentsData,
        roomsData,
        resourcesData,
        quizzesData,
        forumData
      ] = await Promise.allSettled([
        roomsAPI.getTeacherStudents(user?.id || ''),
        roomsAPI.getRooms(),
        resourcesAPI.getAllResources(),
        quizzesAPI.getTeacherRoomsQuizzes(),
        forumsAPI.getTopics()
      ]);

      // Process students
      if (studentsData.status === 'fulfilled' && studentsData.value) {
        const students = Array.isArray(studentsData.value) ? studentsData.value : [];
        setTeacherStats(prev => ({
          ...prev,
          totalStudents: students.length
        }));
      }

      // Process rooms
      if (roomsData.status === 'fulfilled' && roomsData.value) {
        const rooms = Array.isArray(roomsData.value) ? roomsData.value : [];
        const totalParticipants = rooms.reduce((sum, room) => sum + (room.participants ? room.participants.length : 0), 0);
        setTeacherStats(prev => ({
          ...prev,
          totalRooms: rooms.length,
          averageStudentsPerRoom: rooms.length > 0 ? Math.round(totalParticipants / rooms.length) : 0
        }));
      }

      // Process resources
      if (resourcesData.status === 'fulfilled' && resourcesData.value) {
        const resources = resourcesData.value.results || [];
        setTeacherStats(prev => ({
          ...prev,
          totalResources: resources.length
        }));
      }

      // Process quizzes
      if (quizzesData.status === 'fulfilled' && quizzesData.value) {
        const quizzes = Array.isArray(quizzesData.value) ? quizzesData.value : [];
        setTeacherStats(prev => ({
          ...prev,
          totalQuizzes: quizzes.length,
          activeQuizzes: quizzes.filter(quiz => quiz.is_active).length
        }));
      }

      // Process forum data
      if (forumData.status === 'fulfilled' && forumData.value) {
        const topics = forumData.value.results || [];
        const unsolved = topics.filter(topic => !topic.is_solved).length;
        setTeacherStats(prev => ({
          ...prev,
          forumTopics: topics.length,
          unsolvedTopics: unsolved
        }));
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>
        <Button onClick={fetchTeacherData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Class Overview */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Overview</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{teacherStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rooms: {teacherStats.totalRooms}</span>
                <span>Avg/Room: {teacherStats.averageStudentsPerRoom}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/rooms">
                <Button size="sm" className="w-full">Manage Classes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resources Management */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-600">{teacherStats.totalResources}</div>
                <p className="text-xs text-muted-foreground">Published Resources</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/resources">
                <Button size="sm" variant="outline" className="w-full">Manage Resources</Button>
              </Link>
            </div>
          </CardContent>
        </Card>



        {/* Forum Activity */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Activity</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-orange-600">{teacherStats.forumTopics}</div>
                <p className="text-xs text-muted-foreground">Discussions</p>
              </div>
              <div className="text-xs">
                <span>Unanswered: {teacherStats.unsolvedTopics}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/forum">
                <Button size="sm" variant="outline" className="w-full">Moderate Forum</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/rooms">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-blue-50">
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-xs">Manage Rooms</span>
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-green-50">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Upload Resources</span>
                </Button>
              </Link>
              <Link to="/quiz">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-purple-50">
                  <GraduationCap className="h-5 w-5 mb-1" />
                  <span className="text-xs">Create Quiz</span>
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-orange-50">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span className="text-xs">Answer Questions</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Live Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Teaching Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Students</span>
                <Badge variant="default">{teacherStats.totalStudents}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Quizzes</span>
                <Badge variant="secondary">{teacherStats.activeQuizzes}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Unanswered Questions</span>
                <Badge variant="destructive">{teacherStats.unsolvedTopics}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Published Resources</span>
                <Badge variant="outline">{teacherStats.totalResources}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teaching Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Teaching Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{teacherStats.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Students Teaching</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{teacherStats.totalRooms}</div>
              <div className="text-sm text-muted-foreground">Active Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{teacherStats.totalQuizzes}</div>
              <div className="text-sm text-muted-foreground">Quizzes Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{teacherStats.totalResources}</div>
              <div className="text-sm text-muted-foreground">Resources Shared</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;