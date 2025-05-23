
# EMSI Share Learning Platform Backend

This is the backend API for the EMSI Share learning platform, a system for managing learning rooms, resources, and quizzes for students and teachers.

## Setup Instructions

1. Create a PostgreSQL database:
   ```
   CREATE DATABASE emsi_share_db;
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Users
- `GET /api/auth/me/` - Get current user info
- `PUT /api/auth/me/` - Update current user
- `GET /api/auth/users/` - List users (admin/teacher only)

### Rooms
- `GET /api/rooms/` - List rooms
- `POST /api/rooms/` - Create a room (teacher only)
- `GET /api/rooms/{id}/` - Get room details
- `PUT /api/rooms/{id}/` - Update room (owner only)
- `DELETE /api/rooms/{id}/` - Delete room (owner only)
- `POST /api/rooms/join/` - Join a room
- `POST /api/rooms/{id}/leave/` - Leave a room

### Resources
- `GET /api/resources/?room={room_id}` - List resources for a room
- `POST /api/resources/` - Upload a resource
- `GET /api/resources/{id}/` - Get resource details
- `DELETE /api/resources/{id}/` - Delete resource (owner only)

### Quizzes
- `GET /api/quizzes/?room={room_id}` - List quizzes for a room
- `POST /api/quizzes/` - Create a quiz (teacher only)
- `GET /api/quizzes/{id}/` - Get quiz details
- `PUT /api/quizzes/{id}/` - Update quiz (owner only)
- `DELETE /api/quizzes/{id}/` - Delete quiz (owner only)
- `POST /api/quizzes/{id}/submit/` - Submit quiz answers

## Database Schema

The system uses PostgreSQL with the following main models:
- User - Custom user model with role field (student/teacher/admin)
- Room - Learning room with name, subject, and owner
- Resource - Learning materials uploaded to rooms
- Quiz - Assessment with questions and options
- QuizAttempt - Record of student quiz attempts

## Frontend Integration

Connect the React frontend to this API by:
1. Using JWT tokens for authentication
2. Making API calls to the appropriate endpoints
3. Handling responses according to the API contracts
