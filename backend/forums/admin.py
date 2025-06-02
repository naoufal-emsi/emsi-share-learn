from django.contrib import admin
from .models import ForumCategory, ForumTopic, ForumPost, ForumVote, ForumSubscription, ForumAttachment, TopicLike

admin.site.register(ForumCategory)
admin.site.register(ForumTopic)
admin.site.register(ForumPost)
admin.site.register(ForumVote)
admin.site.register(ForumSubscription)
admin.site.register(ForumAttachment)
admin.site.register(TopicLike)