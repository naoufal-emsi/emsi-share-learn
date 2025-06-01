# Add to backend/events/urls.py
from .chunked_uploads import create_upload_session, upload_chunk, finalize_upload

urlpatterns += [
    path('events/<int:event_id>/upload-session/', create_upload_session, name='create-upload-session'),
    path('upload-sessions/<int:session_id>/chunk/', upload_chunk, name='upload-chunk'),
    path('upload-sessions/<int:session_id>/finalize/', finalize_upload, name='finalize-upload'),
]
