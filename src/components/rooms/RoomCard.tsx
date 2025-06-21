
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, BookOpen, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  subject: string;
  description: string;
  participants_count: number;
  resources_count: number;
  quizzes_count: number;
  created_at: string;
  is_owner: boolean;
}

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { toast } = useToast();

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    toast({
      title: "Room ID Copied!",
      description: "Share this ID with your students to join the room",
    });
  };

  return (
    <Card className="overflow-hidden h-[280px] sm:h-[300px] md:h-[320px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg line-clamp-1">{room.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-1 text-xs sm:text-sm">{room.subject}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
            ID: {room.id}
          </Badge>
        </div>
        <div className="h-10 mt-2">
          {room.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{room.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{room.participants_count} participants</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{new Date(room.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1 text-primary" />
            <span>{room.resources_count} Resources</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1 text-accent" />
            <span>{room.quizzes_count} Quizzes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between flex-shrink-0">
        <Button variant="outline" onClick={copyRoomId} className="flex-1 mr-2">
          <Copy className="h-4 w-4 mr-2" />
          Copy Room ID
        </Button>
        <Link to={`/rooms/${room.id}`} className="flex-1">
          <Button className="w-full">
            Manage Room
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
