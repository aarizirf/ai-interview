import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle } from 'react-feather';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('investment-banking');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user's display name from Firebase Auth
    const user = auth.currentUser;
    if (user?.displayName) {
      setUserName(user.displayName.split(' ')[0]); // Get first name only
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'investment-banking', label: 'Investment Banking' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'behavioral', label: 'Behavioral' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center pl-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  AI Interviewer
                </span>
              </div>
              
              {/* Navigation Tabs */}
              <div className="ml-16 flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Hi {userName || 'there'} 👋
          </h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            We've sourced thousands of historical interviews and prep materials to create personalized mock interviews tailored to your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/console', { state: { type: 'technical' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Technical Interview</h2>
            </div>
            <p className="text-gray-600">Practice coding problems and system design questions</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'behavioral' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Behavioral Questions</h2>
            </div>
            <p className="text-gray-600">Practice common behavioral and situational questions</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;