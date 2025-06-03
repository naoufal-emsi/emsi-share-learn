import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, AlertCircle } from 'lucide-react';
import { resourcesAPI } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  file_name: string;
  file_size: number;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
}

const MyPendingResourcesPanel: React.FC = () => {
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [rejectedResources, setRejectedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const [pendingResponse, rejectedResponse] = await Promise.all([
        resourcesAPI.getResources({ status: 'my-pending' }),
        resourcesAPI.getResources({ status: 'my-rejected' })
      ]);
      
      setPendingResources(pendingResponse.results);
      setRejectedResources(rejectedResponse.results);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <Badge variant="outline">PDF</Badge>;
      case 'video':
        return <Badge variant="outline">Video</Badge>;
      case 'image':
        return <Badge variant="outline">Image</Badge>;
      case 'doc':
        return <Badge variant="outline">Document</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Resources Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Resources</h2>
        
        {pendingResources.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No pending resources</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingResources.map(resource => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">{resource.title}</CardTitle>
                    {getFileTypeIcon(resource.type)}
                  </div>
                  <CardDescription>
                    Submitted on {format(new Date(resource.uploaded_at), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {resource.description || 'No description provided'}
                  </p>
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span className="truncate">{resource.file_name}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-amber-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Awaiting approval</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Rejected Resources Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Rejected Resources</h2>
        
        {rejectedResources.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No rejected resources</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedResources.map(resource => (
              <Card key={resource.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">{resource.title}</CardTitle>
                    {getFileTypeIcon(resource.type)}
                  </div>
                  <CardDescription>
                    Submitted on {format(new Date(resource.uploaded_at), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-3 rounded-md mb-3">
                    <div className="flex items-center text-red-600 font-medium mb-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Rejection Reason:</span>
                    </div>
                    <p className="text-sm text-red-600">
                      {resource.rejection_reason || 'No reason provided'}
                    </p>
                  </div>
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span className="truncate">{resource.file_name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPendingResourcesPanel;