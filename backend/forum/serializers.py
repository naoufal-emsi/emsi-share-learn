
from rest_framework import serializers
from .models import Topic, Post, Reply

class ReplySerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    author_avatar = serializers.ReadOnlyField(source='author.avatar.url')
    author_role = serializers.ReadOnlyField(source='author.role')
    
    class Meta:
        model = Reply
        fields = ['id', 'post', 'content', 'author', 'author_name', 
                 'author_avatar', 'author_role', 'created_at', 'updated_at']
        read_only_fields = ['author']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    author_avatar = serializers.SerializerMethodField()
    author_role = serializers.ReadOnlyField(source='author.role')
    replies = ReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'topic', 'content', 'author', 'author_name', 
                 'author_avatar', 'author_role', 'created_at', 'updated_at', 
                 'is_solution', 'replies', 'replies_count']
        read_only_fields = ['author', 'is_solution']
    
    def get_author_avatar(self, obj):
        if obj.author.avatar and hasattr(obj.author.avatar, 'url'):
            return obj.author.avatar.url
        return None
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class TopicSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    created_by_avatar = serializers.SerializerMethodField()
    created_by_role = serializers.ReadOnlyField(source='created_by.role')
    posts_count = serializers.SerializerMethodField()
    last_post_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'description', 'created_by', 'created_by_name', 
                 'created_by_avatar', 'created_by_role', 'created_at', 
                 'is_pinned', 'views', 'posts_count', 'last_post_date']
        read_only_fields = ['created_by', 'views']
    
    def get_created_by_avatar(self, obj):
        if obj.created_by.avatar and hasattr(obj.created_by.avatar, 'url'):
            return obj.created_by.avatar.url
        return None
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_last_post_date(self, obj):
        last_post = obj.posts.order_by('-created_at').first()
        return last_post.created_at if last_post else obj.created_at
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class TopicDetailSerializer(TopicSerializer):
    posts = PostSerializer(many=True, read_only=True)
    
    class Meta(TopicSerializer.Meta):
        fields = TopicSerializer.Meta.fields + ['posts']
