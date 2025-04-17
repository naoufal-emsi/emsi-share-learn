
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TopicViewSet, PostViewSet, ReplyViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet)
router.register(r'posts', PostViewSet)
router.register(r'replies', ReplyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
