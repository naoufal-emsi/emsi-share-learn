
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";

// Mock users data - in a real app, this would come from an API
const mockUsers = [
  { id: '1', name: 'Student Demo', email: 'student@emsi.ma', role: 'student', avatar: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=100' },
  { id: '2', name: 'Teacher Demo', email: 'teacher@emsi.ma', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=100' },
  { id: '3', name: 'Admin Demo', email: 'admin@emsi.ma', role: 'admin', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100' },
  { id: '4', name: 'Jane Smith', email: 'jane.smith@emsi.ma', role: 'student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { id: '5', name: 'John Doe', email: 'john.doe@emsi.ma', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { id: '6', name: 'Alice Johnson', email: 'alice.johnson@emsi.ma', role: 'student', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
  { id: '7', name: 'Bob Williams', email: 'bob.williams@emsi.ma', role: 'student', avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=100' },
];

type UserViewMode = 'table' | 'detail';

const Users: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [viewMode, setViewMode] = useState<UserViewMode>('table');
  const { toast } = useToast();

  useEffect(() => {
    // Filter users based on search query
    const filtered = mockUsers.filter((u) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.role.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  }, [searchQuery]);

  const handleViewUser = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('table');
    setSelectedUser(null);
  };

  const handleAction = (action: string, userId: string) => {
    toast({
      title: `${action} user`,
      description: `You ${action.toLowerCase()} user with ID: ${userId}`,
    });
  };

  if (user?.role !== 'admin') {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users in the system.
          </p>
        </div>
        
        {viewMode === 'table' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  A list of all users in the system.
                </CardDescription>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2 md:w-80">
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:min-w-64"
                />
                <Button type="submit" variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="capitalize">{user.role}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Details</CardTitle>
                <CardDescription>
                  Detailed information about the selected user.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleBackToList}>
                Back to List
              </Button>
            </CardHeader>
            <CardContent>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                      <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">User ID:</span>
                          <span>{selectedUser.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Account Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Role:</span>
                          <span className="capitalize">{selectedUser.role}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-green-500">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" onClick={() => handleAction('Edit', selectedUser.id)}>
                      Edit User
                    </Button>
                    <Button variant="destructive" onClick={() => handleAction('Delete', selectedUser.id)}>
                      Delete User
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Users;
