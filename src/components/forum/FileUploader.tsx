import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image, Film, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileUploaderProps {
  onFileSelect: (file: File, base64Data: string) => void;
  onFileRemove: () => void;
  selectedFile: { file: File; base64: string } | null;
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  maxSizeMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    
    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        onFileSelect(file, e.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    } else if (fileType.startsWith('video/')) {
      return <Film className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  const getFilePreview = () => {
    if (!selectedFile) return null;
    
    const { file, base64 } = selectedFile;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-2 relative">
          <img 
            src={base64} 
            alt="Preview" 
            className="max-h-32 max-w-full rounded-md object-contain"
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max file size: {maxSizeMB}MB
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.file)}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {getFilePreview()}
        </div>
      )}
      
      {error && (
        <Badge variant="destructive" className="mt-1">
          {error}
        </Badge>
      )}
    </div>
  );
};

export default FileUploader;