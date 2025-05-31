import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Video, Code, File, Trash2 } from 'lucide-react';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';

interface ResourceCardProps {
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
    };
    category: number | null;
    category_name: string | null;
  };
  onClick?: (resource: ResourceCardProps['resource']) => void;
  onDelete?: () => void; // Add this line
  showDeleteButton?: boolean; // Add this line
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick, onDelete, showDeleteButton }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
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
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (type === 'video') {
      return <Video className="h-10 w-10 text-red-500" />;
    } else if (type === 'code') {
      return <Code className="h-10 w-10 text-green-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
              {resource.category_name && (
                <Badge variant="outline" className="bg-primary/5">
                  {resource.category_name}
                </Badge>
              )}
              <Badge variant="outline">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mt-3">
              <span>By {resource.uploaded_by.first_name} {resource.uploaded_by.last_name}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(resource.uploaded_at)}</span>
              <span className="mx-1">•</span>
              <span>{formatFileSize(resource.file_size)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download ({resource.download_count})
        </Button>
        {showDeleteButton && onDelete && (
          <Button variant="destructive" size="sm" onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }} className="ml-2">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;