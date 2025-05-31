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
  Image as ImageIcon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  image_base64?: string;
  video_base64?: string;
  image_name?: string;
  video_name?: string;
}

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);
  
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getEvent(eventId!);
      setEvent(data);
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
      toast.success(`You are now ${status} this event`);
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
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
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
                      <span className="font-medium">Organized by:</span>
                      <span className="ml-2">
                        {event.created_by.first_name || event.created_by.username}
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
                  <Button 
                    variant="outline"
                    onClick={handleCancelAttendance}
                  >
                    Cancel Registration
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleAttendEvent('attending')}
                  >
                    Register for Event
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Event Image</h3>
                  {event.image_base64 ? (
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={`data:${event.image_name?.includes('.png') ? 'image/png' : 'image/jpeg'};base64,${event.image_base64}`}
                        alt="Event" 
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/20">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                  
                  {isTeacher && event.created_by.id === user?.id && (
                    <div className="space-y-2">
                      <Label htmlFor="event-image">Upload Image</Label>
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
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Event Video</h3>
                  {event.video_base64 ? (
                    <div className="border rounded-md overflow-hidden">
                      <video 
                        src={`data:${event.video_name?.includes('.mp4') ? 'video/mp4' : 'video/webm'};base64,${event.video_base64}`}
                        controls
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/20">
                      <Video className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No video available</p>
                    </div>
                  )}
                  
                  {isTeacher && event.created_by.id === user?.id && (
                    <div className="space-y-2">
                      <Label htmlFor="event-video">Upload Video</Label>
                      <div className="flex gap-2">
                        <input
                          id="event-video"
                          type="file"
                          accept="video/*"
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
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EventDetails;