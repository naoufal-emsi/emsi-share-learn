import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, FileText, Video, Code, File } from 'lucide-react';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';

interface ResourceDetailDialogProps {
  resource: {
    id: string;
    title: string;
    description: string;
    type: string;
    file_name: string;
    file_size: number;
    download_count: number;
    uploaded_at: string;
    uploaded_by: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar?: string;
      profile_picture_data?: string;
    };
    category: number | null;
    category_name: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResourceDetailDialog: React.FC<ResourceDetailDialogProps> = ({ resource, open, onOpenChange }) => {
  if (!resource) return null;

  const handleDownload = async () => {
    try {
      const blob = await resourcesAPI.downloadResource(resource.id.toString());
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Downloading resource');
    } catch (error) {
      console.error('Failed to download resource:', error);
      toast.error('Failed to download resource');
    }
  };

  const getResourceIcon = () => {
    const type = resource.type.toLowerCase();
    if (type === 'document' || type === 'pdf' || type === 'doc' || type === 'ppt' || type === 'excel') {
      return <FileText className="h-16 w-16 text-blue-500" />;
    } else if (type === 'video') {
      return <Video className="h-16 w-16 text-red-500" />;
    } else if (type === 'code') {
      return <Code className="h-16 w-16 text-green-500" />;
    } else {
      return <File className="h-16 w-16 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 py-4">
          <div className="flex items-center justify-center">
            {getResourceIcon()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {resource.description || 'No description provided'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Creator</h4>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={resource.uploaded_by.profile_picture_data || resource.uploaded_by.avatar} 
                    alt={resource.uploaded_by.first_name || 'User'} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {resource.uploaded_by.first_name?.[0] || resource.uploaded_by.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{resource.uploaded_by.first_name} {resource.uploaded_by.last_name}</p>
                  <p className="text-xs text-muted-foreground">{resource.uploaded_by.username}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Details</h4>
              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                <div>
                  <span className="text-muted-foreground">File name:</span>
                </div>
                <div>{resource.file_name}</div>
                
                <div>
                  <span className="text-muted-foreground">File size:</span>
                </div>
                <div>{formatFileSize(resource.file_size)}</div>
                
                <div>
                  <span className="text-muted-foreground">Type:</span>
                </div>
                <div>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</div>
                
                <div>
                  <span className="text-muted-foreground">Category:</span>
                </div>
                <div>{resource.category_name || 'Uncategorized'}</div>
                
                <div>
                  <span className="text-muted-foreground">Uploaded on:</span>
                </div>
                <div>{formatDate(resource.uploaded_at)}</div>
                
                <div>
                  <span className="text-muted-foreground">Downloads:</span>
                </div>
                <div>{resource.download_count}</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {resource.category_name && (
                <Badge variant="outline" className="bg-primary/5">
                  {resource.category_name}
                </Badge>
              )}
              <Badge variant="outline">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailDialog;