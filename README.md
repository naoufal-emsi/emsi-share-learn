# EMSI Share Learn Platform

## Security Updates (Important)

The project has been updated to address several security vulnerabilities:

1. Replaced vulnerable `@react-pdf-viewer/core` with safer `react-pdf` library
   - Created a new `PDFViewerSafe.tsx` component that should be used instead of the old PDFViewer
   - The old component is kept for reference but should be migrated

2. Updated `react-syntax-highlighter` to version 15.6.1 to fix vulnerabilities

3. Added `@react-pdf/renderer` as an alternative for PDF generation needs

4. Known issues that still need attention:
   - `xlsx` library has vulnerabilities with no direct fix available
   - Consider using alternative spreadsheet libraries if needed

## Getting Started

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

## Project Structure

- `/src` - React frontend code
- `/backend` - Django backend code
- `/public` - Static assets

## Features

- User authentication
- Resource sharing
- Forums
- Events
- Quizzes
- Rooms for collaboration