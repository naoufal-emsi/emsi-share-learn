import React from 'react';
import { FileText, Code, Video, Image as ImageIcon, FileArchive, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourcePreviewProps {
  resource: {
    id: number;
    title: string;
    description: string;
    type: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
  };
  fileUrl: string;
  className?: string;
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ resource, fileUrl, className }) => {

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'pdf':
        return <FileText className="h-6 w-6" />;
      case 'code':
        return <Code className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'image':
        return <ImageIcon className="h-6 w-6" />;
      case 'zip':
        return <FileArchive className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  const renderPreview = () => {
    const fileType = resource.file_type?.toLowerCase() || '';
    
    if (resource.type === 'image' || fileType.includes('image')) {
      return (
        <div className="flex justify-center p-4">
          <img 
            src={fileUrl} 
            alt={resource.title} 
            className="max-w-full max-h-[600px] object-contain" 
          />
        </div>
      );
    }
    
    if (resource.type === 'video' || fileType.includes('video')) {
      return (
        <div className="flex justify-center p-4">
          <video 
            src={fileUrl} 
            controls 
            className="max-w-full max-h-[600px]"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    if (resource.type === 'pdf' || fileType.includes('pdf')) {
      return (
        <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md">
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-2">PDF Viewer Not Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your browser cannot display this PDF directly.
              </p>
              <a 
                href={fileUrl} 
                download={resource.file_name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Download PDF
              </a>
            </div>
          </object>
        </div>
      );
    }
    
    // For other file types, show a download prompt
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          {getResourceIcon()}
        </div>
        <h3 className="text-lg font-medium mb-2">{resource.file_name || resource.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This file type cannot be previewed directly.
        </p>
        <a 
          href={fileUrl} 
          download={resource.file_name}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className={cn('border rounded-md', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-0 min-h-[400px] flex items-center justify-center border-b md:border-b-0 md:border-r">
          {renderPreview()}
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Resource Information</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm font-medium">Title:</div>
                <div className="text-sm">{resource.title}</div>
                
                <div className="text-sm font-medium">Type:</div>
                <div className="text-sm capitalize">{resource.type}</div>
                
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
              <a 
                href={fileUrl} 
                download={resource.file_name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Download File
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePreview;