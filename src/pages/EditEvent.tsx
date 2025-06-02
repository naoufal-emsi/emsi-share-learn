import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsAPI } from '@/services/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EventData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  event_type: string;
  is_online: boolean;
  meeting_link?: string;
  image_data?: string;
  image_base64?: string;
  created_by: {
    id: number;
  };
}

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administration';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState('10:00');
  const [eventType, setEventType] = useState('lecture');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const data = await eventsAPI.getEvent(eventId);
        setEventData(data);
        
        // Set form data
        setTitle(data.title);
        setDescription(data.description || '');
        setLocation(data.location || '');
        setIsOnline(data.is_online);
        setMeetingLink(data.meeting_link || '');
        setEventType(data.event_type);
        
        // Parse dates and times
        const startDateTime = parseISO(data.start_time);
        setStartDate(startDateTime);
        setStartTime(format(startDateTime, 'HH:mm'));
        
        const endDateTime = parseISO(data.end_time);
        setEndDate(endDateTime);
        setEndTime(format(endDateTime, 'HH:mm'));
        
        // Set image preview if available
        if (data.image_base64) {
          setImagePreview(`data:image/jpeg;base64,${data.image_base64}`);
        } else if (data.image_data) {
          setImagePreview(data.image_data);
        }
      } catch (error) {
        console.error('Failed to fetch event data:', error);
        toast.error('Failed to load event data');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, navigate]);

  useEffect(() => {
    // Check if user has permission to edit this event
    if (!isLoading && eventData && !isAdmin && eventData.created_by.id !== user?.id) {
      toast.error('You do not have permission to edit this event');
      navigate('/events');
    }
  }, [eventData, isLoading, isAdmin, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Create start and end datetime strings
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);
    
    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);
    
    // Validate dates are valid
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast.error('Please enter valid dates in YYYY-MM-DD format');
      return;
    }
    
    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process image if provided
      let imageUpload;
      if (imageFile) {
        const reader = new FileReader();
        imageUpload = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
      
      const updatedEventData = {
        title,
        description,
        location: isOnline ? '' : location,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: eventType,
        is_online: isOnline,
        meeting_link: isOnline ? meetingLink : '',
        image_upload: imageUpload || undefined
      };
      
      await eventsAPI.updateEvent(eventId!, updatedEventData);
      toast.success('Event updated successfully');
      navigate('/events');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin && !eventData) {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Loading Event</CardTitle>
            <CardDescription>
              Please wait while we load the event details...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Update the information for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title*</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the event"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type*</Label>
                  <Select value={eventType} onValueChange={setEventType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-online"
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                  />
                  <Label htmlFor="is-online">This is an online event</Label>
                </div>
                
                {isOnline ? (
                  <div className="space-y-2">
                    <Label htmlFor="meeting-link">Meeting Link</Label>
                    <Input
                      id="meeting-link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="Enter meeting URL"
                      type="url"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter event location"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date*</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                          setStartDate(new Date(dateValue));
                        } else {
                          setStartDate(undefined);
                        }
                      }}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time*</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date*</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                          setEndDate(new Date(dateValue));
                        } else {
                          setEndDate(undefined);
                        }
                      }}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time*</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-image">Event Cover Image</Label>
                  <Input
                    id="event-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        // Create preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Event preview" 
                        className="max-h-40 rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/events')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Event'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EditEvent;