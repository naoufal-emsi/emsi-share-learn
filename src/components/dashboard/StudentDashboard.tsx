import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Download
} from 'lucide-react';
import { resourcesAPI, roomsAPI, quizzesAPI, forumsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  // State for downloaded resources
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for student rooms, quizzes, and forum data
  const [studentRooms, setStudentRooms] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  const [userPosts, setUserPosts] = useState(0);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [forumLoading, setForumLoading] = useState(true);
  
  // Removed hardcoded upcoming events data

  // Fetch recent downloads, student rooms, and quizzes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setRoomsLoading(true);
        
        // Fetch general resources
        const resourceResponse = await resourcesAPI.getResources();
        let allResources = [...(resourceResponse.results || [])];
        
        // Fetch room-specific resources
        const roomsResponse = await roomsAPI.getRooms();
        setStudentRooms(roomsResponse || []);
        
        if (roomsResponse && roomsResponse.length > 0) {
          for (const room of roomsResponse) {
            if (room.id) {
              try {
                const roomResourcesResponse = await resourcesAPI.getResources({ roomId: room.id.toString() });
                if (roomResourcesResponse.results && roomResourcesResponse.results.length > 0) {
                  allResources = [...allResources, ...roomResourcesResponse.results];
                }
              } catch (error) {
                console.error(`Error fetching resources for room ${room.id}:`, error);
              }
            }
          }
        }
        
        // Remove duplicates
        const uniqueResources = allResources.filter((resource, index, self) => 
          index === self.findIndex(r => r.id === resource.id)
        );
        
        // Sort by most recent and take the first 3
        const sortedResources = uniqueResources
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3);
          
        setRecentDownloads(sortedResources);
        
        // Rooms are already fetched above
        
        // Fetch quizzes from student's rooms
        let allQuizzes = [];
        if (roomsResponse && roomsResponse.length > 0) {
          for (const room of roomsResponse) {
            if (room.id) {
              try {
                const roomQuizzes = await quizzesAPI.getQuizzes(room.id.toString());
                if (Array.isArray(roomQuizzes)) {
                  allQuizzes = [...allQuizzes, ...roomQuizzes];
                }
              } catch (error) {
                console.error(`Error fetching quizzes for room ${room.id}:`, error);
              }
            }
          }
        }
        
        // Also fetch public quizzes
        try {
          const publicQuizzes = await quizzesAPI.getPublicQuizzes();
          if (Array.isArray(publicQuizzes)) {
            allQuizzes = [...allQuizzes, ...publicQuizzes];
          }
        } catch (error) {
          console.error('Error fetching public quizzes:', error);
        }
        
        // Remove duplicates (in case a quiz is both in a room and public)
        const uniqueQuizzes = allQuizzes.filter((quiz, index, self) => 
          index === self.findIndex(q => q.id === quiz.id)
        );
        
        setQuizzes(uniqueQuizzes);
        
        // Fetch forum data
        setForumLoading(true);
        try {
          // Get forum topics
          const topicsResponse = await forumsAPI.getTopics();
          setForumTopics(topicsResponse.results || []);
          
          // Count user's posts
          let postCount = 0;
          for (const topic of topicsResponse.results || []) {
            try {
              const postsResponse = await forumsAPI.getPosts(topic.id.toString());
              const userPostsInTopic = postsResponse.results.filter(post => 
                post.created_by && post.created_by.id === (user?.id || 0)
              );
              postCount += userPostsInTopic.length;
            } catch (error) {
              console.error(`Error fetching posts for topic ${topic.id}:`, error);
            }
          }
          setUserPosts(postCount);
        } catch (error) {
          console.error('Error fetching forum data:', error);
        } finally {
          setForumLoading(false);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setRoomsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Recent Downloads (replacing Learning Progress) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Downloads</CardTitle>
          <Download className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          ) : recentDownloads.length > 0 ? (
            <div className="space-y-4">
              {recentDownloads.map(resource => (
                <div key={resource.id} className="flex items-start">
                  {resource.type === 'document' ? (
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                  ) : resource.type === 'video' ? (
                    <BookMarked className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} by {resource.created_by?.first_name} {resource.created_by?.last_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent downloads</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/resources" className="text-xs text-primary hover:underline">
            Browse resources
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent Resources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Resources</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            ) : (
              recentDownloads.map(resource => (
                <div key={resource.id} className="flex items-start">
                  {resource.type === 'document' ? (
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <BookMarked className="h-4 w-4 mr-2 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} by {resource.created_by?.first_name} {resource.created_by?.last_name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/resources" className="text-xs text-primary hover:underline">
            View all resources
          </Link>
        </CardFooter>
      </Card>
      
      {/* Available Quizzes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Quizzes</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.slice(0, 3).map(quiz => (
                <div key={quiz.id} className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{quiz.title}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-muted-foreground mr-2">
                        {quiz.questions?.length || 0} questions
                      </p>
                      <Badge variant={quiz.is_active ? "default" : "secondary"} className="text-xs">
                        {quiz.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No quizzes available</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/rooms" className="text-xs text-primary hover:underline">
            View my rooms
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
          {forumLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Discussions</span>
                <span className="text-sm font-medium">{forumTopics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Posts</span>
                <span className="text-sm text-muted-foreground">{userPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unsolved Topics</span>
                <Badge variant="destructive">{forumTopics.filter(topic => !topic.is_solved).length}</Badge>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/forum" className="text-xs text-primary hover:underline">
            Go to forum
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent Resources (Duplicated to fill space) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Popular Resources</CardTitle>
          <BookMarked className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            ) : (
              recentDownloads.map(resource => (
                <div key={resource.id} className="flex items-start">
                  {resource.type === 'document' ? (
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <BookMarked className="h-4 w-4 mr-2 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} by {resource.created_by?.first_name} {resource.created_by?.last_name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/resources" className="text-xs text-primary hover:underline">
            Browse all resources
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent Quizzes (Duplicated to fill space) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Quiz Attempts</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.slice(0, 3).map(quiz => (
                <div key={quiz.id} className="flex items-start">
                  <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{quiz.title}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-muted-foreground mr-2">
                        {quiz.questions?.length || 0} questions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No quiz attempts yet</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/quiz" className="text-xs text-primary hover:underline">
            View all quizzes
          </Link>
        </CardFooter>
      </Card>

    </div>
  );
};

export default StudentDashboard;