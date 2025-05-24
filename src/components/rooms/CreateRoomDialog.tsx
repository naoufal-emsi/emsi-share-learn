
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomDialogProps {
  onRoomCreated: (roomData: any) => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ onRoomCreated }) => {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!roomName || !subject) {
      toast({
        title: "Error",
        description: "Room name and subject are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await onRoomCreated({
        name: roomName,
        subject: subject,
        description: description,
      });

      // Reset form
      setRoomName('');
      setSubject('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new learning room for your students.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name *</Label>
            <Input
              id="roomName"
              placeholder="e.g., Advanced Mathematics"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Room description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreateRoom}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
