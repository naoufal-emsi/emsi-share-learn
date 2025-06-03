import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Code, Video, Image as ImageIcon, FileArchive, File, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ResourceViewer from './ResourceViewer';
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
  onDownload: (resourceId: string, filename: string) => void;
  onDelete?: (resourceId: string) => void;
  className?: string;
}

const RoomResourceCard: React.FC<RoomResourceCardProps> = ({ 
  resource, 
  onDownload, 
  onDelete,
  className 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getResourceIcon = () => {
    const type = resource.type?.toLowerCase() || '';
    const fileName = resource.file_name?.toLowerCase() || '';
    
    if (type.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText className="h-4 w-4" />;
    } else if (type.includes('code') || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
      return <Code className="h-4 w-4" />;
    } else if (type.includes('video') || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return <Video className="h-4 w-4" />;
    } else if (type.includes('image') || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (type.includes('zip') || fileName.match(/\.(zip|rar|tar|gz|7z)$/i)) {
      return <FileArchive className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
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

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {getResourceIcon()}
            {resource.title}
          </CardTitle>
          <CardDescription>{resource.type?.toUpperCase?.() || ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {resource.description && (
            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={handlePreviewClick}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Preview'}
            </Button>
            <Button
              className="flex-1"
              size="sm"
              onClick={() => onDownload(resource.id, resource.file_name || resource.title)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {onDelete && (
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
                        {(resource.file_size / 1024 / 1024).toFixed(2)} MB
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