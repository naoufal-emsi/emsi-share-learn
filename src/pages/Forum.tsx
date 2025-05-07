import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  PlusCircle, 
  ThumbsUp, 
  MessageCircle,
  Eye,
  Clock,
  Bookmark,
  Tag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Forum: React.FC = () => {
  const { user } = useAuth();
  
  // Mock forum threads data
  const forumThreads = [
    {
      id: 1,
      title: 'How to optimize database queries in a React application?',
      content: 'I\'m working on a project and need to optimize my database queries. Any suggestions on best practices?',
      author: {
        name: 'Mohammed A.',
        avatar: 'https://ui-avatars.com/api/?name=MA&background=random',
        role: 'student'
      },
      category: 'Databases',
      tags: ['React', 'Database', 'Optimization'],
      views: 156,
      replies: 8,
      likes: 12,
      createdAt: '2023-11-10T10:30:00',
      isHot: true,
      isResolved: false
    },
    {
      id: 2,
      title: 'Implementing authentication in a MERN stack application',
      content: 'What is the best way to implement secure authentication in a MERN stack application?',
      author: {
        name: 'Fatima L.',
        avatar: 'https://ui-avatars.com/api/?name=FL&background=random',
        role: 'student'
      },
      category: 'Web Development',
      tags: ['MERN', 'Authentication', 'Security'],
      views: 98,
      replies: 5,
      likes: 7,
      createdAt: '2023-11-09T14:45:00',
      isHot: false,
      isResolved: true
    },
    {
      id: 3,
      title: 'Resources for learning machine learning algorithms',
      content: 'Can anyone recommend good resources for learning machine learning algorithms from scratch?',
      author: {
        name: 'Ahmed H.',
        avatar: 'https://ui-avatars.com/api/?name=AH&background=random',
        role: 'student'
      },
      category: 'Machine Learning',
      tags: ['ML', 'Resources', 'Algorithms'],
      views: 132,
      replies: 10,
      likes: 18,
      createdAt: '2023-11-07T09:15:00',
      isHot: true,
      isResolved: false
    },
    {
      id: 4,
      title: 'Career paths in software engineering',
      content: 'What are the different career paths available in software engineering after graduation?',
      author: {
        name: 'Lina R.',
        avatar: 'https://ui-avatars.com/api/?name=LR&background=random',
        role: 'student'
      },
      category: 'Career',
      tags: ['Career', 'Software Engineering', 'Jobs'],
      views: 210,
      replies: 15,
      likes: 24,
      createdAt: '2023-11-05T16:20:00',
      isHot: true,
      isResolved: true
    },
    {
      id: 5,
      title: 'Understanding Big O notation in algorithms',
      content: 'I\'m having trouble understanding Big O notation. Can someone explain it in simple terms?',
      author: {
        name: 'Karim M.',
        avatar: 'https://ui-avatars.com/api/?name=KM&background=random',
        role: 'student'
      },
      category: 'Algorithms',
      tags: ['Algorithms', 'Big O', 'Complexity'],
      views: 87,
      replies: 6,
      likes: 9,
      createdAt: '2023-11-04T11:10:00',
      isHot: false,
      isResolved: false
    }
  ];
  
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
          
          <Button className="bg-primary hover:bg-primary-dark">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search discussions..." className="pl-9" />
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Discussions</TabsTrigger>
            <TabsTrigger value="hot">Hot Topics</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="my">My Discussions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 space-y-4">
            {forumThreads.map(thread => (
              <Card key={thread.id} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="p-4 md:p-6 flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                        <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">
                          {thread.title}
                          {thread.isHot && (
                            <Badge variant="destructive" className="ml-2 text-xs">Hot</Badge>
                          )}
                          {thread.isResolved && (
                            <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                          )}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>{thread.author.name}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <Badge variant="secondary" className="text-xs">{thread.category}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {thread.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {thread.tags.map((tag, index) => (
                        <div key={index} className="flex items-center text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 md:p-6 md:w-48 flex md:flex-col justify-between md:border-l">
                    <div className="flex items-center md:mb-4">
                      <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{thread.views} views</span>
                    </div>
                    <div className="flex items-center md:mb-4">
                      <MessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{thread.replies} replies</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{thread.likes} likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Other tabs would have similar content */}
          <TabsContent value="hot" className="mt-0">
            <div className="space-y-4">
              {forumThreads.filter(thread => thread.isHot).map(thread => (
                <Card key={thread.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                          <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">
                            {thread.title}
                            {thread.isHot && (
                              <Badge variant="destructive" className="ml-2 text-xs">Hot</Badge>
                            )}
                            {thread.isResolved && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span>{thread.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <Badge variant="secondary" className="text-xs">{thread.category}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {thread.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {thread.tags.map((tag, index) => (
                          <div key={index} className="flex items-center text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 md:p-6 md:w-48 flex md:flex-col justify-between md:border-l">
                      <div className="flex items-center md:mb-4">
                        <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.views} views</span>
                      </div>
                      <div className="flex items-center md:mb-4">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.replies} replies</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-0">
            <div className="space-y-4">
              {forumThreads.filter(thread => thread.isResolved).map(thread => (
                <Card key={thread.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                          <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">
                            {thread.title}
                            {thread.isHot && (
                              <Badge variant="destructive" className="ml-2 text-xs">Hot</Badge>
                            )}
                            {thread.isResolved && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span>{thread.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <Badge variant="secondary" className="text-xs">{thread.category}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {thread.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {thread.tags.map((tag, index) => (
                          <div key={index} className="flex items-center text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 md:p-6 md:w-48 flex md:flex-col justify-between md:border-l">
                      <div className="flex items-center md:mb-4">
                        <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.views} views</span>
                      </div>
                      <div className="flex items-center md:mb-4">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.replies} replies</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="unresolved" className="mt-0">
            <div className="space-y-4">
              {forumThreads.filter(thread => !thread.isResolved).map(thread => (
                <Card key={thread.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                          <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">
                            {thread.title}
                            {thread.isHot && (
                              <Badge variant="destructive" className="ml-2 text-xs">Hot</Badge>
                            )}
                            {thread.isResolved && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span>{thread.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <Badge variant="secondary" className="text-xs">{thread.category}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {thread.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {thread.tags.map((tag, index) => (
                          <div key={index} className="flex items-center text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 md:p-6 md:w-48 flex md:flex-col justify-between md:border-l">
                      <div className="flex items-center md:mb-4">
                        <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.views} views</span>
                      </div>
                      <div className="flex items-center md:mb-4">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.replies} replies</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">{thread.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="mt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your discussions will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Forum;
