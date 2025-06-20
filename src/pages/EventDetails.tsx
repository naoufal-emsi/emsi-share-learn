import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft,
  Upload,
  Loader2,
  Video,
  Image as ImageIcon,
  UserCog,
  UserCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AttendeesList from '@/components/events/AttendeesList';

import { User } from '@/types/user';

interface Collaborator {
  id: string;
  user: User;
  is_admin: boolean;
  added_at: string;
}

interface Attendee {
  id: number;
  user: User;
  status: 'attending' | 'maybe' | 'declined';
  created_at: string;
}

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
  created_by: User;
  attendees_count: number;
  user_attendance?: {
    status: 'attending' | 'maybe' | 'declined';
    id: number;
  } | null;
  image_base64?: string;
  video_base64?: string;
  image_name?: string;
  video_name?: string;
  trailer_base64?: string;
  trailer_type?: 'image' | 'video';
  event_collaborators: Collaborator[];
  attendees: Attendee[];
}

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  useEffect(() => {
    if (eventId) {
      fetchEvent();
      
      // Auto-register creator and collaborators
      const autoRegister = async () => {
        try {
          await eventsAPI.autoRegisterCollaborators(eventId);
        } catch (error) {
          console.error('Failed to auto-register collaborators:', error);
        }
      };
      
      autoRegister();
    }
  }, [eventId]);
  
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getEvent(eventId!);
      setEvent(data);
      
      // Fetch attendees
      if (data.id) {
        try {
          const attendeesData = await eventsAPI.getAttendees(data.id.toString());
          console.log('Fetched attendees:', attendeesData);
          setAttendees(attendeesData || []);
        } catch (attendeesError) {
          console.error('Failed to fetch attendees:', attendeesError);
          setAttendees([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAttendEvent = async (status: 'attending' | 'maybe' | 'declined') => {
    if (!event) return;
    
    try {
      await eventsAPI.attendEvent(event.id.toString(), status);
      
      // Show toast notification
      toast.success(`Successfully registered for "${event.title}"`, {
        duration: 5000,
        action: {
          label: "View Event",
          onClick: () => {}
        }
      });
      
      // Refresh notifications if available in the app
      if (window.refreshNotifications) {
        window.refreshNotifications();
      }
      
      fetchEvent();
    } catch (error) {
      console.error('Failed to attend event:', error);
      toast.error('Failed to register for event');
    }
  };
  
  const handleCancelAttendance = async () => {
    if (!event) return;
    
    try {
      await eventsAPI.cancelAttendance(event.id.toString());
      toast.success('Registration cancelled');
      fetchEvent();
    } catch (error) {
      console.error('Failed to cancel attendance:', error);
      toast.error('Failed to cancel registration');
    }
  };
  
  const handleImageUpload = async () => {
    if (!imageFile || !event) return;
    
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        await eventsAPI.updateEvent(event.id.toString(), {
          image_upload: base64data
        });
        
        toast.success('Image uploaded successfully');
        fetchEvent();
        setImageFile(null);
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleVideoUpload = async () => {
    if (!videoFile || !event) return;
    
    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        await eventsAPI.updateEvent(event.id.toString(), {
          video_upload: base64data
        });
        
        toast.success('Video uploaded successfully');
        fetchEvent();
        setVideoFile(null);
      };
      reader.readAsDataURL(videoFile);
    } catch (error) {
      console.error('Failed to upload video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
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
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  if (!event) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Event not found.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <Badge className="ml-auto">
            {getEventTypeLabel(event.event_type)}
          </Badge>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="attendees">
              Attendees
              <Badge variant="secondary" className="ml-1">{event.attendees_count}</Badge>
            </TabsTrigger>
            {event.image_base64 && (
              <TabsTrigger value="image-preview">Full Image</TabsTrigger>
            )}
          </TabsList>
          
          <div className="space-y-6 mt-6">
            {/* Cover Image Section */}
            <Card>
              <CardContent className="p-0 overflow-hidden">
                {event.image_base64 ? (
                  <div className="relative group cursor-pointer" onClick={() => setActiveTab('image-preview')}>
                    <img 
                      src={`data:${event.image_name?.includes('.png') ? 'image/png' : 'image/jpeg'};base64,${event.image_base64}`}
                      alt="Event" 
                      className="w-full h-auto object-contain max-h-[600px]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center bg-muted/20">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <TabsContent value="details">
              {/* Event Trailer Section */}
            <Card>
              <CardHeader>
                <CardTitle>Event Trailer</CardTitle>
              </CardHeader>
              <CardContent>
                {event.video_base64 ? (
                  <video 
                    src={`data:${event.video_name?.includes('.mp4') ? 'video/mp4' : 'video/webm'};base64,${event.video_base64}`}
                    controls
                    className="w-full"
                  />
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No trailer available for this event.
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Event Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground">{event.description || 'No description provided.'}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">Date:</span>
                      <span className="ml-2">
                        {format(parseISO(event.start_time), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">
                        {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">
                        {event.is_online ? 'Online' : (event.location || 'No location specified')}
                      </span>
                    </div>
                    
                    {event.is_online && event.meeting_link && (
                      <div className="flex items-center">
                        <span className="font-medium">Meeting Link:</span>
                        <a 
                          href={event.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline"
                        >
                          {event.meeting_link}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">Attendees:</span>
                      <span className="ml-2">{event.attendees_count}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium">Responsible:</span>
                      <span className="ml-2">
                        {event.created_by.first_name || event.created_by.username}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {event.created_by.role || 'Teacher'}
                        </Badge>
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium">Your Status:</span>
                      <span className="ml-2">
                        {event.user_attendance ? event.user_attendance.status : 'Not registered'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {event.user_attendance ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                      disabled
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Registered
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancelAttendance}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleAttendEvent('attending')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Register for Event
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="collaborators">
            <Card>
              <CardHeader>
                <CardTitle>Event Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                {event.event_collaborators && event.event_collaborators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {event.event_collaborators.map((collaborator) => (
                      <div 
                        key={collaborator.id}
                        className="flex items-center p-2 border rounded-md"
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          {collaborator.user.profile_picture_data ? (
                            <AvatarImage 
                              src={collaborator.user.profile_picture_data} 
                              alt={`${collaborator.user.first_name} ${collaborator.user.last_name}`} 
                            />
                          ) : collaborator.user.avatar ? (
                            <AvatarImage 
                              src={collaborator.user.avatar} 
                              alt={`${collaborator.user.first_name} ${collaborator.user.last_name}`} 
                            />
                          ) : (
                            <AvatarFallback>
                              {collaborator.user.first_name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {`${collaborator.user.first_name} ${collaborator.user.last_name}`}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {collaborator.user.role && (
                              <span className="mr-1">{collaborator.user.role}</span>
                            )}
                            {collaborator.is_admin && (
                              <Badge variant="secondary" className="text-xs py-0 h-4">Admin</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No collaborators for this event.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle>Event Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendeesList attendees={attendees} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="image-preview">
            {event.image_base64 && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Image - Full Size</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full overflow-auto">
                    <img 
                      src={`data:${event.image_name?.includes('.png') ? 'image/png' : 'image/jpeg'};base64,${event.image_base64}`}
                      alt="Event Full Size" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: 'none' }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Media Upload Section (for teachers only) */}
          {isTeacher && event.created_by.id === user?.id && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Event Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-image">Upload Cover Image</Label>
                    <div className="flex gap-2">
                      <input
                        id="event-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleImageUpload}
                        disabled={!imageFile || uploadingImage}
                      >
                        {uploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-video">Upload Media</Label>
                    <div className="flex gap-2">
                      <input
                        id="event-video"
                        type="file"
                        accept="video/*,image/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleVideoUpload}
                        disabled={!videoFile || uploadingVideo}
                      >
                        {uploadingVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-trailer">Upload Trailer</Label>
                    <div className="flex gap-2">
                      <input
                        id="event-trailer"
                        type="file"
                        accept="video/*,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const isVideo = file.type.startsWith('video/');
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64data = reader.result as string;
                              
                              // Use separate field for trailer to avoid overwriting main image
                              await eventsAPI.updateEvent(event.id.toString(), {
                                video_upload: base64data // Use video_upload for trailer
                              });
                              
                              toast.success('Trailer uploaded successfully');
                              fetchEvent();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EventDetails;