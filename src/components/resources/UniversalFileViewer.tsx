import React from 'react';
import { FileText, Code, Video, Image as ImageIcon, FileArchive, File } from 'lucide-react';

interface UniversalFileViewerProps {
  fileUrl: string;
  fileName: string;
  fileType?: string;
  resourceType?: string;
}

const UniversalFileViewer: React.FC<UniversalFileViewerProps> = ({ 
  fileUrl, 
  fileName, 
  fileType = '', 
  resourceType = '' 
}) => {
  const getResourceIcon = () => {
    const type = resourceType.toLowerCase() || fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6" />;
    } else if (type.includes('code') || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
      return <Code className="h-6 w-6" />;
    } else if (type.includes('video') || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return <Video className="h-6 w-6" />;
    } else if (type.includes('image') || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
      return <ImageIcon className="h-6 w-6" />;
    } else if (type.includes('zip') || fileName.match(/\.(zip|rar|tar|gz|7z)$/i)) {
      return <FileArchive className="h-6 w-6" />;
    } else {
      return <File className="h-6 w-6" />;
    }
  };

  // Handle image files
  if (resourceType.includes('image') || fileType.includes('image') || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
    return (
      <div className="flex justify-center p-4">
        <img 
          src={fileUrl} 
          alt={fileName} 
          className="max-w-full max-h-[600px] object-contain" 
        />
      </div>
    );
  }
  
  // Handle video files
  if (resourceType.includes('video') || fileType.includes('video') || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
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
  
  // Handle PDF files
  if (resourceType.includes('pdf') || fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
    console.log('Rendering PDF viewer with URL:', fileUrl);
    return (
      <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md">
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title={fileName}
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
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mb-2"
            >
              Open PDF
            </a>
            <a 
              href={fileUrl} 
              download={fileName}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Download
            </a>
          </div>
        </iframe>
      </div>
    );
  }
  
  // For other file types, show a download prompt
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        {getResourceIcon()}
      </div>
      <h3 className="text-lg font-medium mb-2">{fileName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This file type cannot be previewed directly.
      </p>
      <a 
        href={fileUrl} 
        download={fileName}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Download File
      </a>
    </div>
  );
};

export default UniversalFileViewer;