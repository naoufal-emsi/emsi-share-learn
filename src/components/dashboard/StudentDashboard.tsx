import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Clock,
  GraduationCap,
  CalendarDays,
  BookMarked,
  MessageSquare,
  Download,
  Users,
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';
import { resourcesAPI, roomsAPI, quizzesAPI, forumsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentStats, setStudentStats] = useState({
    totalResources: 0,
    downloadedResources: 0,
    joinedRooms: 0,
    availableQuizzes: 0,
    completedQuizzes: 0,
    forumPosts: 0,
    forumTopics: 0,
    unsolvedTopics: 0
  });

  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [
        resourcesData,
        roomsData,
        quizzesData,
        forumsData
      ] = await Promise.allSettled([
        resourcesAPI.getResources(),
        roomsAPI.getRooms(),
        quizzesAPI.getPublicQuizzes(),
        forumsAPI.getTopics()
      ]);

      // Process resources
      if (resourcesData.status === 'fulfilled' && resourcesData.value) {
        const resources = resourcesData.value.results || [];
        setRecentResources(resources.slice(0, 3));
        setStudentStats(prev => ({
          ...prev,
          totalResources: resources.length,
          downloadedResources: resources.length // Simplified for now
        }));
      }

      // Process rooms
      if (roomsData.status === 'fulfilled' && roomsData.value) {
        const rooms = Array.isArray(roomsData.value) ? roomsData.value : [];
        setStudentStats(prev => ({
          ...prev,
          joinedRooms: rooms.length
        }));
      }

      // Process quizzes
      if (quizzesData.status === 'fulfilled' && quizzesData.value) {
        const quizzes = Array.isArray(quizzesData.value) ? quizzesData.value : [];
        setStudentStats(prev => ({
          ...prev,
          availableQuizzes: quizzes.length,
          completedQuizzes: quizzes.filter(q => q.completed).length || 0
        }));
      }

      // Process forums
      if (forumsData.status === 'fulfilled' && forumsData.value) {
        const topics = forumsData.value.results || [];
        setStudentStats(prev => ({
          ...prev,
          forumTopics: topics.length,
          unsolvedTopics: topics.filter(topic => !topic.is_solved).length,
          forumPosts: topics.reduce((sum, topic) => sum + (topic.post_count || 0), 0)
        }));
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">Your learning journey and progress</p>
        </div>
        <Button onClick={fetchStudentData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Learning Resources */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Resources</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{studentStats.totalResources}</div>
                <p className="text-xs text-muted-foreground">Available Resources</p>
              </div>
              <div className="flex justify-between text-xs">
                <span>Downloaded: {studentStats.downloadedResources}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/resources">
                <Button size="sm" className="w-full">Browse Resources</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Rooms */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rooms</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-600">{studentStats.joinedRooms}</div>
                <p className="text-xs text-muted-foreground">Joined Rooms</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/student-rooms">
                <Button size="sm" variant="outline" className="w-full">View My Rooms</Button>
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
                <div className="text-2xl font-bold text-orange-600">{studentStats.forumTopics}</div>
                <p className="text-xs text-muted-foreground">Discussion Topics</p>
              </div>
              <div className="text-xs">
                <span>Unsolved: {studentStats.unsolvedTopics}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/forum">
                <Button size="sm" variant="outline" className="w-full">Join Discussions</Button>
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
              <Link to="/resources">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-blue-50">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Browse Resources</span>
                </Button>
              </Link>
              <Link to="/student-rooms">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-green-50">
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-xs">My Rooms</span>
                </Button>
              </Link>
              <Link to="/quiz">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-purple-50">
                  <GraduationCap className="h-5 w-5 mb-1" />
                  <span className="text-xs">Take Quiz</span>
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-orange-50">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span className="text-xs">Ask Questions</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Recent Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResources.length > 0 ? (
                recentResources.map((resource: any) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-sm">{resource.title}</div>
                        <div className="text-xs text-muted-foreground">{resource.type}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{resource.category_name || 'General'}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No resources available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Learning Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{studentStats.totalResources}</div>
              <div className="text-sm text-muted-foreground">Resources Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{studentStats.joinedRooms}</div>
              <div className="text-sm text-muted-foreground">Rooms Joined</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{studentStats.availableQuizzes}</div>
              <div className="text-sm text-muted-foreground">Quizzes Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;