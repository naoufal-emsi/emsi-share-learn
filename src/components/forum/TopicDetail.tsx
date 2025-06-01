import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  ThumbsUp, 
  ThumbsDown,
  MessageCircle,
  Eye,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  Paperclip,
  Download,
  Search,
  X
} from 'lucide-react';
import RichTextEditor from '@/components/forum/RichTextEditor';
import FileUploader from '@/components/forum/FileUploader';
import { forumsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { renderMarkdown } from '@/lib/markdown';
import HighlightedText from './HighlightedText';

interface Post {
  id: number;
  content: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    profile_picture_data?: string;
  };
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  upvotes: number;
  downvotes: number;
  user_vote?: 'upvote' | 'downvote' | null;
  has_attachment?: boolean;
  attachment_name?: string;
  attachment_type?: string;
}

interface Topic {
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
  created_at: string;
  is_solved: boolean;
  status: string;
  has_attachment?: boolean;
  attachment_name?: string;
  attachment_type?: string;
}

const TopicDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search');
    if (query) {
      setSearchText(query);
    }
  }, [location]);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      if (!topicId) return;
      
      setLoading(true);
      try {
        // Increment view count
        await forumsAPI.incrementView(topicId);
        
        // Get topic details
        const topicData = await forumsAPI.getTopic(topicId);
        setTopic(topicData);
        
        // Get posts for this topic directly from database
        const postsData = await forumsAPI.getPosts(topicId, searchText);
        console.log('Posts loaded from database:', postsData);
        setPosts(postsData.results || []);
        
        // Check subscription status
        if (user) {
          const subscriptionStatus = await forumsAPI.getSubscriptionStatus(topicId);
          setIsSubscribed(subscriptionStatus.subscribed);
        }
      } catch (error) {
        console.error('Failed to fetch topic details:', error);
        toast.error('Failed to load topic details. Please try again later.');
        navigate('/forum', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [topicId, user, searchText, navigate]);

  const handleFileSelect = (file: File, base64Data: string) => {
    setSelectedFile({ file, base64: base64Data });
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !topic) {
      toast.error("Please enter a reply before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simple post data with just the required fields
      const postData = {
        topic: topic.id,
        content: newReply.trim(),
        attachment_base64: selectedFile?.base64 || null,
        attachment_name: selectedFile?.file.name || null,
        attachment_type: selectedFile?.file.type || null,
        attachment_size: selectedFile?.file.size || null
      };

      // Submit the post and wait for the response
      await forumsAPI.createPost(postData);
      
      // Reset form
      setNewReply('');
      setSelectedFile(null);
      
      // Wait a moment to ensure the post is saved in the database
      setTimeout(async () => {
        // Reload posts from database
        if (topicId) {
          try {
            const freshPosts = await forumsAPI.getPosts(topicId);
            setPosts(freshPosts.results || []);
          } catch (err) {
            console.error('Error refreshing posts:', err);
          }
        }
      }, 500);
      
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId: number, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Please log in to vote on posts");
      return;
    }
    
    try {
      const response = await forumsAPI.votePost(postId.toString(), voteType);
      
      // Update local state to reflect the vote
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const currentVote = post.user_vote;
          let upvotes = post.upvotes;
          let downvotes = post.downvotes;
          
          // Remove previous vote if exists
          if (currentVote === 'upvote') upvotes--;
          if (currentVote === 'downvote') downvotes--;
          
          // Add new vote if different from current
          if (currentVote !== voteType) {
            if (voteType === 'upvote') upvotes++;
            if (voteType === 'downvote') downvotes++;
            return { ...post, user_vote: voteType, upvotes, downvotes };
          } else {
            // Toggle off if same vote
            return { ...post, user_vote: null, upvotes, downvotes };
          }
        }
        return post;
      }));
      
      // Show success message based on action
      if (response && response.action) {
        if (response.action === 'added') {
          toast.success(`Post ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} successfully`);
        } else if (response.action === 'removed') {
          toast.success(`Vote removed`);
        } else if (response.action === 'changed') {
          toast.success(`Vote changed to ${voteType}`);
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error("Failed to register your vote. Please try again.");
    }
  };

  const handleToggleSolved = async (postId?: number) => {
    if (!topic) {
      toast.error("Topic information not available");
      return;
    }
    
    try {
      const response = await forumsAPI.toggleSolved(topic.id.toString(), postId?.toString());
      
      if (!response || response.status !== 'success') {
        throw new Error('Invalid response from server');
      }
      
      // Update topic solved status
      setTopic({
        ...topic,
        is_solved: !topic.is_solved
      });
      
      // Update post solution status if a post was marked
      if (postId) {
        setPosts(posts.map(post => ({
          ...post,
          is_solution: post.id === postId ? !post.is_solution : false
        })));
      }
      
      toast.success(topic.is_solved ? "Topic marked as unresolved" : "Topic marked as resolved");
    } catch (error) {
      console.error('Failed to toggle solved status:', error);
      toast.error("Failed to update topic status. Please check your connection and try again.");
    }
  };

  const handleToggleSubscription = async () => {
    if (!topic) {
      toast.error("Topic information not available");
      return;
    }
    
    if (!user) {
      toast.error("Please log in to subscribe to topics");
      return;
    }
    
    try {
      const response = await forumsAPI.subscribeTopic(topic.id.toString());
      
      if (!response || response.status !== 'success') {
        throw new Error('Invalid response from server');
      }
      
      const newSubscriptionStatus = response.subscribed;
      setIsSubscribed(newSubscriptionStatus);
      toast.success(isSubscribed ? "Unsubscribed from topic" : "Subscribed to topic");
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      toast.error("Failed to update subscription. Please check your connection and try again.");
    }
  };

  const handleDownloadAttachment = async (type: 'topic' | 'post', id: number) => {
    try {
      let blob;
      let filename;
      
      if (type === 'topic' && topic) {
        toast.info("Downloading topic attachment...");
        blob = await forumsAPI.downloadTopicAttachment(id.toString());
        filename = topic.attachment_name || `topic_${id}_attachment`;
      } else {
        const post = posts.find(p => p.id === id);
        if (!post) {
          toast.error("Post not found");
          return;
        }
        
        toast.info("Downloading post attachment...");
        blob = await forumsAPI.downloadPostAttachment(id.toString());
        filename = post.attachment_name || `post_${id}_attachment`;
      }
      
      if (!blob) {
        throw new Error('No attachment data received');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Attachment downloaded successfully");
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error("Failed to download attachment. Please check your connection and try again.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Update URL with search parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchText) {
      searchParams.set('search', searchText);
    } else {
      searchParams.delete('search');
    }
    
    navigate(`/forum/${topicId}?${searchParams.toString()}`, { replace: true });
  };

  const clearSearch = () => {
    setSearchText('');
    setIsSearching(false);
    navigate(`/forum/${topicId}`, { replace: true });
  };

  // Check if the current user is the topic creator
  const isTopicCreator = user && topic && user.id && 
    topic.created_by && user.id.toString() === topic.created_by.id.toString();

  if (loading) {
    return <div className="text-center py-8">Loading topic details...</div>;
  }

  if (!topic) {
    return <div className="text-center py-8">Topic not found</div>;
  }

  // Function to render content with highlighted search terms
  const renderContent = (content: string) => {
    // Ensure content is a string
    if (typeof content !== 'string') {
      console.error('Invalid content type:', typeof content, content);
      return <div>Error displaying content</div>;
    }
    
    if (searchText) {
      return <HighlightedText text={content} highlight={searchText} />;
    }
    
    return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => navigate('/forum')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in this topic..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {searchText ? (
                  <HighlightedText text={topic.title} highlight={searchText} />
                ) : (
                  topic.title
                )}
                {topic.is_solved && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">Resolved</Badge>
                )}
              </CardTitle>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Badge variant="secondary" className="text-xs">{topic.category.name}</Badge>
                <span className="mx-1">•</span>
                <Eye className="h-3 w-3 mr-1" />
                <span>{topic.view_count} views</span>
                <span className="mx-1">•</span>
                <span>{new Date(topic.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isTopicCreator && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleSolved()}
                  className={topic.is_solved ? "" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {topic.is_solved ? 'Unresolved' : 'Resolved'}
                </Button>
              )}
              {user && (
                <Button 
                  variant={isSubscribed ? "default" : "outline"} 
                  size="sm"
                  onClick={handleToggleSubscription}
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Original post */}
          <div className="border rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={topic.created_by.profile_picture_data || topic.created_by.avatar} alt={topic.created_by.username} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {topic.created_by.first_name?.[0] || topic.created_by.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{topic.created_by.first_name} {topic.created_by.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(topic.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 prose max-w-none prose-sm">
                  {renderContent(topic.content)}
                </div>
                
                {topic.has_attachment && (
                  <div className="mt-3 border border-dashed rounded-md p-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{topic.attachment_name || 'Attachment'}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadAttachment('topic', topic.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
                
                {topic.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {topic.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs py-0">{tag.trim()}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Replies */}
          <div className="space-y-2">
            <h3 className="text-base font-medium">
              Replies ({posts.length})
            </h3>
            
            {posts.length === 0 ? (
              <p className="text-muted-foreground">
                {searchText ? "No replies match your search." : "No replies yet. Be the first to reply!"}
              </p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className={`border rounded-lg p-3 ${post.is_solution ? 'border-green-500 bg-green-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.created_by.profile_picture_data || post.created_by.avatar} alt={post.created_by.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {post.created_by.first_name?.[0] || post.created_by.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{post.created_by.first_name} {post.created_by.last_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleString()}
                            {post.is_edited && <span className="ml-1">(edited)</span>}
                          </p>
                        </div>
                        {post.is_solution && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs py-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Solution
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 prose max-w-none prose-sm">
                        {typeof post.content === 'string' ? renderContent(post.content) : 'Loading...'}
                      </div>
                      
                      {post.has_attachment && (
                        <div className="mt-2 border border-dashed rounded-md p-2 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{post.attachment_name || 'Attachment'}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDownloadAttachment('post', post.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleVote(post.id, 'upvote')}
                            className={`h-7 px-2 ${post.user_vote === 'upvote' ? 'text-green-600' : ''}`}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {post.upvotes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleVote(post.id, 'downvote')}
                            className={`h-7 px-2 ${post.user_vote === 'downvote' ? 'text-red-600' : ''}`}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {post.downvotes}
                          </Button>
                        </div>
                        
                        {isTopicCreator && !topic.is_solved && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleSolved(post.id)}
                            className="h-7 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Solution
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Reply form */}
          {user && !isSearching && (
            <form onSubmit={handleReplySubmit} className="space-y-3 border-t pt-3 mt-2">
              <h3 className="text-base font-medium">Your Reply</h3>
              <RichTextEditor
                value={newReply}
                onChange={setNewReply}
                placeholder="Write your reply here..."
                minHeight="120px"
              />
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Attachment (optional)</label>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  maxSizeMB={10}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </form>
          )}
          
          {/* Search mode message */}
          {isSearching && (
            <div className="border-t pt-3 mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                You're viewing search results for "{searchText}".
              </p>
              <Button variant="outline" size="sm" onClick={clearSearch} className="mt-2">
                Clear Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicDetail;