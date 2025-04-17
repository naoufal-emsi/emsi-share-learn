
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Max
from .models import Topic, Post, Reply
from .serializers import (
    TopicSerializer, TopicDetailSerializer, PostSerializer, ReplySerializer
)
from .permissions import IsAuthorOrReadOnly, IsTeacherOrModerateOnly

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'views', 'title']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TopicDetailSerializer
        return TopicSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        topic = self.get_object()
        if request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        topic.is_pinned = not topic.is_pinned
        topic.save()
        return Response({'is_pinned': topic.is_pinned})
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        trending_topics = Topic.objects.annotate(
            posts_count=Count('posts'),
            last_activity=Max('posts__created_at')
        ).order_by('-last_activity', '-posts_count', '-views')[:5]
        
        serializer = self.get_serializer(trending_topics, many=True)
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def mark_as_solution(self, request, pk=None):
        post = self.get_object()
        topic = post.topic
        
        # Only the topic creator or teachers/admins can mark a solution
        if request.user != topic.created_by and request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Reset any previous solutions
        topic.posts.filter(is_solution=True).update(is_solution=False)
        
        post.is_solution = True
        post.save()
        return Response({'is_solution': True})

class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
