import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, FileText, Video, Code, File, Loader2, ExternalLink, Image as ImageIcon, Archive, Folder } from 'lucide-react';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';
import JSZip from 'jszip';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

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
    file_data?: string;
    file_type?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Code preview component
const CodePreview = ({ url, fileName }: { url: string, fileName: string }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setCode(text);
        
        // Detect language from file extension
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        setLanguage(getLanguageFromExtension(ext));
      } catch (error) {
        console.error('Failed to load code file:', error);
      }
    };
    
    fetchCode();
  }, [url, fileName]);
  
  useEffect(() => {
    if (code && language) {
      // Apply the appropriate theme stylesheet
      const themeLink = document.getElementById('hljs-theme') as HTMLLinkElement;
      if (!themeLink) {
        const link = document.createElement('link');
        link.id = 'hljs-theme';
        link.rel = 'stylesheet';
        link.href = theme === 'dark' 
          ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css'
          : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
        document.head.appendChild(link);
      } else {
        themeLink.href = theme === 'dark' 
          ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css'
          : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
      }
      
      // Re-highlight the code with the new theme
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 50);
    }
  }, [code, language, theme]);
  
  const zoomIn = () => setFontSize(prev => Math.min(prev + 2, 24));
  const zoomOut = () => setFontSize(prev => Math.max(prev - 2, 10));
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  if (!code) return <div className="p-4">Loading code...</div>;
  
  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={zoomOut}
          title="Zoom out"
        >
          A-
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={zoomIn}
          title="Zoom in"
        >
          A+
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </div>
      <div className="overflow-auto max-h-[600px]">
        <pre 
          className={`p-4 rounded ${theme === 'dark' ? 'bg-[#282c34] text-white' : 'bg-gray-50'}`}
          style={{ fontSize: `${fontSize}px`, fontWeight: theme === 'dark' ? 500 : 400 }}
        >
          <code className={language}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Helper function to get language for syntax highlighting
const getLanguageFromExtension = (ext: string) => {
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    html: 'html',
    css: 'css',
    php: 'php',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    rb: 'ruby',
    go: 'go',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql'
  };
  
  return map[ext] || '';
};

