import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Video, Code, File, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RoomResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    type: string;
    file_name: string;
    file_size?: number;
  };
  onClick?: (resource: RoomResourceCardProps['resource']) => void;
  onDownload?: (resourceId: string, fileName: string) => void;
  onDelete?: (resourceId: string) => void;
  showDeleteButton?: boolean;
}

const RoomResourceCard: React.FC<RoomResourceCardProps> = ({ 
  resource, 
  onClick, 
  onDownload, 
  onDelete, 
  showDeleteButton 
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    if (onDownload) {
      onDownload(resource.id, resource.file_name);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(resource.id);
    }
  };

  const getResourceIcon = () => {
    const type = resource.type.toLowerCase();
    if (type === 'document' || type === 'pdf' || type === 'doc' || type === 'ppt' || type === 'excel') {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (type === 'video') {
      return <Video className="h-10 w-10 text-red-500" />;
    } else if (type === 'code') {
      return <Code className="h-10 w-10 text-green-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(resource)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getResourceIcon()}
          <div className="flex-1">
            <h3 className="font-medium text-lg">{resource.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {resource.description || 'No description provided'}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
            
            {resource.file_size && (
              <div className="text-xs text-muted-foreground mt-3">
                <span>Size: {formatFileSize(resource.file_size)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        {showDeleteButton && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" onClick={(e) => {
                e.stopPropagation();
              }} className="ml-2">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the resource and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default RoomResourceCard;