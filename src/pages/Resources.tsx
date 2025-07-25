import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { resourcesAPI } from '@/services/api';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceUploadDialog from '@/components/resources/ResourceUploadDialog';
import ResourceDetailDialog from '@/components/resources/ResourceDetailDialog';
import ResourceSearchFilters, { ResourceFilters } from '@/components/resources/ResourceSearchFilters';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MyPendingResourcesSection from '../components/resources/MyPendingResourcesSection';

interface Resource {
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
  };
  category: number | null;
  category_name: string | null;
}

const Resources: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchFilters, setSearchFilters] = useState<ResourceFilters>({
    searchText: '',
    type: null,
    categoryId: null,
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPendingResources, setShowPendingResources] = useState(false); // Add state variable

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      // Apply filters
      if (searchFilters.searchText) {
        params.search = searchFilters.searchText;
      }
      
      if (searchFilters.categoryId) {
        params.category = searchFilters.categoryId;
      }
      
      // Apply type filter from either tab or search filters
      if (activeTab !== 'all' && activeTab !== 'other') {
        params.type = activeTab;
      } else if (searchFilters.type) {
        params.type = searchFilters.type;
      }
      
      // Only show approved resources in the main view
      params.status = 'approved';
      
      const response = await resourcesAPI.getResources(params);
      setResources(response.results);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeTab, searchFilters]);

  // Handle resource ID from URL parameter (from notifications)
  useEffect(() => {
    const resourceId = searchParams.get('resourceId');
    if (resourceId && resources.length > 0) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        setSelectedResource(resource);
        setIsDetailDialogOpen(true);
        // Remove the parameter from URL
        setSearchParams({});
      }
    }
  }, [resources, searchParams, setSearchParams]);

  const handleSearch = (filters: ResourceFilters) => {
    setSearchFilters(filters);
    
    // If a type filter is selected, switch to the appropriate tab
    if (filters.type) {
      setActiveTab(filters.type);
    }
  };

  const handleResourceClick = (resource: Resource) => {
    console.log('Resource clicked:', resource);
    setSelectedResource(resource);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await resourcesAPI.deleteResource(resourceId);
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">Access and share learning materials</p>
          </div>
          <div className="flex gap-2">
            {(user?.role === 'student' || user?.role === 'admin' || user?.role === 'administration') && (
              <Button
                variant="outline"
                onClick={() => setShowPendingResources(!showPendingResources)}
              >
                {showPendingResources ? 'All Resources' : user?.role === 'student' ? 'My Pending Resources' : 'Pending Resources'}
              </Button>
            )}
            <Button
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>
        <ResourceSearchFilters onSearch={handleSearch} />
        {showPendingResources ? (
          <MyPendingResourcesSection />
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              {renderResourceList(resources, loading, handleResourceClick, handleDeleteResource, user?.id)}
            </TabsContent>
            <TabsContent value="document" className="mt-0">
              {renderResourceList(
                resources.filter(r =>
                  r.type === 'document' ||
                  r.type === 'pdf' ||
                  r.type === 'doc' ||
                  r.type === 'ppt' ||
                  r.type === 'excel'
                ),
                loading,
                handleResourceClick,
                handleDeleteResource,
                user?.id
              )}
            </TabsContent>
            <TabsContent value="video" className="mt-0">
              {renderResourceList(resources.filter(r => r.type === 'video'), loading, handleResourceClick, handleDeleteResource, user?.id)}
            </TabsContent>
            <TabsContent value="code" className="mt-0">
              {renderResourceList(resources.filter(r => r.type === 'code'), loading, handleResourceClick, handleDeleteResource, user?.id)}
            </TabsContent>
            <TabsContent value="other" className="mt-0">
              {renderResourceList(
                resources.filter(r =>
                  r.type !== 'document' &&
                  r.type !== 'pdf' &&
                  r.type !== 'doc' &&
                  r.type !== 'ppt' &&
                  r.type !== 'excel' &&
                  r.type !== 'video' &&
                  r.type !== 'code'
                ),
                loading,
                handleResourceClick,
                handleDeleteResource,
                user?.id
              )}
            </TabsContent>
          </Tabs>
        )}
        <ResourceUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onSuccess={fetchResources}
        />
        <ResourceDetailDialog
          resource={selectedResource as Resource & { bookmark_count: number }}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          onDelete={handleDeleteResource}
        />
      </div>
    </MainLayout>
  );
};

export default Resources;

function renderResourceList(
  resources: Resource[],
  loading: boolean,
  onResourceClick: (resource: Resource) => void,
  onDeleteResource: (resourceId: string) => void,
  currentUserId?: string
) {
  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }
  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No resources found.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map(resource => {
        console.log('resource.uploaded_by.id:', resource.uploaded_by.id, typeof resource.uploaded_by.id);
        console.log('currentUserId:', currentUserId, typeof currentUserId);
        console.log('Equal:', resource.uploaded_by.id === currentUserId);
        return (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={() => onResourceClick(resource)}
            onDelete={resource.uploaded_by.id.toString() === currentUserId?.toString() ? () => onDeleteResource(resource.id) : undefined}
            showDeleteButton={resource.uploaded_by.id.toString() === currentUserId?.toString()}
          />
        );
      })}
    </div>
  );
}