// Office preview component
const OfficePreview = ({ url, fileName }: { url: string, fileName: string }) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  return (
    <div className="p-4 text-center">
      <p>Office document preview is limited in browser</p>
      <div className="flex justify-center gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={() => window.open(url, '_blank')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button 
          onClick={() => {
            // For Office Online viewer
            const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + url)}`;
            window.open(viewerUrl, '_blank');
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Office Online
        </Button>
      </div>
    </div>
  );
};

const ResourceDetailDialog: React.FC<ResourceDetailDialogProps> = ({ resource, open, onOpenChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipContents, setZipContents] = useState<{name: string, path: string, size: number, dir: boolean}[]>([]);
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [currentZipPath, setCurrentZipPath] = useState<string>('');
  const [zipFileContent, setZipFileContent] = useState<string | null>(null);
  const [zipFileType, setZipFileType] = useState<string | null>(null);
  
  useEffect(() => {
    if (open && resource) {
      loadPreview();
    } else {
      // Clean up preview URL when dialog closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    
    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, resource]);
  
  const extractZipContents = async (blob: Blob) => {
    setIsExtractingZip(true);
    try {
      const zip = new JSZip();
      
      // If blob is empty, use the previewUrl to fetch the zip
      let contents;
      if (blob.size === 0 && previewUrl) {
        const zipData = await (await fetch(previewUrl)).blob();
        contents = await zip.loadAsync(zipData);
      } else {
        contents = await zip.loadAsync(blob);
      }
      
      // Create a map to track directories
      const directories = new Set();
      
      // First pass: identify all directories
      Object.keys(contents.files).forEach(path => {
        // Add explicit directories
        if (contents.files[path].dir) {
          directories.add(path);
        }
        
        // Add implicit directories (parent folders)
        const parts = path.split('/');
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i++) {
            const parentPath = parts.slice(0, i).join('/') + '/';
            directories.add(parentPath);
          }
        }
      });
      
      // Get root level files and directories
      const rootFiles = [];
      
      // Add directories first
      Array.from(directories)
        .filter(dir => !dir.includes('/') || (dir.split('/').length === 2 && dir.endsWith('/')))
        .sort()
        .forEach(dir => {
          rootFiles.push({
            name: dir.replace('/', ''),
            path: dir,
            size: 0,
            dir: true
          });
        });
      
      // Then add files (including hidden files)
      Object.keys(contents.files)
        .filter(path => !path.includes('/') && !contents.files[path].dir)
        .sort()
        .forEach(path => {
          rootFiles.push({
            name: path,
            path: path,
            size: contents.files[path]._data.uncompressedSize,
            dir: false
          });
        });
      
      setZipContents(rootFiles);
      setCurrentZipPath('');
      setZipFileContent(null);
      setZipFileType(null);
    } catch (error) {
      console.error('Failed to extract ZIP contents:', error);
      toast.error('Failed to read ZIP file');
    } finally {
      setIsExtractingZip(false);
    }
  };
  
  // Helper function to determine file type
  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'avi', 'mov'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['js', 'ts', 'py', 'java', 'html', 'css', 'php', 'c', 'cpp', 'h', 'rb', 'go', 'json', 'xml', 'yaml', 'yml', 'md', 'txt', 'log', 'csv', 'sql'].includes(ext)) return 'code';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
    
    return 'other';
  };
  
  // Simple text preview component
  const TextPreview = ({ url }: { url: string }) => {
    const [text, setText] = useState<string>('Loading...');
    
    useEffect(() => {
      const fetchText = async () => {
        try {
          const response = await fetch(url);
          const content = await response.text();
          setText(content);
        } catch (error) {
          console.error('Failed to load text content:', error);
          setText('Error loading content');
        }
      };
      
      fetchText();
    }, [url]);
    
    return <>{text}</>;
  };
  
  // Add this function to handle ZIP navigation
  const navigateZipContents = async (path: string) => {
    if (!previewUrl) return;
    
    try {
      setIsLoading(true);
      
      // If path is empty or root, go back to the root level
      if (!path || path === '/') {
        setZipFileContent(null);
        setZipFileType(null);
        setCurrentZipPath('');
        const zipData = await (await fetch(previewUrl)).blob();
        await extractZipContents(zipData);
        setIsLoading(false);
        return;
      }
      
      const zip = new JSZip();
      const zipData = await (await fetch(previewUrl)).blob();
      const contents = await zip.loadAsync(zipData);
      
      // Check if path is a directory
      if (path.endsWith('/')) {
        // Create a map to track directories
        const directories = new Map(); // Use Map to store dir name -> full path
        
        // Identify all directories at this level
        Object.keys(contents.files).forEach(filename => {
          if (filename.startsWith(path) && filename !== path) {
            const relativePath = filename.slice(path.length);
            const parts = relativePath.split('/');
            
            if (parts.length > 1 && parts[0]) {
              // This is a file in a subdirectory
              const dirName = parts[0] + '/';
              directories.set(dirName, path + dirName);
            }
          }
        });
        
        // Filter contents to show files and identified directories at this level
        const dirContents = [];
        
        // Add parent directory for easier navigation
        if (path !== '') {
          const parentPath = path.split('/').slice(0, -2).join('/') + '/';
          dirContents.push({
            name: '../',
            path: parentPath || '',
            size: 0,
            dir: true
          });
        }
        
        // Add directories first
        Array.from(directories.entries()).forEach(([dirName, fullPath]) => {
          dirContents.push({
            name: dirName,
            path: fullPath,
            size: 0,
            dir: true
          });
        });
        
        // Then add files (including hidden files)
        Object.keys(contents.files)
          .filter(filename => 
            filename.startsWith(path) && 
            filename !== path && 
            !filename.slice(path.length).includes('/')
          )
          .forEach(filename => {
            dirContents.push({
              name: filename.slice(path.length),
              path: filename,
              size: contents.files[filename].uncompressedSize,
              dir: filename.endsWith('/')
            });
          });
        
        setZipContents(dirContents);
        setCurrentZipPath(path);
        setZipFileContent(null);
        setZipFileType(null);
      } else {
        // It's a file, extract and display its content
        const file = contents.files[path];
        if (!file) {
          toast.error('File not found in ZIP');
          return;
        }
        
        const fileData = await file.async('blob');
        const fileUrl = URL.createObjectURL(fileData);
        const fileType = getFileType(path);
        
        setZipFileContent(fileUrl);
        setZipFileType(fileType);
        setCurrentZipPath(path);
      }
    } catch (error) {
      console.error('Failed to navigate ZIP contents:', error);
      toast.error('Failed to read ZIP file');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!resource) return;
    
    setIsLoading(true);
    try {
      const blob = await resourcesAPI.downloadResource(resource.id.toString());
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      // If it's a ZIP file, extract contents
      if (resource.file_name.toLowerCase().endsWith('.zip')) {
        await extractZipContents(blob);
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };
  
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
    const fileName = resource.file_name.toLowerCase();
    
    if (type === 'document' || fileName.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i)) {
      return <FileText className="h-16 w-16 text-blue-500" />;
    } else if (type === 'video' || fileName.match(/\.(mp4|webm|avi|mov|wmv)$/i)) {
      return <Video className="h-16 w-16 text-red-500" />;
    } else if (type === 'code' || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go)$/i)) {
      return <Code className="h-16 w-16 text-green-500" />;
    } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return <ImageIcon className="h-16 w-16 text-purple-500" />;
    } else if (fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) {
      return <Archive className="h-16 w-16 text-amber-500" />;
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
        </DialogHeader>
        
        {/* Preview Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : previewUrl ? (
          <>
            <div className="border rounded-md overflow-hidden mb-4">
              {(() => {
                const fileName = resource.file_name.toLowerCase();
                
                // Handle code files
                if (fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|json|xml|yaml|yml|md|sql)$/i)) {
                  return <CodePreview url={previewUrl} fileName={fileName} />;
                }
                
                // Handle Office documents
                if (fileName.match(/\.(xlsx|xls|docx|doc|pptx|ppt)$/i)) {
                  return <OfficePreview url={previewUrl} fileName={fileName} />;
                }
                
                // Handle video files
                if (resource.type.toLowerCase() === 'video' || fileName.match(/\.(mp4|webm|avi|mov|wmv)$/i)) {
                  return (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="w-full max-h-[400px]"
                    />
                  );
                }
                
                // Handle image files
                if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                  return (
                    <img 
                      src={previewUrl} 
                      alt={resource.title} 
                      className="w-full max-h-[400px] object-contain"
                    />
                  );
                }
                
                // Handle PDF files
                if (fileName.match(/\.(pdf)$/i)) {
                  return (
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-[800px]" 
                      title={resource.title}
                    />
                  );
                }
                
                // Default fallback
                return (
                  <div className="p-4 text-center">
                    <p>Preview not available for this file type</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => window.open(previewUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </Button>
                  </div>
                );
              })()}
            </div>
            
            {/* ZIP Contents Section */}
            {resource.file_name.match(/\.zip$/i) && (
              <div className="border rounded-md p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">ZIP Contents</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (zipFileContent) {
                        // If viewing a file, go back to the current directory
                        setZipFileContent(null);
                        setZipFileType(null);
                      } else {
                        // Go to root directly
                        navigateZipContents('');
                      }
                    }}
                  >
                    Root
                  </Button>
                </div>
                
                {isExtractingZip || isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : zipFileContent ? (
                  <div className="max-h-[600px] overflow-auto">
                    {zipFileType === 'image' && (
                      <img src={zipFileContent} alt={currentZipPath} className="max-w-full" />
                    )}
                    {zipFileType === 'video' && (
                      <video src={zipFileContent} controls className="max-w-full" />
                    )}
                    {zipFileType === 'pdf' && (
                      <div className="pdf-container w-full h-[600px]">
                        <object
                          data={zipFileContent}
                          type="application/pdf"
                          width="100%"
                          height="100%"
                        >
                          <p>Your browser doesn't support PDF viewing. 
                            <a href={zipFileContent} target="_blank" rel="noopener noreferrer">Download PDF</a>
                          </p>
                        </object>
                      </div>
                    )}
                    {zipFileType === 'code' && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded overflow-auto">
                        <pre className="text-sm">
                          <TextPreview url={zipFileContent} />
                        </pre>
                      </div>
                    )}
                    {zipFileType === 'office' && (
                      <div className="p-0">
                        <iframe 
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + zipFileContent)}`}
                          className="w-full h-[600px] border-0" 
                          title={currentZipPath}
                        />
                      </div>
                    )}
                    {zipFileType === 'other' && (
                      <div className="p-0">
                        <iframe 
                          src={zipFileContent} 
                          className="w-full h-[600px] border-0" 
                          title={currentZipPath}
                        />
                      </div>
                    )}
                  </div>
                ) : zipContents.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2">Name</th>
                          <th className="text-right py-2">Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zipContents.map((file, index) => (
                          <tr 
                            key={index} 
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigateZipContents(file.path)}
                          >
                            <td className="py-2 flex items-center">
                              {file.dir ? (
                                <Folder className="h-4 w-4 mr-2 text-blue-500" />
                              ) : (
                                <File className="h-4 w-4 mr-2 text-gray-500" />
                              )}
                              {file.name}
                            </td>
                            <td className="text-right py-2">{file.dir ? '-' : formatFileSize(file.size)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No files found in ZIP archive</p>
                )}
              </div>
            )}
          </>
        ) : null}
        
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