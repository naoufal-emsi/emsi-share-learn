import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Code, Video, Image as ImageIcon, FileArchive, File, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { resourcesAPI } from '@/services/api';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string;
    type?: string;
    file_name?: string;
    file_size?: number;
    uploaded_by?: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  onClick: (resource: any) => void;
  onDelete?: (resourceId: string) => void;
  showDeleteButton?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onClick,
  onDelete,
  showDeleteButton = false
}) => {
  const getResourceIcon = () => {
    const type = resource.type?.toLowerCase() || '';
    const fileName = resource.file_name?.toLowerCase() || '';
    
    if (type.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <FileText className="h-4 w-4" />;
    } else if (type.includes('code') || fileName?.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
      return <Code className="h-4 w-4" />;
    } else if (type.includes('video') || fileName?.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return <Video className="h-4 w-4" />;
    } else if (type.includes('image') || fileName?.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (type.includes('zip') || fileName?.match(/\.(zip|rar|tar|gz|7z)$/i)) {
      return <FileArchive className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading resource:', resource.id);
      const blob = await resourcesAPI.downloadResource(resource.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name || resource.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Download completed for:', resource.title);
    } catch (error) {
      console.error('Failed to download resource:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getResourceIcon()}
          {resource.title}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{resource.type?.toUpperCase?.() || ''}</span>
          {resource.file_size && (
            <span className="text-xs">{formatFileSize(resource.file_size)}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-1 flex flex-col">
        {resource.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
        )}
        
        {resource.uploaded_by && (
          <p className="text-xs text-muted-foreground mb-3">
            By: {resource.uploaded_by.first_name} {resource.uploaded_by.last_name}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            onClick={() => onClick(resource)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            className="flex-1"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {showDeleteButton && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the resource and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(resource.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;