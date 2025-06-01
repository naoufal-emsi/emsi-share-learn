import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { resourcesAPI } from '@/services/api';
import { uploadAPI } from '@/services/api';
import { toast } from 'sonner';
import { Upload, X, Search, Loader2, Archive } from 'lucide-react';

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId?: string;
  onSuccess?: () => void;
}

const ResourceUploadDialog: React.FC<ResourceUploadDialogProps> = ({ 
  open, 
  onOpenChange,
  roomId,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await resourcesAPI.getCategories();
        console.log('Categories response:', response);
        setCategories(response.results || []);
      } catch (error) {
        console.error('Failed to fetch resource categories:', error);
      }
    };
    
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  // Debug categories
  useEffect(() => {
    console.log('Available categories:', categories);
  }, [categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > 100) {
        toast.error('File size exceeds 100MB limit');
        return;
      }
      
      setFile(selectedFile);
      
      // Only auto-detect resource type if user hasn't explicitly selected one
      if (!resourceType) {
        // Auto-detect resource type based on file type
        const fileType = selectedFile.type.toLowerCase();
        const fileName = selectedFile.name.toLowerCase();
        
        if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('document') || 
            fileType.includes('powerpoint') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
          setResourceType('document');
        } else if (fileType.includes('video')) {
          setResourceType('video');
        } else if (fileType.includes('text/plain') || fileType.includes('application/json') || 
                  fileType.includes('text/html') || fileType.includes('text/css') || 
                  fileType.includes('application/javascript') ||
                  fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|json|xml|yaml|yml|md|sql)$/i)) {
          setResourceType('code');
        } else if (fileType.includes('zip') || fileType.includes('archive') || 
                  fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) {
          setResourceType('document'); // Use 'document' type for archives as 'archive' is not valid in backend
        } else {
          setResourceType('other');
        }
      }
      
      // Show file size warning for large files
      if (fileSizeMB > 10) {
        toast.info(`Large file detected (${fileSizeMB.toFixed(1)}MB). Upload may take some time.`);
      }
    }
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setCategorySearch(categoryName);
    setShowCategoryDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast.error('Please provide a title and select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Check if file is a ZIP file and ensure resourceType is set appropriately
      // Note: Backend doesn't accept 'archive' as a valid type, so we use 'document' for ZIP files
      const fileType = file.name.toLowerCase();
      const finalType = fileType.endsWith('.zip') ? 'document' : (resourceType || 'other');
      
      // For files larger than 10MB, use chunked upload
      if (file.size > 10 * 1024 * 1024) {
        await handleChunkedUpload(finalType);
      } else {
        // Use regular upload for smaller files
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('file_data', file);
        formData.append('type', finalType);
        
        if (selectedCategory) {
          formData.append('category', selectedCategory);
        }
        
        if (roomId) {
          formData.append('room', roomId);
        }

        await resourcesAPI.uploadResource(formData);
      }
      
      toast.success('Resource uploaded successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setSelectedCategory('');
      setCategorySearch('');
      setResourceType('');
      setUploadProgress(0);
      
      // Close dialog
      onOpenChange(false);
      
      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to upload resource:', error);
      toast.error('Failed to upload resource. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleChunkedUpload = async (fileType = resourceType) => {
    if (!file) return;
    
    try {
      // For large files, use regular upload instead of chunked upload
      // since the backend endpoint for chunked uploads is not available
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('file_data', file);
      formData.append('type', fileType || 'other');
      
      if (selectedCategory) {
        formData.append('category', selectedCategory);
      }
      
      if (roomId) {
        formData.append('room', roomId);
      }

      // Show progress simulation for better UX
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 500);
        
        return () => clearInterval(interval);
      };
      
      const cleanup = simulateProgress();
      await resourcesAPI.uploadResource(formData);
      cleanup();
      setUploadProgress(100);
      
      return;
      
      // The code below is commented out because the endpoint doesn't exist
      /*
      const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;
      
      // Create metadata for the resource
      const resourceMetadata = {
        title: title.trim(),
        description: description.trim(),
        type: fileType || 'other',
        category: selectedCategory || undefined,
        room: roomId || undefined,
        filename: file.name,
        filesize: file.size,
        filetype: file.type,
        chunks: totalChunks
      };
      
      // Create upload session
      const sessionResponse = await resourcesAPI.createResourceUploadSession(resourceMetadata);
      const sessionId = sessionResponse.session_id;
      */
      
      // This code is no longer needed as we're using regular upload
      
    } catch (error) {
      console.error('Chunked upload failed:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter resource description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <div className="flex items-center border rounded-md">
                <Search className="h-4 w-4 ml-3 text-muted-foreground" />
                <Input
                  id="category-search"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                    if (!e.target.value) {
                      setSelectedCategory('');
                    }
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Search for a category"
                  className="border-0 focus-visible:ring-0"
                />
                {categorySearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 mr-1"
                    onClick={() => {
                      setCategorySearch('');
                      setSelectedCategory('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <div
                        key={category.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCategorySelect(category.id.toString(), category.name)}
                      >
                        {category.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {categorySearch ? 'No categories found' : 'Start typing to search categories'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Resource Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button"
                variant={resourceType === 'document' ? "default" : "outline"} 
                onClick={() => setResourceType('document')}
                className="justify-start"
              >
                Documents
              </Button>
              <Button 
                type="button"
                variant={resourceType === 'video' ? "default" : "outline"} 
                onClick={() => setResourceType('video')}
                className="justify-start"
              >
                Videos
              </Button>
              <Button 
                type="button"
                variant={resourceType === 'code' ? "default" : "outline"} 
                onClick={() => setResourceType('code')}
                className="justify-start"
              >
                Code
              </Button>
              <Button 
                type="button"
                variant={resourceType === 'document' && file?.name?.toLowerCase().endsWith('.zip') ? "default" : "outline"} 
                onClick={() => setResourceType('document')}
                className="justify-start"
              >
                Archives
              </Button>
              <Button 
                type="button"
                variant={resourceType === 'other' ? "default" : "outline"} 
                onClick={() => setResourceType('other')}
                className="justify-start col-span-2"
              >
                Other
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            {!file ? (
              <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                </label>
              </div>
            ) : (
              <div className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="min-w-[100px]">
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
                </div>
              ) : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceUploadDialog;