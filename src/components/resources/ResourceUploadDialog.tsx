import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Upload, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MarkdownEditor from '@/components/ui/markdown-editor';
import CodeEditor from '@/components/ui/code-editor';

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceUploaded?: () => void;
  roomId?: string;
}

const ResourceUploadDialog: React.FC<ResourceUploadDialogProps> = ({
  open,
  onOpenChange,
  onResourceUploaded,
  roomId
}) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editorMode, setEditorMode] = useState<'markdown' | 'code' | 'plain'>('plain');
  const [resourceType, setResourceType] = useState('document');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => setShowCategoryDropdown(false);
    document.addEventListener('click', handleClickOutside);
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await resourcesAPI.getCategories();
        setCategories(response.results);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  const handleCategorySelect = (id: string, name: string) => {
    setSelectedCategory(id);
    setCategorySearch(name);
    setShowCategoryDropdown(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect resource type based on file extension
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.match(/\.(pdf|doc|docx|txt|rtf)$/)) {
        setResourceType('document');
      } else if (fileName.match(/\.(mp4|webm|mov|avi)$/)) {
        setResourceType('video');
      } else if (fileName.match(/\.(js|ts|py|java|c|cpp|html|css|json)$/)) {
        setResourceType('code');
        setEditorMode('code');
      } else if (fileName.match(/\.(zip|rar|tar|gz)$/)) {
        setResourceType('document');
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !file) {
      toast.error('Please provide a title and file');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await handleChunkedUpload();
      
      toast.success('Resource uploaded successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setCategorySearch('');
      setFile(null);
      setUploadProgress(0);
      
      // Close dialog
      onOpenChange(false);
      
      // Callback
      if (onResourceUploaded) {
        onResourceUploaded();
      }
    } catch (error) {
      console.error('Failed to upload resource:', error);
      toast.error('Failed to upload resource');
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
      
      // Always set status to approved for all users
      formData.append('status', 'approved');
      console.log('Setting resource status to approved');
      
      // Store user role in localStorage for reference
      if (user?.role) {
        localStorage.setItem('user_role', user.role);
      }
      
      // Add user ID to ensure proper ownership
      if (user?.id) {
        formData.append('uploaded_by', user.id.toString());
        console.log('Setting uploaded_by to user ID:', user.id);
      }
      
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
      
      // Get token from cookies instead of localStorage
      const getCookie = (name: string) => {
        return document.cookie.split('; ').reduce((r, v) => {
          const parts = v.split('=');
          return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
      };
      
      // Make the upload request with token refresh capability
      const makeUploadRequest = async (retryOnUnauthorized = true) => {
        // Get token from cookie (primary) or localStorage (fallback)
        let token = getCookie('emsi_access') || localStorage.getItem('emsi_access');
        
        if (!token) {
          console.error('No access token found in cookies or localStorage');
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/resources/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        // If unauthorized and we should retry
        if (response.status === 401 && retryOnUnauthorized) {
          console.log('Token expired, attempting to refresh...');
          
          try {
            // Get refresh token
            const refreshToken = getCookie('emsi_refresh') || localStorage.getItem('emsi_refresh');
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }
            
            // Try to refresh the token
            const refreshResponse = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            
            if (!refreshResponse.ok) {
              throw new Error('Failed to refresh token');
            }
            
            const data = await refreshResponse.json();
            
            // Save the new access token to both cookie and localStorage
            document.cookie = `emsi_access=${data.access}; path=/; max-age=${14 * 24 * 60 * 60}`;
            localStorage.setItem('emsi_access', data.access);
            
            // Retry the request with the new token
            console.log('Token refreshed, retrying upload...');
            return makeUploadRequest(false); // Don't retry again to avoid infinite loop
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('Authentication failed. Please log in again.');
          }
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error response:', errorText);
          throw new Error(`Failed to upload resource: ${response.status}`);
        }
        
        return response.json();
      };
      
      // Make the upload request with retry capability
      const result = await makeUploadRequest();
      console.log('Resource upload successful, server response:', result);
      
      cleanup();
      setUploadProgress(100);
      
      // Log success for debugging
      console.log('Resource status: approved');
      
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>
            Upload a resource to share with others.
          </DialogDescription>
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
            <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'markdown' | 'code' | 'plain')}>
              <TabsList className="mb-2">
                <TabsTrigger value="plain">Plain Text</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plain" className="mt-0">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter resource description"
                  rows={3}
                />
              </TabsContent>
              
              <TabsContent value="markdown" className="mt-0">
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter markdown description..."
                  className="min-h-[200px]"
                />
              </TabsContent>
              
              <TabsContent value="code" className="mt-0">
                <CodeEditor
                  value={description}
                  onChange={setDescription}
                  language="javascript"
                  placeholder="Enter code..."
                  className="min-h-[200px]"
                />
              </TabsContent>
            </Tabs>
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
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <div
                        key={category.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                onClick={() => {
                  setResourceType('code');
                  if (editorMode === 'plain') {
                    setEditorMode('code');
                  }
                }}
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
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceUploadDialog;
