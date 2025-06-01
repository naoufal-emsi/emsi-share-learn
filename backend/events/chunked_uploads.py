# Create a file named chunked_uploads.py in backend/events/
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import os
import json
import base64
from .models import Event, ChunkUploadSession
from .serializers import ChunkUploadSessionSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_upload_session(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        
        # Check if user has permission to modify this event
        if event.created_by != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        # Create upload session
        session = ChunkUploadSession.objects.create(
            event=event,
            filename=request.data.get('filename'),
            filesize=request.data.get('filesize'),
            filetype=request.data.get('filetype'),
            total_chunks=request.data.get('chunks'),
            created_by=request.user
        )
        
        return Response({"session_id": session.id})
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_chunk(request, session_id):
    try:
        session = ChunkUploadSession.objects.get(id=session_id)
        
        # Check if user has permission
        if session.created_by != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        chunk_data = request.data.get('chunk')
        chunk_number = request.data.get('chunkNumber')
        
        # Extract base64 data
        if ';base64,' in chunk_data:
            header, encoded = chunk_data.split(';base64,')
            chunk_binary = base64.b64decode(encoded)
        else:
            return Response({"error": "Invalid chunk format"}, status=400)
        
        # Save chunk to temporary file
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp', str(session.id))
        os.makedirs(temp_dir, exist_ok=True)
        
        with open(os.path.join(temp_dir, f'chunk_{chunk_number}'), 'wb') as f:
            f.write(chunk_binary)
        
        # Update session
        session.uploaded_chunks += 1
        session.save()
        
        return Response({"status": "success"})
    except ChunkUploadSession.DoesNotExist:
        return Response({"error": "Upload session not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalize_upload(request, session_id):
    try:
        session = ChunkUploadSession.objects.get(id=session_id)
        
        # Check if user has permission
        if session.created_by != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        # Check if all chunks are uploaded
        if session.uploaded_chunks < session.total_chunks:
            return Response({"error": "Not all chunks uploaded"}, status=400)
        
        # Combine chunks
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp', str(session.id))
        output_file = os.path.join(settings.MEDIA_ROOT, 'videos', f"{session.event.id}_{session.filename}")
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'wb') as outfile:
            for i in range(session.total_chunks):
                chunk_file = os.path.join(temp_dir, f'chunk_{i}')
                with open(chunk_file, 'rb') as infile:
                    outfile.write(infile.read())
        
        # Update event with video data
        with open(output_file, 'rb') as f:
            video_data = f.read()
            
        event = session.event
        event.video_data = video_data
        event.video_name = session.filename
        event.video_type = session.filetype
        event.save()
        
        # Clean up temp files
        import shutil
        shutil.rmtree(temp_dir)
        
        # Mark session as complete
        session.is_complete = True
        session.save()
        
        return Response({"status": "success"})
    except ChunkUploadSession.DoesNotExist:
        return Response({"error": "Upload session not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
