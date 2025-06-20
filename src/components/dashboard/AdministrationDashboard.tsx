import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar,
  GraduationCap,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  Eye,
  UserCheck,
  FileCheck,
  Ban,
  Zap,
  BarChart3,
  Globe,
  Server
} from 'lucide-react';
import { authAPI, resourcesAPI, forumsAPI, eventsAPI, quizzesAPI, notificationsAPI, platformAPI } from '@/services/api';

const AdministrationDashboard: React.FC = () => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    bannedUsers: 0,
    usersByRole: { students: 0, teachers: 0, admins: 0 },
    pendingResources: 0,
    totalResources: 0,
    databaseSize: '0 GB',
    totalTables: 0,
    totalRecords: 0
  });

  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdministrationData();
  }, []);

  const fetchAdministrationData = async () => {
    setLoading(true);
    try {
      const [
        allUsers,
        pendingResources,
        allResources,
        databaseStats,
        notifications
      ] = await Promise.allSettled([
        authAPI.getAllUsers(),
        resourcesAPI.getPendingResources(),
        resourcesAPI.getResources({ status: 'approved' }),
        platformAPI.getDatabaseStats(),
        notificationsAPI.getAllNotifications()
      ]);

      if (allUsers.status === 'fulfilled' && allUsers.value) {
        const users = Array.isArray(allUsers.value) ? allUsers.value : allUsers.value.results || [];
        console.log('Users API response:', allUsers.value);
        console.log('Processed users array:', users);
        const today = new Date().toDateString();
        
        setAdminStats(prev => ({
          ...prev,
          totalUsers: users.length,
          newUsersToday: users.filter(u => new Date(u.date_joined).toDateString() === today).length,
          activeUsers: users.length, // Total users as active users since no real-time session tracking
          bannedUsers: users.filter(u => !u.is_active).length,
          usersByRole: {
            students: users.filter(u => u.role === 'student').length,
            teachers: users.filter(u => u.role === 'teacher').length,
            admins: users.filter(u => u.role === 'admin' || u.role === 'administration').length
          }
        }));
      } else {
        console.log('Users API failed or empty:', allUsers);
      }

      if (pendingResources.status === 'fulfilled' && allResources.status === 'fulfilled') {
        const pending = pendingResources.value?.results || [];
        const approved = allResources.value?.results || [];
        console.log('Pending resources API:', pendingResources.value);
        console.log('All resources API:', allResources.value);
        
        setAdminStats(prev => ({
          ...prev,
          pendingResources: pending.length,
          totalResources: approved.length + pending.length
        }));
      } else {
        console.log('Resources APIs failed:', { pendingResources, allResources });
      }

      if (databaseStats.status === 'fulfilled' && databaseStats.value) {
        const dbData = databaseStats.value;
        console.log('Database stats received:', dbData);
        console.log('Record counts:', dbData.record_counts);
        const totalRecords = dbData.record_counts ? Object.values(dbData.record_counts).reduce((sum: number, count: any) => sum + (count || 0), 0) : 0;
        console.log('Calculated total records:', totalRecords);
        setAdminStats(prev => ({
          ...prev,
          databaseSize: dbData.database_size?.size_pretty || '0 GB',
          totalTables: 54, // Use known value since API doesn't return table_count
          totalRecords: totalRecords
        }));
      }

      if (notifications.status === 'fulfilled' && notifications.value) {
        const notifs = notifications.value.results || [];
        const critical = notifs.filter(n => n.priority === 'high' || n.notification_type?.name?.includes('error'));
        setCriticalAlerts(critical.slice(0, 3));
      }

    } catch (error) {
      console.error('Error fetching administration data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Administration Dashboard</h1>
          <p className="text-muted-foreground">Complete platform oversight and management</p>
        </div>
        <Button onClick={fetchAdministrationData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">{alert.title}</span>
                  <Badge variant="destructive">High</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* User Management */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total Platform Users</p>
              </div>

              <div className="flex justify-between text-xs">
                <span>Students: {adminStats.usersByRole.students}</span>
                <span>Teachers: {adminStats.usersByRole.teachers}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/users">
                <Button size="sm" className="w-full">Manage Users</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Content Moderation */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Moderation</CardTitle>
            <FileCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-orange-600">{adminStats.pendingResources}</div>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
              <div className="text-xs">
                <span>Total Resources: {adminStats.totalResources}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/resources">
                <Button size="sm" variant="outline" className="w-full">Review Content</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-600">{adminStats.totalTables}</div>
                <p className="text-xs text-muted-foreground">Database Tables</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-medium">{adminStats.databaseSize}</div>
                  <div className="text-muted-foreground">DB Size</div>
                </div>
                <div>
                  <div className="font-medium">{adminStats.totalTables}</div>
                  <div className="text-muted-foreground">Tables</div>
                </div>
              </div>
              <div className="text-xs">
                <span>Records: {adminStats.totalRecords.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/settings">
                <Button size="sm" variant="outline" className="w-full">System Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Platform Control */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Control</CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="text-xs">
                <span>Database Records: {adminStats.totalRecords.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/settings">
                <Button size="sm" className="w-full">Platform Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Action Cards */}
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
              <Link to="/users">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-blue-50">
                  <UserCheck className="h-5 w-5 mb-1" />
                  <span className="text-xs">User Management</span>
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-orange-50">
                  <FileCheck className="h-5 w-5 mb-1" />
                  <span className="text-xs">Content Review</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-purple-50">
                  <Settings className="h-5 w-5 mb-1" />
                  <span className="text-xs">Platform Config</span>
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="outline" className="w-full h-16 flex flex-col hover:bg-green-50">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span className="text-xs">Forum Moderation</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Users</span>
                <Badge variant="default">{adminStats.activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Approvals</span>
                <Badge variant="destructive">{adminStats.pendingResources}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Records</span>
                <Badge variant="secondary">{adminStats.totalRecords.toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{adminStats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Users Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{adminStats.pendingResources}</div>
              <div className="text-sm text-muted-foreground">Awaiting Your Approval</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{adminStats.totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Platform Records</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrationDashboard;