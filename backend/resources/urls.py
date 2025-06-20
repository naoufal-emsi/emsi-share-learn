
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceCategoryViewSet

router = DefaultRouter()
router.register(r'', ResourceViewSet, basename='resource')
router.register(r'categories', ResourceCategoryViewSet, basename='resource-category')

urlpatterns = [
    path('', include(router.urls)),
]
