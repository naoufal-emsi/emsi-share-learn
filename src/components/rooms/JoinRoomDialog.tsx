
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { roomsAPI } from '@/services/api';

interface JoinRoomDialogProps {
  onRoomJoined?: () => void;
}

const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({ onRoomJoined }) => {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await roomsAPI.joinRoom(roomId.trim().toUpperCase());
      
      toast({
        title: "Successfully Joined!",
        description: `You have joined the room with ID: ${roomId.trim().toUpperCase()}`,
      });
      
      setRoomId('');
      setOpen(false);
      
      if (onRoomJoined) {
        onRoomJoined();
      } else {
        navigate(`/rooms/${roomId.trim().toUpperCase()}`);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      toast({
        title: "Failed to Join Room",
        description: "Please check the room ID and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Room</DialogTitle>
          <DialogDescription>
            Enter the room ID provided by your teacher to join the room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter room ID (e.g., ABC123DE)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="uppercase"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;
