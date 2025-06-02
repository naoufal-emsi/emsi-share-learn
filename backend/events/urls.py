from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EventViewSet
from .chunked_uploads import create_upload_session, upload_chunk, finalize_upload

router = DefaultRouter()
router.register(r'', EventViewSet, basename='event')

urlpatterns = router.urls

urlpatterns += [
    path('<int:event_id>/upload-session/', create_upload_session, name='create-upload-session'),
    path('upload-sessions/<int:session_id>/chunk/', upload_chunk, name='upload-chunk'),
    path('upload-sessions/<int:session_id>/finalize/', finalize_upload, name='finalize-upload'),
]