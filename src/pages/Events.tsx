import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Calendar,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Events: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Tech Workshop: Introduction to AI',
      description: 'A hands-on workshop exploring the fundamentals of artificial intelligence and machine learning.',
      date: '2023-11-18',
      time: '14:00 - 17:00',
      location: 'Amphi A',
      organizer: 'Prof. Sara',
      category: 'Workshop',
      attendees: 45,
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 2,
      title: 'Career Fair 2023',
      description: 'Connect with potential employers from the tech industry and explore career opportunities.',
      date: '2023-11-25',
      time: '09:00 - 16:00',
      location: 'Main Campus',
      organizer: 'Career Services',
      category: 'Career',
      attendees: 120,
      image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 3,
      title: 'Software Engineering Seminar',
      description: 'Learn about the latest trends and best practices in software engineering from industry experts.',
      date: '2023-12-05',
      time: '10:00 - 13:00',
      location: 'Room C12',
      organizer: 'Prof. Ahmed',
      category: 'Seminar',
      attendees: 68,
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 4,
      title: 'Hackathon: Innovation Challenge',
      description: 'A 24-hour hackathon where students collaborate to build innovative solutions for real-world problems.',
      date: '2023-12-10',
      time: '09:00 (24h)',
      location: 'Tech Hub',
      organizer: 'Student Council',
      category: 'Competition',
      attendees: 89,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2000'
    }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Discover and participate in academic events and activities
            </p>
          </div>
          
          {isTeacher && (
            <Button className="bg-primary hover:bg-primary-dark">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="registered">Registered</TabsTrigger>
            {isTeacher && (
              <TabsTrigger value="managed">Managed</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-primary hover:bg-primary-dark mb-2">
                        {event.category}
                      </Badge>
                      <h3 className="text-white font-semibold text-lg leading-tight">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-muted px-4 py-3 flex items-center justify-between">
                    <div className="text-sm">
                      Organized by: <span className="font-medium">{event.organizer}</span>
                    </div>
                    <Button size="sm">Register</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Other tabs would have similar content */}
          <TabsContent value="past" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Past events will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="registered" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Events you have registered for will be displayed here.</p>
            </div>
          </TabsContent>
          
          {isTeacher && (
            <TabsContent value="managed" className="mt-0">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Events you are managing will be displayed here.</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Events;
