import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';
import { Download, FileText, Video, Code, File, Calendar, User, Folder, ChevronRight, ChevronDown, Maximize2, Minimize2, Bookmark, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceViewer from './ResourceViewer';
import JSZip from 'jszip';
import { useAuth } from '@/contexts/AuthContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_name: string;
  file_size: number;
  bookmark_count: number;
  uploaded_at: string;
  uploaded_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture_data?: string;
  };
  category: number | null;
  category_name: string | null;
}

interface ZipItem {
  name: string;
  path: string;
  type: string;
  url?: string;
  isDir: boolean;
  content?: string;
  children?: ZipItem[];
}

interface ResourceDetailDialogProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (resourceId: string) => void;
}

const ResourceDetailDialog: React.FC<ResourceDetailDialogProps> = ({ 
  resource, 
  open, 
  onOpenChange,
  onDelete
}) => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(resource?.bookmark_count || 0);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [zipContents, setZipContents] = useState<ZipItem[]>([]);
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedZipItem, setSelectedZipItem] = useState<ZipItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [splitPosition, setSplitPosition] = useState(25); // Default split at 25%
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up any object URLs when component unmounts or resource changes
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      
      // Clean up all blob URLs
      const cleanupUrls = (items: ZipItem[]) => {
        items.forEach(item => {
          if (item.url && item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
          if (item.children) {
            cleanupUrls(item.children);
          }
        });
      };
      
      cleanupUrls(zipContents);
    };
  }, [resource, fileUrl, zipContents]);

  useEffect(() => {
    // Reset state when resource changes
    setFileUrl(null);
    setSelectedFile(null);
    setZipContents([]);
    setSelectedZipItem(null);
    setExpandedFolders({});
    setBookmarkCount(resource?.bookmark_count || 0);
    
    // If it's a ZIP file, process it
    if (resource && resource.file_name.toLowerCase().endsWith('.zip')) {
      handleZipFile();
    }
  }, [resource]);

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit the resize range (10% to 50%)
      const limitedPosition = Math.max(10, Math.min(50, newPosition));
      setSplitPosition(limitedPosition);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    // Load preview when resource changes
    if (resource && !resource.file_name.toLowerCase().endsWith('.zip')) {
      loadResourcePreview();
    }
  }, [resource]);

  const loadResourcePreview = async () => {
    if (!resource) return;
    
    setIsLoadingPreview(true);
    try {
      const blob = await resourcesAPI.downloadResource(resource.id);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (error) {
      console.error('Failed to load resource preview:', error);
      toast.error('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (!resource) {
    return null;
  }

  const handleDownload = async () => {
    if (!resource) return;
    
    setIsDownloading(true);
    try {
      const blob = await resourcesAPI.downloadResource(resource.id);
      
      // Create a download link
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
      
      toast.success('Download started');
    } catch (error) {
      console.error('Failed to download resource:', error);
      toast.error('Failed to download resource');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleBookmark = async () => {
    if (!resource) return;
    
    setIsBookmarking(true);
    try {
      const response = await resourcesAPI.bookmarkResource(resource.id);
      setBookmarkCount(response.bookmark_count);
      toast.success('Resource bookmarked');
    } catch (error) {
      console.error('Failed to bookmark resource:', error);
      toast.error('Failed to bookmark resource');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleZipFile = async () => {
    if (!resource) return;
    
    setIsLoadingZip(true);
    try {
      const blob = await resourcesAPI.downloadResource(resource.id);
      const zip = new JSZip();
      const contents = await zip.loadAsync(blob);
      
      // Build a tree structure for the ZIP contents
      const root: ZipItem[] = [];
      const folders: Record<string, ZipItem> = {};
      
      // First pass: create all folders
      Object.keys(contents.files).forEach(path => {
        const file = contents.files[path];
        const parts = path.split('/');
        
        // Skip the empty entry at the end of directory paths
        if (file.dir && parts[parts.length - 1] === '') {
          parts.pop();
        }
        
        let currentPath = '';
        let parentFolder: ZipItem | null = null;
        
        // Create folder hierarchy
        for (let i = 0; i < parts.length - (file.dir ? 0 : 1); i++) {
          const part = parts[i];
          const newPath = currentPath ? `${currentPath}/${part}` : part;
          currentPath = newPath;
          
          if (!folders[newPath]) {
            const newFolder: ZipItem = {
              name: part,
              path: newPath,
              type: 'folder',
              isDir: true,
              children: []
            };
            
            folders[newPath] = newFolder;
            
            if (parentFolder) {
              parentFolder.children!.push(newFolder);
            } else {
              root.push(newFolder);
            }
          }
          
          parentFolder = folders[newPath];
        }
      });
      
      // Second pass: add files to their parent folders
      const filePromises = Object.keys(contents.files).map(async path => {
        const file = contents.files[path];
        if (!file.dir) {
          const parts = path.split('/');
          const fileName = parts.pop() || '';
          const parentPath = parts.join('/');
          
          // Determine file type
          let fileType = 'unknown';
          if (path.endsWith('.md') || path.endsWith('.markdown')) {
            fileType = 'markdown';
          } else if (path.endsWith('.pdf')) {
            fileType = 'pdf';
          } else if (path.endsWith('.txt') || path.endsWith('.log') || path.endsWith('.csv')) {
            fileType = 'text';
          } else if (path.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) {
            fileType = 'image';
          } else if (path.match(/\.(mp4|webm|mov|avi)$/i)) {
            fileType = 'video';
          } else if (path.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|json|xml|yaml|yml)$/i)) {
            fileType = 'code';
          }
          
          // For text files, load the content as text
          let content;
          if (fileType === 'text' || fileType === 'code' || fileType === 'markdown') {
            try {
              content = await file.async('text');
            } catch (e) {
              console.error(`Failed to read ${path} as text:`, e);
            }
          }
          
          const fileBlob = await file.async('blob');
          const fileUrl = URL.createObjectURL(fileBlob);
          
          const fileItem: ZipItem = {
            name: fileName,
            path: path,
            type: fileType,
            url: fileUrl,
            content: content,
            isDir: false
          };
          
          if (parentPath && folders[parentPath]) {
            folders[parentPath].children!.push(fileItem);
          } else {
            root.push(fileItem);
          }
        }
      });
      
      await Promise.all(filePromises);
      setZipContents(root);
      
      // Select first file by default if available
      const findFirstFile = (items: ZipItem[]): ZipItem | null => {
        for (const item of items) {
          if (!item.isDir) {
            return item;
          }
          if (item.children && item.children.length > 0) {
            const found = findFirstFile(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const firstFile = findFirstFile(root);
      if (firstFile) {
        setSelectedZipItem(firstFile);
      }
    } catch (error) {
      console.error('Failed to process ZIP file:', error);
      toast.error('Failed to process ZIP file');
    } finally {
      setIsLoadingZip(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'document':
      case 'pdf':
      case 'doc':
      case 'ppt':
      case 'excel':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-red-500" />;
      case 'code':
        return <Code className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const firstName = resource.uploaded_by.first_name || '';
    const lastName = resource.uploaded_by.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Check if description might contain markdown or code
  const isMarkdown = resource.description && (
    resource.description.includes('#') || 
    resource.description.includes('**') || 
    resource.description.includes('```') ||
    resource.description.includes('- ') ||
    resource.description.includes('> ')
  );

  const isCode = resource.description && (
    resource.description.includes('{') ||
    resource.description.includes('function') ||
    resource.description.includes('class') ||
    resource.description.includes('def ') ||
    resource.description.includes('import ') ||
    resource.description.includes('const ') ||
    resource.description.includes('let ') ||
    resource.description.includes('var ')
  );

  // Determine resource file type for preview
  const getResourceFileType = () => {
    const fileName = resource.file_name.toLowerCase();
    
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

  // Render ZIP file tree with collapsible folders
  const renderZipTree = (items: ZipItem[], level = 0) => {
    return (
      <ul className={`pl-${level > 0 ? '4' : '0'} m-0`}>
        {items.map(item => (
          <li key={item.path} className="py-1">
            {item.isDir ? (
              <div>
                <div 
                  className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleFolder(item.path)}
                >
                  {expandedFolders[item.path] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Folder className="h-4 w-4 text-blue-500" />
                  <span>{item.name}</span>
                </div>
                {expandedFolders[item.path] && item.children && item.children.length > 0 && 
                  renderZipTree(item.children, level + 1)
                }
              </div>
            ) : (
              <div 
                className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted/50 ml-6 ${
                  selectedZipItem?.path === item.path ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedZipItem(item)}
              >
                {item.type === 'image' ? (
                  <File className="h-4 w-4 text-green-500" />
                ) : item.type === 'pdf' ? (
                  <FileText className="h-4 w-4 text-red-500" />
                ) : item.type === 'code' ? (
                  <Code className="h-4 w-4 text-orange-500" />
                ) : item.type === 'text' ? (
                  <FileText className="h-4 w-4 text-gray-500" />
                ) : (
                  <File className="h-4 w-4 text-gray-500" />
                )}
                <span>{item.name}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Render ZIP file contents with resizable panels
  const renderZipContents = () => {
    if (isLoadingZip) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading ZIP contents...</p>
          </div>
        </div>
      );
    }

    if (zipContents.length === 0) {
      return (
        <div className="text-center p-4">
          <p>No files found in ZIP archive.</p>
        </div>
      );
    }

    return (
      <div 
        ref={containerRef}
        className="flex h-[500px] relative border rounded-md"
      >
        {/* File tree panel */}
        <div 
          className="border-r overflow-auto"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="p-2 bg-muted font-medium border-b flex justify-between items-center">
            <span>Files</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="p-2">
            {renderZipTree(zipContents)}
          </div>
        </div>
        
        {/* Resizer handle */}
        <div
          ref={resizeRef}
          className="absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-primary cursor-col-resize z-10"
          style={{ left: `${splitPosition}%` }}
          onMouseDown={() => setIsResizing(true)}
        />
        
        {/* Preview panel */}
        <div 
          className="overflow-auto"
          style={{ width: `${100 - splitPosition}%` }}
        >
          {selectedZipItem && !selectedZipItem.isDir ? (
            <div className="h-full flex flex-col">
              <div className="p-2 bg-muted font-medium border-b">
                {selectedZipItem.name}
              </div>
              <div className="flex-1 overflow-auto p-2">
                <ResourceViewer 
                  resourceType={selectedZipItem.type}
                  fileUrl={selectedZipItem.url || ''}
                  fileName={selectedZipItem.name}
                  content={selectedZipItem.content}
                />
              </div>
            </div>
          ) : selectedZipItem && selectedZipItem.isDir ? (
            <div className="flex items-center justify-center h-full">
              <p>Folder: {selectedZipItem.name} ({selectedZipItem.children?.length || 0} items)</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a file to preview</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render file preview for non-ZIP files
  const renderFilePreview = () => {
    if (isLoadingPreview) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="text-center p-4">
          <p>Preview not available.</p>
        </div>
      );
    }

    return (
      <div className="border rounded-md overflow-hidden w-full">
        <ResourceViewer 
          resourceType={getResourceFileType()}
          fileUrl={fileUrl}
          fileName={resource.file_name}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] w-[95vw] h-[90vh]' : 'w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw]'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getResourceIcon()}
            {resource.title}
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resource metadata with user avatar */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-12 w-12 border">
              {resource.uploaded_by.profile_picture_data ? (
                <AvatarImage src={resource.uploaded_by.profile_picture_data} alt={`${resource.uploaded_by.first_name} ${resource.uploaded_by.last_name}`} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="font-medium">
                {resource.uploaded_by.first_name} {resource.uploaded_by.last_name}
              </div>
              <div className="text-sm text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(resource.uploaded_at), { addSuffix: true })}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium">{resource.file_name}</div>
              <div className="text-xs text-muted-foreground">{formatFileSize(resource.file_size)}</div>
            </div>
          </div>
          
          {/* Additional metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {resource.category_name && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span>{resource.category_name}</span>
              </div>
            )}
            

            
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bookmarks:</span>
              <span>{resource.bookmark_count || 0}</span>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Description</h3>
            
            {resource.description ? (
              <div className="border rounded-md p-4 bg-muted/30">
                {isMarkdown || isCode ? (
                  <Tabs defaultValue={isMarkdown ? "markdown" : "code"} className="w-full">
                    <TabsList>
                      {isMarkdown && <TabsTrigger value="markdown">Markdown</TabsTrigger>}
                      {isCode && <TabsTrigger value="code">Code</TabsTrigger>}
                      <TabsTrigger value="text">Plain Text</TabsTrigger>
                    </TabsList>
                    
                    {isMarkdown && (
                      <TabsContent value="markdown" className="mt-2">
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{resource.description}</ReactMarkdown>
                        </div>
                      </TabsContent>
                    )}
                    
                    {isCode && (
                      <TabsContent value="code" className="mt-2">
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          <code className="text-sm font-mono">{resource.description}</code>
                        </pre>
                      </TabsContent>
                    )}
                    
                    <TabsContent value="text" className="mt-2">
                      <p className="whitespace-pre-wrap">{resource.description}</p>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="whitespace-pre-wrap">{resource.description}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}
          </div>
          
          {/* File Preview */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview</h3>
            {resource.file_name.toLowerCase().endsWith('.zip') ? (
              renderZipContents()
            ) : (
              renderFilePreview()
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button 
              onClick={handleBookmark} 
              disabled={isBookmarking}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bookmark className="h-4 w-4" />
              {isBookmarking ? 'Bookmarking...' : 'Bookmark'}
            </Button>
            
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>

            {onDelete && resource && (user?.id === resource.uploaded_by.id || user?.role === 'administration') && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Resource
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{resource.title}"? This action cannot be undone and the resource will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(resource.id);
                        onOpenChange(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailDialog;