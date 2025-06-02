import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart as BarChartIcon, 
  PieChart, 
  LineChart, 
  BarChart3, 
  Users,
  Award,
  FileText,
  AlertCircle
} from 'lucide-react';

// Import Recharts components
import {
  BarChart,
  Bar,
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authorized
  React.useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'administration') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'administration') {
    return null;
  }
  
  // Mock data for analytics
  const quizPerformanceData = [
    { name: 'React Fundamentals', avgScore: 75, submissions: 32 },
    { name: 'Database Concepts', avgScore: 68, submissions: 28 },
    { name: 'Algorithms', avgScore: 82, submissions: 24 },
    { name: 'JavaScript', avgScore: 85, submissions: 30 },
    { name: 'Networking', avgScore: 72, submissions: 22 }
  ];
  
  const studentEngagementData = [
    { name: 'Week 1', quizAttempts: 45, resourceViews: 120, forumPosts: 15 },
    { name: 'Week 2', quizAttempts: 52, resourceViews: 135, forumPosts: 18 },
    { name: 'Week 3', quizAttempts: 48, resourceViews: 142, forumPosts: 22 },
    { name: 'Week 4', quizAttempts: 60, resourceViews: 158, forumPosts: 25 },
    { name: 'Week 5', quizAttempts: 58, resourceViews: 165, forumPosts: 20 },
    { name: 'Week 6', quizAttempts: 65, resourceViews: 180, forumPosts: 28 }
  ];
  
  const resourcesUsageData = [
    { name: 'PDFs', value: 45 },
    { name: 'Videos', value: 28 },
    { name: 'Code', value: 18 },
    { name: 'Others', value: 9 }
  ];
  
  const COLORS = ['#9b87f5', '#33C3F0', '#6E59A5', '#8E9196'];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor student performance and engagement metrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">126</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Quiz Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground">
                +3% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                +5 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                -2 from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Performance</TabsTrigger>
            <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
            <TabsTrigger value="resources">Resources Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>Average scores across different quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quizPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgScore" name="Avg. Score (%)" fill="#9b87f5" />
                        <Bar dataKey="submissions" name="Submissions" fill="#33C3F0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Activity trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart
                        data={studentEngagementData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="quizAttempts" 
                          name="Quiz Attempts" 
                          stroke="#9b87f5" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="resourceViews" 
                          name="Resource Views" 
                          stroke="#33C3F0" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forumPosts" 
                          name="Forum Posts" 
                          stroke="#6E59A5" 
                        />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources Usage</CardTitle>
                  <CardDescription>Distribution by resource type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartPieChart>
                        <Pie
                          data={resourcesUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {resourcesUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Student Performance Distribution</CardTitle>
                  <CardDescription>Number of students by score range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { range: '90-100%', students: 15 },
                          { range: '80-89%', students: 28 },
                          { range: '70-79%', students: 35 },
                          { range: '60-69%', students: 22 },
                          { range: '50-59%', students: 18 },
                          { range: '<50%', students: 8 }
                        ]}
                        margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="range" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" name="Number of Students" fill="#9b87f5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Other tabs would contain more detailed versions of each chart */}
          <TabsContent value="quiz" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Detailed quiz performance analytics will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Detailed student engagement analytics will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Detailed resources usage analytics will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
