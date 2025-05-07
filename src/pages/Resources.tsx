import React from 'react';
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
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const Resources: React.FC = () => {
  const { user } = useAuth();
  
  // Mock resources data
  const resources = [
    {
      id: 1,
      title: 'Introduction to React.js',
      description: 'Learn the fundamentals of React.js with practical examples',
      type: 'document',
      format: 'pdf',
      author: 'Prof. Ahmed',
      date: '2023-10-15',
      downloads: 128,
      tags: ['Web Development', 'Frontend', 'JavaScript']
    },
    {
      id: 2,
      title: 'Database Design Principles',
      description: 'A comprehensive guide to designing efficient database schemas',
      type: 'document',
      format: 'pdf',
      author: 'Prof. Sara',
      date: '2023-10-10',
      downloads: 94,
      tags: ['Database', 'SQL', 'Design Patterns']
    },
    {
      id: 3,
      title: 'Algorithms and Data Structures',
      description: 'Video lecture on advanced algorithms and data structures',
      type: 'video',
      format: 'mp4',
      author: 'Prof. Karim',
      date: '2023-09-28',
      downloads: 76,
      tags: ['Algorithms', 'Programming', 'Computer Science']
    },
    {
      id: 4,
      title: 'Machine Learning Basics',
      description: 'Introduction to machine learning concepts and applications',
      type: 'document',
      format: 'pdf',
      author: 'Prof. Lina',
      date: '2023-09-20',
      downloads: 112,
      tags: ['AI', 'Machine Learning', 'Data Science']
    },
    {
      id: 5,
      title: 'Web Development Project',
      description: 'Example code for a full-stack web development project',
      type: 'code',
      format: 'zip',
      author: 'Prof. Ahmed',
      date: '2023-09-15',
      downloads: 87,
      tags: ['Web Development', 'Project', 'Full Stack']
    },
  ];
  
  const getIconForResource = (type: string) => {
    switch(type) {
      case 'document':
        return <FileText className="h-10 w-10 text-primary" />;
      case 'video':
        return <Video className="h-10 w-10 text-accent" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'code':
        return <FileCode className="h-10 w-10 text-orange-500" />;
      default:
        return <FileText className="h-10 w-10 text-primary" />;
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">
              Browse and access learning materials
            </p>
          </div>
          
          {user?.role === 'teacher' && (
            <Button className="bg-primary hover:bg-primary-dark">
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
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-start gap-4">
                      {getIconForResource(resource.type)}
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
                        <span>By {resource.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(resource.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        <span>{resource.downloads}</span>
                      </div>
                    </div>
                    <div className="p-3 flex space-x-2">
                      <Button className="w-full text-xs h-8">
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
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.filter(r => r.type === 'document').map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardContent className="p-0">
                    <div className="p-4 flex items-start gap-4">
                      {getIconForResource(resource.type)}
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
                        <span>By {resource.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(resource.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        <span>{resource.downloads}</span>
                      </div>
                    </div>
                    <div className="p-3 flex space-x-2">
                      <Button className="w-full text-xs h-8">
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
          </TabsContent>
          
          {/* Other tabs would have similar content */}
          <TabsContent value="videos" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Video resources will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Code resources will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your saved resources will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Resources;
