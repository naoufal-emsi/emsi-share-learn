import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, FileText, Calendar, MessageSquare, Settings, Upload, Download, ArrowUp } from 'lucide-react';

const Documentation: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              EMSI Share Documentation
            </h1>
            <p className="text-muted-foreground">Complete guide to using the collaborative learning platform</p>
          </div>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button onClick={() => scrollToSection('getting-started')} className="text-left p-2 hover:bg-gray-100 rounded">1. Getting Started</button>
              <button onClick={() => scrollToSection('dashboard')} className="text-left p-2 hover:bg-gray-100 rounded">2. Dashboard Overview</button>
              <button onClick={() => scrollToSection('rooms')} className="text-left p-2 hover:bg-gray-100 rounded">3. Rooms & Classes</button>
              <button onClick={() => scrollToSection('resources')} className="text-left p-2 hover:bg-gray-100 rounded">4. Resources Management</button>
              <button onClick={() => scrollToSection('events')} className="text-left p-2 hover:bg-gray-100 rounded">5. Events & Calendar</button>
              <button onClick={() => scrollToSection('forums')} className="text-left p-2 hover:bg-gray-100 rounded">6. Discussion Forums</button>
              <button onClick={() => scrollToSection('quizzes')} className="text-left p-2 hover:bg-gray-100 rounded">7. Quizzes & Assessments</button>
              <button onClick={() => scrollToSection('notifications')} className="text-left p-2 hover:bg-gray-100 rounded">8. Notifications</button>
              <button onClick={() => scrollToSection('profile')} className="text-left p-2 hover:bg-gray-100 rounded">9. Profile Management</button>
              <button onClick={() => scrollToSection('admin')} className="text-left p-2 hover:bg-gray-100 rounded">10. Admin Features</button>
              <button onClick={() => scrollToSection('troubleshooting')} className="text-left p-2 hover:bg-gray-100 rounded">11. Troubleshooting</button>
              <button onClick={() => scrollToSection('faq')} className="text-left p-2 hover:bg-gray-100 rounded">12. FAQ</button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card id="getting-started">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              1. Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Welcome to EMSI Share</h3>
            <p>EMSI Share is a comprehensive collaborative learning platform designed for students and teachers to share resources, participate in discussions, take quizzes, and manage academic activities.</p>
            
            <h4 className="font-semibold">Account Types</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Student:</strong> Access resources, join rooms, participate in forums, take quizzes</li>
              <li><strong>Teacher:</strong> Create rooms, upload resources, create quizzes, manage events</li>
              <li><strong>Admin:</strong> Full platform management, user administration, system settings</li>
            </ul>

            <h4 className="font-semibold">First Login</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Navigate to the login page</li>
              <li>Enter your email and password</li>
              <li>Complete your profile information</li>
              <li>Explore the dashboard and available features</li>
            </ol>
          </CardContent>
        </Card>

        {/* Dashboard */}
        <Card id="dashboard">
          <CardHeader>
            <CardTitle>2. Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The dashboard is your central hub for accessing all platform features.</p>
            
            <h4 className="font-semibold">Navigation Sidebar</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dashboard:</strong> Overview of your activities and quick stats</li>
              <li><strong>Rooms:</strong> Access your joined rooms and classes</li>
              <li><strong>Resources:</strong> Browse and manage learning materials</li>
              <li><strong>Events:</strong> View upcoming events and deadlines</li>
              <li><strong>Forums:</strong> Participate in discussions</li>
              <li><strong>Quizzes:</strong> Take assessments and view results</li>
              <li><strong>Notifications:</strong> Stay updated with platform activities</li>
            </ul>

            <h4 className="font-semibold">Quick Actions</h4>
            <p>Use the header to quickly access notifications, change themes, and manage your profile.</p>
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card id="rooms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              3. Rooms & Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">What are Rooms?</h4>
            <p>Rooms are virtual classrooms where teachers and students collaborate. Each room contains resources, discussions, and activities specific to a subject or course.</p>

            <h4 className="font-semibold">For Students</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Join Rooms:</strong> Use room codes provided by teachers</li>
              <li><strong>Browse Resources:</strong> Access materials shared by teachers</li>
              <li><strong>Participate:</strong> Engage in room-specific discussions</li>
              <li><strong>Submit Work:</strong> Upload assignments and projects</li>
            </ul>

            <h4 className="font-semibold">For Teachers</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Create Rooms:</strong> Set up new classes with descriptions</li>
              <li><strong>Manage Members:</strong> Add/remove students and co-teachers</li>
              <li><strong>Share Resources:</strong> Upload course materials and references</li>
              <li><strong>Monitor Progress:</strong> Track student participation and submissions</li>
            </ul>

            <h4 className="font-semibold">Room Features</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dedicated resource library</li>
              <li>Room-specific discussion forums</li>
              <li>Event calendar integration</li>
              <li>Member management tools</li>
              <li>Activity tracking and analytics</li>
            </ul>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card id="resources">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              4. Resources Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Resource Types</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Documents:</strong> PDFs, Word files, presentations</li>
              <li><strong>Videos:</strong> Educational videos and tutorials</li>
              <li><strong>Images:</strong> Diagrams, charts, and visual aids</li>
              <li><strong>Code:</strong> Programming files and scripts</li>
              <li><strong>Archives:</strong> ZIP files with multiple resources</li>
            </ul>

            <h4 className="font-semibold">Uploading Resources</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Navigate to Resources section</li>
              <li>Click "Upload Resource" button</li>
              <li>Select file(s) from your device</li>
              <li>Add title and description</li>
              <li>Choose category and room (if applicable)</li>
              <li>Submit for review (students) or publish directly (teachers)</li>
            </ol>

            <h4 className="font-semibold">Resource Features</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Search & Filter:</strong> Find resources by type, category, or keywords</li>
              <li><strong>Download:</strong> Save resources to your device</li>
              <li><strong>Bookmark:</strong> Save favorites for quick access</li>
              <li><strong>Preview:</strong> View content before downloading</li>
              <li><strong>Comments:</strong> Discuss resources with other users</li>
            </ul>

            <h4 className="font-semibold">Approval Process</h4>
            <p>Student uploads require admin approval to ensure quality and appropriateness. Teachers and admins can publish resources immediately.</p>
          </CardContent>
        </Card>

        {/* Events */}
        <Card id="events">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              5. Events & Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Event Types</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Lectures:</strong> Scheduled class sessions</li>
              <li><strong>Exams:</strong> Assessment dates and times</li>
              <li><strong>Deadlines:</strong> Assignment and project due dates</li>
              <li><strong>Workshops:</strong> Special training sessions</li>
              <li><strong>Meetings:</strong> Group discussions and consultations</li>
              <li><strong>Social Events:</strong> Community activities</li>
            </ul>

            <h4 className="font-semibold">Creating Events</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to Events section</li>
              <li>Click "Create Event"</li>
              <li>Fill in event details (title, description, date/time)</li>
              <li>Set location or online meeting link</li>
              <li>Upload event image or video</li>
              <li>Add collaborators if needed</li>
              <li>Save and publish</li>
            </ol>

            <h4 className="font-semibold">Event Features</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>RSVP System:</strong> Track attendance (Attending/Maybe/Declined)</li>
              <li><strong>Reminders:</strong> Automatic notifications before events</li>
              <li><strong>Collaboration:</strong> Multiple organizers per event</li>
              <li><strong>Media Support:</strong> Add images and videos to events</li>
              <li><strong>Calendar Integration:</strong> View events in calendar format</li>
            </ul>

            <h4 className="font-semibold">Managing Attendance</h4>
            <p>Click on any event to view details and update your attendance status. Organizers can see attendee lists and send targeted notifications.</p>
          </CardContent>
        </Card>

        {/* Forums */}
        <Card id="forums">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              6. Discussion Forums
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Forum Categories</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>General Discussion:</strong> Open conversations</li>
              <li><strong>Q&A:</strong> Questions and answers</li>
              <li><strong>Study Groups:</strong> Collaborative learning</li>
              <li><strong>Technical Support:</strong> Platform help</li>
              <li><strong>Room-Specific:</strong> Class discussions</li>
            </ul>

            <h4 className="font-semibold">Creating Topics</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Navigate to Forums</li>
              <li>Select appropriate category</li>
              <li>Click "New Topic"</li>
              <li>Write clear title and detailed content</li>
              <li>Add tags for better discoverability</li>
              <li>Attach files if necessary</li>
              <li>Post your topic</li>
            </ol>

            <h4 className="font-semibold">Forum Features</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Voting System:</strong> Upvote/downvote posts</li>
              <li><strong>Best Answer:</strong> Mark solutions to questions</li>
              <li><strong>Subscriptions:</strong> Get notified of replies</li>
              <li><strong>Search:</strong> Find topics by keywords</li>
              <li><strong>Moderation:</strong> Report inappropriate content</li>
            </ul>

            <h4 className="font-semibold">Best Practices</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use descriptive titles</li>
              <li>Search before posting duplicates</li>
              <li>Be respectful and constructive</li>
              <li>Mark solved topics appropriately</li>
              <li>Use proper formatting and tags</li>
            </ul>
          </CardContent>
        </Card>

        {/* Quizzes */}
        <Card id="quizzes">
          <CardHeader>
            <CardTitle>7. Quizzes & Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Quiz Types</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Multiple Choice:</strong> Select from given options</li>
              <li><strong>True/False:</strong> Binary choice questions</li>
              <li><strong>Short Answer:</strong> Brief text responses</li>
              <li><strong>Essay:</strong> Long-form written answers</li>
              <li><strong>Mixed:</strong> Combination of question types</li>
            </ul>

            <h4 className="font-semibold">Taking Quizzes</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Access quiz from Quizzes section or room</li>
              <li>Read instructions carefully</li>
              <li>Answer questions at your own pace</li>
              <li>Review answers before submission</li>
              <li>Submit when complete</li>
              <li>View results and feedback</li>
            </ol>

            <h4 className="font-semibold">For Teachers: Creating Quizzes</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to Quizzes and click "Create Quiz"</li>
              <li>Set quiz title and description</li>
              <li>Add questions with multiple choice options</li>
              <li>Set correct answers and point values</li>
              <li>Configure time limits and attempts</li>
              <li>Assign to specific rooms or make public</li>
              <li>Publish and monitor results</li>
            </ol>

            <h4 className="font-semibold">Quiz Features</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Timed Assessments:</strong> Set time limits</li>
              <li><strong>Multiple Attempts:</strong> Allow retakes</li>
              <li><strong>Instant Feedback:</strong> Show correct answers</li>
              <li><strong>Grade Tracking:</strong> Monitor student progress</li>
              <li><strong>Analytics:</strong> View detailed performance reports</li>
            </ul>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card id="notifications">
          <CardHeader>
            <CardTitle>8. Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Notification Types</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Resource Updates:</strong> New uploads and approvals</li>
              <li><strong>Event Reminders:</strong> Upcoming deadlines and meetings</li>
              <li><strong>Forum Activity:</strong> Replies to your topics</li>
              <li><strong>Quiz Results:</strong> Grade notifications</li>
              <li><strong>Room Activity:</strong> New members and updates</li>
              <li><strong>System Announcements:</strong> Platform updates</li>
            </ul>

            <h4 className="font-semibold">Managing Notifications</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click the bell icon in the header</li>
              <li>View recent notifications</li>
              <li>Mark as read/unread</li>
              <li>Access notification history</li>
              <li>Configure notification preferences</li>
            </ul>

            <h4 className="font-semibold">Notification Settings</h4>
            <p>Customize which notifications you receive and how you're notified (in-app, email, etc.) through your profile settings.</p>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card id="profile">
          <CardHeader>
            <CardTitle>9. Profile Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Profile Information</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Basic Info:</strong> Name, email, role</li>
              <li><strong>Profile Picture:</strong> Upload personal avatar</li>
              <li><strong>Bio:</strong> Brief description about yourself</li>
              <li><strong>Contact:</strong> Additional contact information</li>
              <li><strong>Preferences:</strong> Theme, language, notifications</li>
            </ul>

            <h4 className="font-semibold">Updating Your Profile</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Click your avatar in the header</li>
              <li>Select "Profile" from dropdown</li>
              <li>Edit desired information</li>
              <li>Upload new profile picture if needed</li>
              <li>Save changes</li>
            </ol>

            <h4 className="font-semibold">Privacy Settings</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Control profile visibility</li>
              <li>Manage contact information sharing</li>
              <li>Set notification preferences</li>
              <li>Configure privacy options</li>
            </ul>

            <h4 className="font-semibold">Account Security</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Change password regularly</li>
              <li>Use strong, unique passwords</li>
              <li>Log out from shared devices</li>
              <li>Report suspicious activity</li>
            </ul>
          </CardContent>
        </Card>

        {/* Admin Features */}
        <Card id="admin">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              10. Admin Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">User Management</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Create Users:</strong> Add new students, teachers, admins</li>
              <li><strong>Edit Profiles:</strong> Update user information</li>
              <li><strong>Role Management:</strong> Change user permissions</li>
              <li><strong>Account Status:</strong> Activate/deactivate accounts</li>
              <li><strong>Bulk Operations:</strong> Manage multiple users</li>
            </ul>

            <h4 className="font-semibold">Content Moderation</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Resource Approval:</strong> Review student uploads</li>
              <li><strong>Forum Moderation:</strong> Manage discussions</li>
              <li><strong>Content Removal:</strong> Delete inappropriate material</li>
              <li><strong>User Reports:</strong> Handle community reports</li>
            </ul>

            <h4 className="font-semibold">Platform Settings</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>General Settings:</strong> Platform name, logo, registration</li>
              <li><strong>Database Stats:</strong> Monitor storage and usage</li>
              <li><strong>Page Limits:</strong> Configure pagination</li>
              <li><strong>System Maintenance:</strong> Platform updates</li>
            </ul>

            <h4 className="font-semibold">Analytics & Reports</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>User activity statistics</li>
              <li>Resource usage reports</li>
              <li>System performance metrics</li>
              <li>Database storage analysis</li>
            </ul>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card id="troubleshooting">
          <CardHeader>
            <CardTitle>11. Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Common Issues</h4>
            
            <div className="space-y-3">
              <div>
                <h5 className="font-medium">Login Problems</h5>
                <ul className="list-disc pl-6 text-sm">
                  <li>Check email and password spelling</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try incognito/private browsing mode</li>
                  <li>Contact admin for password reset</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium">File Upload Issues</h5>
                <ul className="list-disc pl-6 text-sm">
                  <li>Check file size limits (500MB max)</li>
                  <li>Verify file format is supported</li>
                  <li>Ensure stable internet connection</li>
                  <li>Try uploading smaller files first</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium">Performance Issues</h5>
                <ul className="list-disc pl-6 text-sm">
                  <li>Close unnecessary browser tabs</li>
                  <li>Update your browser to latest version</li>
                  <li>Check internet connection speed</li>
                  <li>Disable browser extensions temporarily</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium">Mobile Access</h5>
                <ul className="list-disc pl-6 text-sm">
                  <li>Use mobile browser (Chrome, Safari)</li>
                  <li>Enable JavaScript in browser settings</li>
                  <li>Clear mobile browser cache</li>
                  <li>Try landscape orientation for better view</li>
                </ul>
              </div>
            </div>

            <h4 className="font-semibold">Getting Help</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post in Technical Support forum</li>
              <li>Contact your teacher or admin</li>
              <li>Check platform announcements</li>
              <li>Report bugs through feedback system</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card id="faq">
          <CardHeader>
            <CardTitle>12. Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium">Q: How do I join a room?</h5>
                <p className="text-sm text-muted-foreground">A: Get the room code from your teacher and use the "Join Room" feature in the Rooms section.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: Can I upload any type of file?</h5>
                <p className="text-sm text-muted-foreground">A: Supported formats include documents (PDF, DOC), images (JPG, PNG), videos (MP4, AVI), code files, and archives (ZIP).</p>
              </div>

              <div>
                <h5 className="font-medium">Q: How long do my uploaded resources stay on the platform?</h5>
                <p className="text-sm text-muted-foreground">A: Resources remain available indefinitely unless removed by admins or the uploader.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: Can I retake a quiz?</h5>
                <p className="text-sm text-muted-foreground">A: This depends on the quiz settings configured by your teacher. Some quizzes allow multiple attempts.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: How do I change my password?</h5>
                <p className="text-sm text-muted-foreground">A: Go to your profile settings and use the "Change Password" option, or contact an admin for assistance.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: Why can't I see certain resources?</h5>
                <p className="text-sm text-muted-foreground">A: Resources may be room-specific, pending approval, or restricted based on your role and permissions.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: How do I report inappropriate content?</h5>
                <p className="text-sm text-muted-foreground">A: Use the report feature on the content or contact an admin directly through the platform.</p>
              </div>

              <div>
                <h5 className="font-medium">Q: Can I use EMSI Share on my mobile device?</h5>
                <p className="text-sm text-muted-foreground">A: Yes, the platform is mobile-responsive and works on smartphones and tablets through web browsers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Need more help? Contact your administrator or post in the Technical Support forum.
              </p>
              <Button onClick={() => navigate('/')} className="w-full md:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Back to Top Button */}
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </MainLayout>
  );
};

export default Documentation;