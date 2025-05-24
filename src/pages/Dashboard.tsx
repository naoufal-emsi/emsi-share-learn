import React, { useEffect, useState } from 'react';
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
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('emsi_access');
        const res = await fetch('http://localhost:8080/api/rooms/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // Example: Post a new room (for teachers)
  const createRoom = async () => {
    const token = localStorage.getItem('emsi_access');
    const res = await fetch('http://localhost:8080/api/rooms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'New Room',
        subject: 'Math',
        description: 'A new math room',
      }),
    });
    if (res.ok) {
      const newRoom = await res.json();
      setRooms(prev => [...prev, newRoom]);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
        <button onClick={createRoom} disabled={user?.role !== 'teacher'}>
          Create Room (Teacher Only)
        </button>
        {loading ? <div>Loading...</div> : (
          <ul>
            {rooms.map(room => (
              <li key={room.id}>{room.name} - {room.subject}</li>
            ))}
          </ul>
        )}
        {user?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
