import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ForumTopicList from '@/components/forum/ForumTopicList';
import NewTopicDialog from '@/components/forum/NewTopicDialog';
import TopicDetail from '@/components/forum/TopicDetail';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/forum/SearchFilters';
import { forumsAPI } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import './forum-styles.css';

const Forum: React.FC = () => {
  const { user } = useAuth();
  const { topicId } = useParams<{ topicId?: string }>();
  const [activeTab, setActiveTab] = useState('all');
  const [isNewTopicDialogOpen, setIsNewTopicDialogOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    searchText: '',
    tags: [],
    isResolved: null,
    createdAfter: null,
    createdBefore: null,
    categoryId: null,
  });

  // Fetch categories for filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await forumsAPI.getCategories();
        setCategories(response.results || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Show error toast
        toast?.error('Failed to load forum categories. Please try refreshing the page.');
      }
    };
    
    fetchCategories();
  }, []);

  // Handle search and filter changes
  const handleSearch = (filters: SearchFiltersType) => {
    setSearchFilters(filters);
    
    // If filters indicate a specific resolution status, switch to the appropriate tab
    if (filters.isResolved === true) {
      setActiveTab('resolved');
    } else if (filters.isResolved === false) {
      setActiveTab('unresolved');
    } else if (filters.searchText || filters.tags.length > 0 || 
               filters.createdAfter || filters.createdBefore || 
               filters.categoryId) {
      setActiveTab('all');
    }
  };

  // If we have a topicId, show the topic detail view
  if (topicId) {
    return (
      <MainLayout>
        <TopicDetail />
      </MainLayout>
    );
  }

  // Convert search filters to API parameters
  const getApiParams = () => {
    const params: any = {};
    
    if (searchFilters.searchText) {
      params.search = searchFilters.searchText;
    }
    
    if (searchFilters.tags.length > 0) {
      params.tags = searchFilters.tags.join(',');
    }
    
    if (searchFilters.categoryId) {
      params.category = searchFilters.categoryId;
    }
    
    if (searchFilters.createdAfter) {
      params.created_after = format(searchFilters.createdAfter, 'yyyy-MM-dd');
    }
    
    if (searchFilters.createdBefore) {
      params.created_before = format(searchFilters.createdBefore, 'yyyy-MM-dd');
    }
    
    return params;
  };

  // Otherwise show the forum listing
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
            <p className="text-muted-foreground">
              Discuss and share knowledge with fellow students and teachers
            </p>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => setIsNewTopicDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchFilters onSearch={handleSearch} categories={categories} />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Discussions</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="my">My Discussions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ForumTopicList 
              filter="all" 
              userId={user?.id} 
              searchText={searchFilters.searchText}
              categoryId={searchFilters.categoryId || undefined}
              apiParams={getApiParams()}
            />
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-0">
            <ForumTopicList 
              filter="resolved" 
              userId={user?.id}
              searchText={searchFilters.searchText}
              categoryId={searchFilters.categoryId || undefined}
              apiParams={{...getApiParams(), is_solved: true}}
            />
          </TabsContent>
          
          <TabsContent value="unresolved" className="mt-0">
            <ForumTopicList 
              filter="unresolved" 
              userId={user?.id}
              searchText={searchFilters.searchText}
              categoryId={searchFilters.categoryId || undefined}
              apiParams={{...getApiParams(), is_solved: false}}
            />
          </TabsContent>
          
          <TabsContent value="my" className="mt-0">
            {user ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing discussions created by you (User ID: {user.id})
                </div>
                <ForumTopicList 
                  filter="my" 
                  userId={user.id}
                  searchText={searchFilters.searchText}
                  categoryId={searchFilters.categoryId || undefined}
                  apiParams={getApiParams()}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please log in to see your discussions.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <NewTopicDialog 
        open={isNewTopicDialogOpen} 
        onOpenChange={setIsNewTopicDialogOpen} 
      />
    </MainLayout>
  );
};

export default Forum;