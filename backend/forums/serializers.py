from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumCategory, ForumTopic, ForumPost, ForumVote, ForumSubscription, ForumAttachment, TopicLike
import base64
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture_data = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'profile_picture_data']
    
    def get_profile_picture_data(self, obj):
        if obj.profile_picture:
            mime = 'image/png'  # Default, could be improved by storing mime type
            b64 = base64.b64encode(obj.profile_picture).decode('utf-8')
            return f'data:{mime};base64,{b64}'
        return None

class ForumCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumCategory
        fields = '__all__'

class ForumTopicSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ForumCategory.objects.all(),
        source='category',
        write_only=True
    )
    posts_count = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    attachment_base64 = serializers.CharField(write_only=True, required=False, allow_null=True)
    has_attachment = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = [
            'id', 'title', 'content', 'category', 'category_id', 'room',
            'created_by', 'status', 'is_announcement', 'view_count', 'like_count',
            'is_solved', 'solved_by', 'tags', 'created_at', 'updated_at',
            'last_activity', 'posts_count', 'votes_count', 'attachment_base64',
            'attachment_name', 'attachment_type', 'attachment_size', 'has_attachment',
            'attachment_url'
        ]
        read_only_fields = ['created_by', 'view_count', 'like_count', 'is_solved', 'solved_by']
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_votes_count(self, obj):
        # Return the like_count directly instead of calculating from post votes
        return obj.like_count
    
    def get_has_attachment(self, obj):
        return obj.attachment_data is not None
    
    def get_attachment_url(self, obj):
        if obj.attachment_data:
            return f"/api/forums/topics/{obj.id}/attachment/"
        return None
    
    def create(self, validated_data):
        attachment_base64 = validated_data.pop('attachment_base64', None)
        
        # Create the topic
        topic = super().create(validated_data)
        
        # Process attachment if provided
        if attachment_base64:
            self._process_attachment(topic, attachment_base64)
            topic.save()
            
        return topic
    
    def update(self, instance, validated_data):
        attachment_base64 = validated_data.pop('attachment_base64', None)
        
        # Update the topic
        topic = super().update(instance, validated_data)
        
        # Process attachment if provided
        if attachment_base64:
            self._process_attachment(topic, attachment_base64)
            topic.save()
            
        return topic
    
    def _process_attachment(self, topic, attachment_base64):
        # Extract file info from base64 string
        # Format: data:application/pdf;base64,JVBERi0xLjUNCiW...
        match = re.match(r'data:(.+);base64,(.+)', attachment_base64)
        if match:
            mime_type = match.group(1)
            base64_data = match.group(2)
            
            # Decode base64 data
            binary_data = base64.b64decode(base64_data)
            
            # Save to topic
            topic.attachment_data = binary_data
            topic.attachment_type = mime_type
            topic.attachment_size = len(binary_data)
            
            # If attachment_name not provided, use a default based on mime type
            if not topic.attachment_name:
                ext = mime_type.split('/')[-1]
                topic.attachment_name = f"attachment.{ext}"

class ForumPostSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    attachment_base64 = serializers.CharField(write_only=True, required=False, allow_null=True)
    has_attachment = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'topic', 'content', 'created_by', 'parent_post',
            'is_solution', 'is_edited', 'edit_reason', 'created_at',
            'updated_at', 'upvotes', 'downvotes', 'user_vote',
            'attachment_base64', 'attachment_name', 'attachment_type', 
            'attachment_size', 'has_attachment', 'attachment_url'
        ]
        read_only_fields = ['created_by', 'is_solution', 'is_edited']
    
    def get_upvotes(self, obj):
        return obj.votes.filter(vote_type='upvote').count()
    
    def get_downvotes(self, obj):
        return obj.votes.filter(vote_type='downvote').count()
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = obj.votes.get(user=request.user)
                return vote.vote_type
            except ForumVote.DoesNotExist:
                return None
        return None
    
    def get_has_attachment(self, obj):
        return obj.attachment_data is not None
    
    def get_attachment_url(self, obj):
        if obj.attachment_data:
            return f"/api/forums/posts/{obj.id}/attachment/"
        return None
    
    def create(self, validated_data):
        attachment_base64 = validated_data.pop('attachment_base64', None)
        
        # Create the post
        post = super().create(validated_data)
        
        # Process attachment if provided
        if attachment_base64:
            self._process_attachment(post, attachment_base64)
            post.save()
            
        return post
    
    def update(self, instance, validated_data):
        attachment_base64 = validated_data.pop('attachment_base64', None)
        
        # Update the post
        post = super().update(instance, validated_data)
        
        # Process attachment if provided
        if attachment_base64:
            self._process_attachment(post, attachment_base64)
            post.save()
            
        return post
    
    def _process_attachment(self, post, attachment_base64):
        # Extract file info from base64 string
        match = re.match(r'data:(.+);base64,(.+)', attachment_base64)
        if match:
            mime_type = match.group(1)
            base64_data = match.group(2)
            
            # Decode base64 data
            binary_data = base64.b64decode(base64_data)
            
            # Save to post
            post.attachment_data = binary_data
            post.attachment_type = mime_type
            post.attachment_size = len(binary_data)
            
            # If attachment_name not provided, use a default based on mime type
            if not post.attachment_name:
                ext = mime_type.split('/')[-1]
                post.attachment_name = f"attachment.{ext}"

class ForumVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumVote
        fields = ['id', 'post', 'user', 'vote_type', 'created_at']
        read_only_fields = ['user']

class ForumSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumSubscription
        fields = ['id', 'topic', 'user', 'email_notifications', 'created_at']
        read_only_fields = ['user']

class ForumAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumAttachment
        fields = ['id', 'post', 'file', 'filename', 'file_size', 'uploaded_at']
        
class TopicLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicLike
        fields = ['id', 'topic', 'user', 'created_at']
        read_only_fields = ['user']