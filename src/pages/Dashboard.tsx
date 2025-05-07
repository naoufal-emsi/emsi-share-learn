
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  FileText, 
  Users, 
  BarChart, 
  Calendar, 
  TrendingUp, 
  Clock,
  Bell,
  GraduationCap
} from 'lucide-react';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
        
        {user?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
