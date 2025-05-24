
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const JoinRoomDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room ID",
        variant: "destructive"
      });
      return;
    }

    // Get all teacher rooms from localStorage
    const teacherRooms = localStorage.getItem('teacherRooms');
    if (teacherRooms) {
      const rooms = JSON.parse(teacherRooms);
      const room = rooms.find((r: any) => r.id === roomId.trim().toUpperCase());
      
      if (room) {
        // Add to student's joined rooms
        const studentRooms = JSON.parse(localStorage.getItem('studentRooms') || '[]');
        if (!studentRooms.find((r: any) => r.id === room.id)) {
          studentRooms.push(room);
          localStorage.setItem('studentRooms', JSON.stringify(studentRooms));
        }
        
        toast({
          title: "Successfully Joined!",
          description: `You have joined the room: ${room.name}`,
        });
        
        setRoomId('');
        setOpen(false);
        navigate(`/rooms/${room.id}`);
      } else {
        toast({
          title: "Room Not Found",
          description: "Please check the room ID and try again",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Room Not Found",
        description: "Please check the room ID and try again",
        variant: "destructive"
      });
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
          <Button type="submit" onClick={handleJoinRoom}>Join Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;
