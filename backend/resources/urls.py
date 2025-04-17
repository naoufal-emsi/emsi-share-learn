
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceCategoryViewSet

router = DefaultRouter()
router.register(r'categories', ResourceCategoryViewSet)
router.register(r'', ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
