
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Shield, 
  Users, 
  CheckCircle,
  ChevronRight
} from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">EMSI Share</h1>
        </div>
        
        <div className="space-x-3">
          {isAuthenticated ? (
            <Link to="/">
              <Button className="bg-primary hover:bg-primary-dark">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary-dark">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </header>
      
      {/* Hero section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Collaborative Learning Platform for <span className="text-primary">EMSI</span> Students
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access educational resources, participate in interactive quizzes, and collaborate with peers and professors all in one place.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark px-8">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-12 bg-white rounded-xl shadow-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=2000" 
              alt="EMSI Share Platform" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to enhance your learning experience at EMSI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
              <p className="text-gray-600">
                Access a wide range of educational materials including lecture notes, presentations, and practical exercises.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600">
                Test your knowledge with interactive quizzes that provide immediate feedback and track your progress.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborative Forums</h3>
              <p className="text-gray-600">
                Engage in discussions with peers and professors to deepen your understanding of complex topics.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Events & Activities</h3>
              <p className="text-gray-600">
                Stay updated on academic events, workshops, and competitions happening at EMSI.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your data is secure with our authentication system and role-based access control.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your learning progress and performance over time with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-primary py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Learning Experience?</h2>
          <p className="text-xl mb-8">
            Join EMSI Share today and unlock a world of educational resources and collaborative learning.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">EMSI Share</h2>
              <p className="text-gray-400 max-w-xs">
                A collaborative learning platform for EMSI students and teachers.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Resources</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Quiz</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Forum</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">EMSI Website</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EMSI Share. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
