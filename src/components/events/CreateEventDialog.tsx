import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsAPI } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ImageIcon, Loader2 } from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({ 
  open, 
  onOpenChange,
  onEventCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [endTime, setEndTime] = useState('10:00');
  const [eventType, setEventType] = useState('lecture');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
  const [trailerType, setTrailerType] = useState<'image' | 'video' | null>(null);

  const resetForm = () => {
    const newToday = new Date();
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate(newToday);
    setStartTime('09:00');
    setEndDate(newToday);
    setEndTime('10:00');
    setEventType('lecture');
    setIsOnline(false);
    setMeetingLink('');
    setImageFile(null);
    setImagePreview(null);
    setTrailerFile(null);
    setTrailerPreview(null);
    setTrailerType(null);
  };

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
      
      // Process trailer if provided
      let trailerUpload;
      if (trailerFile) {
        const reader = new FileReader();
        trailerUpload = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(trailerFile);
        });
      }
      
      const eventData = {
        title,
        description,
        location: isOnline ? '' : location,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: eventType,
        is_online: isOnline,
        meeting_link: isOnline ? meetingLink : '',
        image_upload: imageUpload || undefined,
        video_upload: trailerType === 'video' ? trailerUpload : undefined,
        trailer_upload: trailerType === 'image' ? trailerUpload : undefined,
        trailer_type: trailerType || undefined
      };
      
      await eventsAPI.createEvent(eventData);
      toast.success('Event created successfully');
      resetForm();
      onOpenChange(false);
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="space-y-2 border-t pt-4 mt-4">
            <Label>Event Trailer</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trailer-image" className="text-sm text-muted-foreground mb-2 block">
                  Upload Image Trailer
                </Label>
                <Input
                  id="trailer-image"
                  type="file"
                  accept="image/*"
                  disabled={trailerType === 'video'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTrailerFile(file);
                      setTrailerType('image');
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setTrailerPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="trailer-video" className="text-sm text-muted-foreground mb-2 block">
                  Upload Video Trailer
                </Label>
                <Input
                  id="trailer-video"
                  type="file"
                  accept="video/*"
                  disabled={trailerType === 'image'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTrailerFile(file);
                      setTrailerType('video');
                      // Create preview for video
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setTrailerPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
            
            {trailerPreview && (
              <div className="mt-2">
                <p className="text-sm mb-1">Trailer Preview:</p>
                {trailerType === 'image' ? (
                  <img 
                    src={trailerPreview} 
                    alt="Trailer preview" 
                    className="max-h-40 rounded-md object-cover"
                  />
                ) : (
                  <video 
                    src={trailerPreview} 
                    controls 
                    className="max-h-40 rounded-md w-full"
                  />
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setTrailerFile(null);
                    setTrailerPreview(null);
                    setTrailerType(null);
                  }}
                >
                  Remove Trailer
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;