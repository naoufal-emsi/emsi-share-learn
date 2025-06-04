import React, { useState, useEffect } from 'react';
import { Link, useFetcher } from 'react-router-dom';
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
import { Progress } from '@/components/ui/progress';
import {roomsAPI, resourcesAPI, quizzesAPI, forumsAPI} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext'; // Assuming your hook is named useAuth

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [resources, setResources] = useState([]); // Add state for resources
  const [quizzes, setQuizzes] = useState([]); // Add state for quizzes
  const [allStudentAnswers, setAllStudentAnswers] = useState([]); // New state for all student answers
  const [averageScore, setAverageScore] = useState<number | null>(null); // New state for average score
  const [averageStudentsPerRoom, setAverageStudentsPerRoom] = useState<number | null>(null);
  const [forumTopics, setForumTopics] = useState([]);
  const [unsolvedTopics, setUnsolvedTopics] = useState(0);
  const [userPosts, setUserPosts] = useState(0);
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    const fetchStudents = async () => {
      // Check if user and user.id exist before fetching
      if (user && user.id) {
        try {
          const response = await roomsAPI.getTeacherStudents(user.id); // Use user.id here
          // Assuming the response is the array of students directly
          setStudents(response || []); 
        } catch (error) {
          console.error('Error fetching teacher students:', error); 
        }
      }
    };

    fetchStudents();
  }, [user]); // Add user to dependency array so it refetches when user data is available

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomsAPI.getRooms();
        setRooms(response || []); // Set rooms state with the response, default to empty array if null
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    const fetchResources = async () => {
      try {
        const response = await resourcesAPI.getAllResources();
        setResources(response.results || []); // Set resources state
      } catch (error) {
        console.error('Error fetching all resources:', error);
      }
    };

    const fetchQuizzes = async () => {
      try {
        const response = await quizzesAPI.getTeacherRoomsQuizzes();
        // Handle the response directly since it doesn't have a results property
        setQuizzes(Array.isArray(response) ? response : []);
        console.log("Quizzes response:", response);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    const fetchAllStudentAnswers = async () => { // New function to fetch all student answers
      try {
        const response = await quizzesAPI.getTeacherAllStudentAnswers();
        setAllStudentAnswers(Array.isArray(response) ? response : []);
        console.log("All student answers response:", response);
      } catch (error) {
        console.error('Error fetching all student answers:', error);
      }
    };
    
    // Fetch forum data
    const fetchForumData = async () => {
      try {
        // Get all forum topics
        const topicsResponse = await forumsAPI.getTopics();
        const topics = topicsResponse.results || [];
        setForumTopics(topics);
        
        // Count unsolved topics
        const unsolved = topics.filter(topic => !topic.is_solved).length;
        setUnsolvedTopics(unsolved);
        
        // Count user's posts if user is logged in
        if (user && user.id) {
          let userPostCount = 0;
          
          // Get posts for each topic and count those created by the current user
          for (const topic of topics) {
            try {
              const postsResponse = await forumsAPI.getPosts(topic.id.toString());
              const posts = postsResponse.results || [];
              userPostCount += posts.filter(post => post.created_by && post.created_by.id === user.id).length;
            } catch (error) {
              console.error(`Error fetching posts for topic ${topic.id}:`, error);
            }
          }
          
          setUserPosts(userPostCount);
        }
      } catch (error) {
        console.error('Error fetching forum data:', error);
      }
    };

    fetchRooms();
    fetchResources();
    fetchQuizzes();
    fetchAllStudentAnswers();
    fetchForumData();
  }, [user]);

  useEffect(() => {
    // Calculate average score whenever allStudentAnswers changes
    if (allStudentAnswers.length > 0) {
      const totalScore = allStudentAnswers.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      const avg = totalScore / allStudentAnswers.length;
      setAverageScore(avg);
    } else {
      setAverageScore(0);
    }

    if (rooms && rooms.length > 0) {
      const totalParticipants = rooms.reduce((sum, room) => sum + (room.participants ? room.participants.length : 0), 0);
      setAverageStudentsPerRoom(totalParticipants / rooms.length);
    }

  }, [allStudentAnswers, rooms]); // Recalculate when allStudentAnswers changes

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
              <span className="text-sm font-medium">Total Students</span>
              <span className="text-sm font-medium">{students.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rooms</span>
              <span className="text-sm font-medium">{rooms?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Students per Room</span>
              <span className="text-sm font-medium">{averageStudentsPerRoom !== null ? averageStudentsPerRoom.toFixed(2) : 'N/A'}</span>
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
              <span className="text-sm font-medium">{resources.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Private Resources</span>
              <span className="text-sm font-medium">{resources.filter(resource => resource.room).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Popular</span>
              <span className="text-sm text-muted-foreground">
                {resources.length > 0 && resources.some(r => r.download_count !== undefined)
                  ? resources.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))[0].title
                  : 'N/A'}
              </span>
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
              <span className="text-sm font-medium">Total Quizzes</span>
              <span className="text-sm font-medium">{quizzes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Quizzes</span>
              <span className="text-sm font-medium">{quizzes.filter(quiz => quiz.is_active).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Score</span>
              <span className="text-sm font-medium">{averageScore !== null ? `${averageScore.toFixed(2)}%` : 'N/A'}</span> {/* Display calculated average */}
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
              <span className="text-sm font-medium">{forumTopics.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Unanswered Questions</span>
              <Badge variant="destructive">{unsolvedTopics}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Replies</span>
              <span className="text-sm font-medium">{userPosts}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/forum" className="text-xs text-primary hover:underline">
            Moderate forum
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent Quizzes (Duplicated to fill space) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Quiz Results</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allStudentAnswers.length > 0 ? (
              allStudentAnswers.slice(0, 3).map((answer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{answer.student_name || `Student ${answer.student_id}`}</span>
                  <span className="text-sm font-medium">{answer.score}%</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No quiz results yet</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/quiz" className="text-xs text-primary hover:underline">
            View all quiz results
          </Link>
        </CardFooter>
      </Card>
      
      {/* Student Activity (Duplicated to fill space) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Student Activity</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Students</span>
              <span className="text-sm font-medium">{students.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resource Downloads</span>
              <span className="text-sm font-medium">
                {resources.reduce((sum, resource) => sum + (resource.download_count || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quiz Participation</span>
              <span className="text-sm font-medium">{allStudentAnswers.length}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/analytics" className="text-xs text-primary hover:underline">
            View detailed stats
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherDashboard;