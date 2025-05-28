import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Video, 
  FileSpreadsheet, 
  FileCode, 
  Search, 
  Filter,
  Download,
  ExternalLink,
  Upload,
  Loader2 // Added for loading state
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resourcesAPI } from '@/services/api'; // Import the API service
import { toast } from 'sonner'; // For error notifications
import AddResourceDialog from '@/components/rooms/AddResourceDialog'; // Import the dialog

// Define an interface for the author's profile
interface AuthorProfile {
  firstname: string;
  lastname: string;
  // Consider adding other relevant fields like id, username if available from API
}

// Define an interface for the resource structure
interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  format: string;
  author: AuthorProfile;
  date: string;
  downloads: number;
  tags?: string[]; // Make tags optional
  file_url?: string;
}

const Resources: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
  
  const fetchResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await resourcesAPI.getResources('');
      
      // Normalize the response
      const results = Array.isArray(fetchedResources) 
        ? fetchedResources 
        : fetchedResources?.results || [];
  
      // Ensure all resources have tags array
      setResources(results.map(res => ({
        ...res,
        tags: res.tags || []
      })));
  
      setError(null);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources. Please try again.');
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);
  
  const handleResourceUploaded = (newResource: Resource) => {
    // Option 1: Refetch all resources
    fetchResources(); 
    // Option 2: Add to existing list (if backend returns the new resource)
    // setResources(prevResources => [newResource, ...prevResources]);
    setIsUploadModalOpen(false); // Close the modal
    toast.success('Resource uploaded successfully!');
  };

  const getIconForResource = (type: string) => {
    switch(type) {
      case 'document':
      case 'pdf': // Adding pdf as a type for icon mapping
        return <FileText className="h-10 w-10 text-primary" />;
      case 'video':
      case 'mp4': // Adding mp4
        return <Video className="h-10 w-10 text-accent" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'code':
      case 'zip': // Adding zip
        return <FileCode className="h-10 w-10 text-orange-500" />;
      default:
        return <FileText className="h-10 w-10 text-primary" />;
    }
  };

  const handleUploadResourceClick = () => {
    setIsUploadModalOpen(true);
  };
  
  const handleUpload = async (formData: FormData) => {
    try {
      await resourcesAPI.uploadResource(formData);
      fetchResources(); // Refresh list
      toast.success('Upload successful!');
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload error:', error);
    }
  };

  return (
    <MainLayout>
      <AddResourceDialog
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUpload}
        onResourceAdded={handleResourceUploaded}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">
              Browse and access learning materials
            </p>
          </div>
          
          {user?.role === 'teacher' && (
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={handleUploadResourceClick} 
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-9" />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            {user?.role === 'student' && (
              <TabsTrigger value="saved">Saved</TabsTrigger>
            )}
          </TabsList>
          
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading resources...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
            </div>
          )}

          {!loading && !error && (
            <>
              <TabsContent value="all" className="mt-0">
                {resources.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No resources found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4 flex items-start gap-4">
                            {getIconForResource(resource.type.toLowerCase())} {/* Use type or format for icon */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-base truncate">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {resource.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {resource.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {resource.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{resource.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <span>By {resource.author ? `${resource.author.firstname} ${resource.author.lastname}` : 'Unknown Author'}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(resource.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              <span>{resource.downloads}</span>
                            </div>
                          </div>
                          <div className="p-3 flex space-x-2">
                            <Button 
                              className="w-full text-xs h-8"
                              onClick={() => { 
                                if (resource.file_url) window.open(resource.file_url, '_blank');
                                // else, you might need a download function similar to the one in RoomDetails or Quiz page
                                else toast.error('No download link available.');
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Implement similar logic for other TabsContent sections (documents, videos, code) */}
              {/* Filter resources based on type for each tab */}
              <TabsContent value="documents" className="mt-0">
                 {resources.filter(r => (r.type && r.type.toLowerCase() === 'document') || (r.format && r.format.toLowerCase() === 'pdf')).length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No documents found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resources.filter(r => (r.type && r.type.toLowerCase() === 'document') || (r.format && r.format.toLowerCase() === 'pdf')).map((resource) => (
                        // ... Same card structure as above ...
                        <Card key={resource.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 flex items-start gap-4">
                              {getIconForResource(resource.type.toLowerCase())}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-base truncate">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resource.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {resource.tags && resource.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{resource.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <span>By {resource.author ? `${resource.author.firstname} ${resource.author.lastname}` : 'Unknown Author'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(resource.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                <span>{resource.downloads}</span>
                              </div>
                            </div>
                            <div className="p-3 flex space-x-2">
                              <Button 
                                className="w-full text-xs h-8"
                                onClick={() => { 
                                  if (resource.file_url) window.open(resource.file_url, '_blank');
                                  else toast.error('No download link available.');
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
              </TabsContent>
              
              <TabsContent value="videos" className="mt-0">
                {resources.filter(r => r.type.toLowerCase() === 'video').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No videos found.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.filter(r => r.type.toLowerCase() === 'video').map((resource) => (
                      // ... Same card structure as above ...
                       <Card key={resource.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 flex items-start gap-4">
                              {getIconForResource(resource.type.toLowerCase())}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-base truncate">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resource.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {resource.tags && resource.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{resource.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <span>By {resource.author ? `${resource.author.firstname} ${resource.author.lastname}` : 'Unknown Author'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(resource.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                <span>{resource.downloads}</span>
                              </div>
                            </div>
                            <div className="p-3 flex space-x-2">
                              <Button 
                                className="w-full text-xs h-8"
                                onClick={() => { 
                                  if (resource.file_url) window.open(resource.file_url, '_blank');
                                  else toast.error('No download link available.');
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="code" className="mt-0">
                {resources.filter(r => r.type.toLowerCase() === 'code').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No code resources found.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.filter(r => r.type.toLowerCase() === 'code').map((resource) => (
                      // ... Same card structure as above ...
                       <Card key={resource.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 flex items-start gap-4">
                              {getIconForResource(resource.type.toLowerCase())}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-base truncate">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resource.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {resource.tags && resource.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{resource.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <span>By {resource.author ? `${resource.author.firstname} ${resource.author.lastname}` : 'Unknown Author'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(resource.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                <span>{resource.downloads}</span>
                              </div>
                            </div>
                            <div className="p-3 flex space-x-2">
                              <Button 
                                className="w-full text-xs h-8"
                                onClick={() => { 
                                  if (resource.file_url) window.open(resource.file_url, '_blank');
                                  else toast.error('No download link available.');
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="mt-0">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Your saved resources will be displayed here.</p>
                  {/* Implement saved resources functionality if needed */}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Resources;
