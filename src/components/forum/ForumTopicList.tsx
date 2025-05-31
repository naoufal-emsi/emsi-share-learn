import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  MessageCircle,
  Eye,
  Tag,
  AlertCircle
} from 'lucide-react';
import { forumsAPI } from '@/services/api';
import HighlightedText from './HighlightedText';
import { toast } from 'sonner';

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    profile_picture_data?: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  tags: string;
  view_count: number;
  posts_count?: number;
  votes_count?: number;
  created_at: string;
  is_announcement: boolean;
  is_solved: boolean;
}

interface ForumTopicListProps {
  filter?: 'all' | 'resolved' | 'unresolved' | 'my';
  categoryId?: string;
  roomId?: string;
  userId?: number | string;
  searchText?: string;
  apiParams?: Record<string, any>;
}

const ForumTopicList: React.FC<ForumTopicListProps> = ({ 
  filter = 'all', 
  categoryId,
  roomId,
  userId,
  searchText = '',
  apiParams = {}
}) => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {
          ...apiParams
        };
        
        if (categoryId && !params.category) {
          params.category = categoryId;
        }
        
        if (roomId) {
          params.room = roomId;
        }
        
        // For "my" filter, we'll use the API to filter by user ID if possible
        if (filter === 'my' && userId && !params.created_by) {
          params.created_by = userId;
        }
        
        console.log("Fetching topics with params:", params);
        const response = await forumsAPI.getTopics(params);
        console.log("Raw API response:", response);
        
        // Get topics from the response
        const filteredTopics = response.results || [];
        
        console.log("Filtered topics:", filteredTopics);
        setTopics(filteredTopics);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setTopics([]);
        setError('Failed to load topics from the database. Please try again later.');
        toast.error('Failed to load forum topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [filter, categoryId, roomId, userId, searchText, apiParams]);

  const handleTopicClick = (topicId: number) => {
    navigate(`/forum/${topicId}`);
  };

  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="text-center py-8">Loading topics...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No topics found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map(topic => (
        <Card 
          key={topic.id} 
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleTopicClick(topic.id)}
        >
          <CardContent className="p-0 flex flex-col md:flex-row">
            <div className="p-4 md:p-6 flex-1">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={topic.created_by.profile_picture_data || topic.created_by.avatar} alt={topic.created_by.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {topic.created_by.first_name?.[0] || topic.created_by.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    {searchText ? (
                      <HighlightedText text={topic.title} highlight={searchText} />
                    ) : (
                      topic.title
                    )}
                    {topic.is_solved && (
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                    )}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span>{topic.created_by.first_name} {topic.created_by.last_name}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <Badge variant="secondary" className="text-xs">{topic.category.name}</Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {searchText ? (
                  <HighlightedText text={topic.content} highlight={searchText} maxLength={200} />
                ) : (
                  topic.content
                )}
              </p>
              
              {topic.tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {topic.tags.split(',').map((tag, index) => (
                    <div key={index} className="flex items-center text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-muted p-4 md:p-6 md:w-48 flex md:flex-col justify-between md:border-l">
              <div className="flex items-center md:mb-4">
                <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm">{topic.view_count} views</span>
              </div>
              <div className="flex items-center md:mb-4">
                <MessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm">{topic.posts_count || 0} replies</span>
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm">{topic.votes_count || 0} likes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ForumTopicList;