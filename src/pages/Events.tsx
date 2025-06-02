import React, { useState, useEffect } from 'react';
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
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/services/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import CreateEventDialog from '@/components/events/CreateEventDialog';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  event_type: string;
  is_online: boolean;
  meeting_link?: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  attendees_count: number;
  user_attendance?: {
    status: 'attending' | 'maybe' | 'declined';
    id: number;
  } | null;
  image_data?: string;
  image_base64?: string;
  image_name?: string;
  image_type?: string;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher';
  const canCreateEvents = user?.role === 'admin' || user?.role === 'administration';
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch all events to ensure we get everything including images
      const response = await eventsAPI.getEvents({});
      console.log('All events response:', response);
      
      let filteredEvents = [...response];
      
      // Apply filters based on active tab
      switch (activeTab) {
        case 'upcoming':
          const now = new Date();
          filteredEvents = filteredEvents.filter(event => 
            new Date(event.start_time) > now
          );
          break;
        case 'past':
          const today = new Date();
          filteredEvents = filteredEvents.filter(event => 
            new Date(event.end_time) < today
          );
          break;
        case 'registered':
          filteredEvents = filteredEvents.filter(event => 
            event.user_attendance && event.user_attendance.status === 'attending'
          );
          break;
        case 'managed':
          if (isTeacher) {
            filteredEvents = filteredEvents.filter(event => 
              event.created_by.id === user?.id
            );
          }
          break;
      }
      
      console.log(`Filtered ${filteredEvents.length} events for tab: ${activeTab}`);
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendEvent = async (eventId: number, status: 'attending' | 'maybe' | 'declined') => {
    try {
      await eventsAPI.attendEvent(eventId.toString(), status);
      toast.success(`You are now ${status} this event`);
      fetchEvents(); // Refresh events to update attendance status
    } catch (error) {
      console.error('Failed to attend event:', error);
      toast.error('Failed to register for event');
    }
  };

  const handleCancelAttendance = async (eventId: number) => {
    try {
      await eventsAPI.cancelAttendance(eventId.toString());
      toast.success('Registration cancelled');
      fetchEvents(); // Refresh events to update attendance status
    } catch (error) {
      console.error('Failed to cancel attendance:', error);
      toast.error('Failed to cancel registration');
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'lecture': 'Lecture',
      'workshop': 'Workshop',
      'exam': 'Exam',
      'deadline': 'Deadline',
      'meeting': 'Meeting',
      'other': 'Event'
    };
    return types[type] || 'Event';
  };

  const getEventImage = (type: string) => {
    const images: Record<string, string> = {
      'lecture': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=2000',
      'workshop': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=2000',
      'exam': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=2000',
      'deadline': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000',
      'meeting': 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=2000',
      'other': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2000'
    };
    return images[type] || images.other;
  };

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
          
          {canCreateEvents && (
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setCreateDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="registered">Registered</TabsTrigger>
            {(isTeacher || canCreateEvents) && (
              <TabsTrigger value="managed">Managed</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-0 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming events found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.image_base64 
                          ? `data:${event.image_type || 'image/jpeg'};base64,${event.image_base64}` 
                          : getEventImage(event.event_type)} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-primary hover:bg-primary-dark mb-2">
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                        <h3 className="text-white font-semibold text-lg leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description || 'No description provided.'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.location || (event.is_online ? 'Online' : 'No location specified')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.attendees_count} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted px-4 py-3 flex items-center justify-between">
                      <div className="text-sm">
                        Organized by: <span className="font-medium">
                          {event.created_by.first_name || event.created_by.username}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Details
                        </Button>
                        {user?.role === 'administration' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/events/${event.id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                        {event.user_attendance ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelAttendance(event.id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleAttendEvent(event.id, 'attending')}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-0 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past events found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Same card rendering as above */}
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden opacity-75">
                    {/* Same card content as above */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getEventImage(event.event_type)} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-primary hover:bg-primary-dark mb-2">
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                        <h3 className="text-white font-semibold text-lg leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description || 'No description provided.'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.location || (event.is_online ? 'Online' : 'No location specified')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.attendees_count} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted px-4 py-3 flex items-center justify-between">
                      <div className="text-sm">
                        Organized by: <span className="font-medium">
                          {event.created_by.first_name || event.created_by.username}
                        </span>
                      </div>
                      <Badge variant="outline">Event Ended</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="registered" className="mt-0 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't registered for any events yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Same card rendering as above */}
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    {/* Same card content as above */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getEventImage(event.event_type)} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-primary hover:bg-primary-dark mb-2">
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                        <h3 className="text-white font-semibold text-lg leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description || 'No description provided.'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.location || (event.is_online ? 'Online' : 'No location specified')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.attendees_count} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted px-4 py-3 flex items-center justify-between">
                      <div className="text-sm">
                        Organized by: <span className="font-medium">
                          {event.created_by.first_name || event.created_by.username}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelAttendance(event.id)}
                      >
                        Cancel Registration
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {(isTeacher || canCreateEvents) && (
            <TabsContent value="managed" className="mt-0 space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't created any events yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Same card rendering as above */}
                  {events.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      {/* Same card content as above */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={event.image_base64 
                            ? `data:${event.image_type || 'image/jpeg'};base64,${event.image_base64}` 
                            : getEventImage(event.event_type)} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <Badge className="bg-primary hover:bg-primary-dark mb-2">
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                          <h3 className="text-white font-semibold text-lg leading-tight">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          {event.description || 'No description provided.'}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                            <span>
                              {format(parseISO(event.start_time), 'EEEE, MMMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span>
                              {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{event.location || (event.is_online ? 'Online' : 'No location specified')}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span>{event.attendees_count} attendees</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-muted px-4 py-3 flex items-center justify-between">
                        <div className="text-sm">
                          <Badge variant="outline" className="mr-2">You created this</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              navigate(`/events/${event.id}/edit`);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await eventsAPI.deleteEvent(event.id.toString());
                                toast.success('Event deleted');
                                fetchEvents();
                              } catch (error) {
                                console.error('Failed to delete event:', error);
                                toast.error('Failed to delete event');
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {canCreateEvents && (
        <CreateEventDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onEventCreated={() => {
            fetchEvents();
            setActiveTab('managed');
          }}
        />
      )}
    </MainLayout>
  );
};

export default Events;
