import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Code, Video, Image as ImageIcon, FileArchive, File, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ResourceViewer from './ResourceViewer';
import { Badge } from '@/components/ui/badge';
import { resourcesAPI } from '@/services/api';

interface RoomResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string;
    type?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
  };
  onClick?: (resource: RoomResourceCardProps['resource']) => void;
  onDownload: (resourceId: string, filename: string) => void;
  onDelete?: (resourceId: string) => void;
  className?: string;
  showDeleteButton?: boolean;
}

const RoomResourceCard: React.FC<RoomResourceCardProps> = ({ 
  resource, 
  onClick,
  onDownload, 
  onDelete,
  className,
  showDeleteButton = true
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getResourceIcon = () => {
    const type = resource.type?.toLowerCase() || '';
    const fileName = resource.file_name?.toLowerCase() || '';
    
    if (type.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (type.includes('code') || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
      return <Code className="h-10 w-10 text-green-500" />;
    } else if (type.includes('video') || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return <Video className="h-10 w-10 text-red-500" />;
    } else if (type.includes('image') || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
      return <ImageIcon className="h-10 w-10 text-purple-500" />;
    } else if (type.includes('zip') || fileName.match(/\.(zip|rar|tar|gz|7z)$/i)) {
      return <FileArchive className="h-10 w-10 text-orange-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  // Function to handle preview click
  const handlePreviewClick = async () => {
    setIsLoading(true);
    try {
      // Use the downloadResource API function instead of direct fetch
      const blob = await resourcesAPI.downloadResource(resource.id);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching file for preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine resource file type for preview
  const getResourceFileType = () => {
    const fileName = resource.file_name?.toLowerCase() || '';
    
    if (fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (fileName.match(/\.(md|markdown)$/i)) {
      return 'markdown';
    } else if (fileName.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) {
      return 'image';
    } else if (fileName.match(/\.(mp4|webm|mov|avi)$/i)) {
      return 'video';
    } else if (fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|json|xml|yaml|yml)$/i)) {
      return 'code';
    } else if (fileName.match(/\.(txt|log|csv)$/i)) {
      return 'text';
    } else if (fileName.endsWith('.zip')) {
      return 'zip';
    } else {
      return 'unknown';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(resource);
    } else {
      handlePreviewClick();
    }
  };

  return (
    <>
      <Card 
        className={cn("overflow-hidden hover:shadow-md transition-shadow cursor-pointer", className)}
        onClick={handleCardClick}
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
                  {(resource.type?.charAt(0).toUpperCase() + resource.type?.slice(1)) || 'Document'}
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
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviewClick();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Preview'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDownload(resource.id, resource.file_name || resource.title);
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {showDeleteButton && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                  }} 
                  className="ml-2"
                >
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
                  <AlertDialogAction onClick={(e) => {
                    e.stopPropagation();
                    onDelete(resource.id);
                  }}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>

      <Dialog open={previewOpen} onOpenChange={(open) => {
        setPreviewOpen(open);
        if (!open && fileUrl) {
          // Clean up the blob URL when dialog closes
          URL.revokeObjectURL(fileUrl);
          setFileUrl(null);
        }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{resource.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-h-[400px] flex items-center justify-center border rounded-md overflow-hidden">
              {fileUrl && (
                <ResourceViewer 
                  resourceType={getResourceFileType()}
                  fileUrl={fileUrl}
                  fileName={resource.file_name || ''}
                />
              )}
            </div>
            
            <div className="space-y-4 border rounded-md p-4">
              <div>
                <h3 className="text-lg font-medium">Resource Information</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm font-medium">Title:</div>
                  <div className="text-sm">{resource.title}</div>
                  
                  {resource.type && (
                    <>
                      <div className="text-sm font-medium">Type:</div>
                      <div className="text-sm capitalize">{resource.type}</div>
                    </>
                  )}
                  
                  {resource.file_name && (
                    <>
                      <div className="text-sm font-medium">File Name:</div>
                      <div className="text-sm">{resource.file_name}</div>
                    </>
                  )}
                  
                  {resource.file_type && (
                    <>
                      <div className="text-sm font-medium">File Type:</div>
                      <div className="text-sm">{resource.file_type}</div>
                    </>
                  )}
                  
                  {resource.file_size && (
                    <>
                      <div className="text-sm font-medium">File Size:</div>
                      <div className="text-sm">
                        {formatFileSize(resource.file_size)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {resource.description && (
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="text-sm mt-2">{resource.description}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  onClick={() => onDownload(resource.id, resource.file_name || resource.title)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomResourceCard;