
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomDialogProps {
  onRoomCreated: (room: any) => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ onRoomCreated }) => {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('');
  const { toast } = useToast();

  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!roomName || !subject) {
      toast({
        title: "Error",
        description: "Room name and subject are required",
        variant: "destructive"
      });
      return;
    }

    const newRoom = {
      id: generateRoomId(),
      name: roomName,
      subject: subject,
      description: description,
      participants: participants.split(',').map(p => p.trim()).filter(p => p),
      createdAt: new Date().toISOString(),
      resources: [],
      quizzes: []
    };

    onRoomCreated(newRoom);
    
    toast({
      title: "Room Created!",
      description: `Room ID: ${newRoom.id} - Share this with your students`,
    });

    // Reset form
    setRoomName('');
    setSubject('');
    setDescription('');
    setParticipants('');
    setOpen(false);
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
          <div className="grid gap-2">
            <Label htmlFor="participants">Participants (comma-separated emails)</Label>
            <Textarea
              id="participants"
              placeholder="student1@email.com, student2@email.com"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateRoom}>Create Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
