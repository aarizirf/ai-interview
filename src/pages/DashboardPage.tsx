import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, TrendingUp, DollarSign, PieChart, BarChart, Activity, FileText } from 'react-feather';
import { navigateToInterview } from '../utils/navigation';
import { InterviewType } from '../utils/types';

const DashboardPage = () => {
  const navigate = useNavigate();
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

  const color = "#399844";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center pl-0">
                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  InterviewGPT
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <h2 className="text-4xl font-semibold text-gray-900">
            Hi {userName || 'there'} 👋
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-3xl">
            We've sourced thousands of historical interviews and prep materials to create personalized mock interviews tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Large Feature Card - Q&A */}
          <div className="md:col-span-2">
            <button
              onClick={() => navigateToInterview(navigate, { type: InterviewType.General })}
              className="w-full text-left p-8 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
            >
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <MessageCircle className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">General Q&A</h2>
                  <p className="text-gray-600 text-lg">
                    Practice common investment banking interview questions with real-time feedback and guidance.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Regular Cards */}
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.LBO })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">LBO Interview</h2>
            </div>
            <p className="text-gray-600">Practice leveraged buyout concepts and modeling</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.DCF })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">DCF Interview</h2>
            </div>
            <p className="text-gray-600">Practice discounted cash flow analysis and valuation</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Valuation })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Valuation Interview</h2>
            </div>
            <p className="text-gray-600">Practice company valuation methodologies and analysis</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Enterprise })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Enterprise Value</h2>
            </div>
            <p className="text-gray-600">Practice enterprise and equity value concepts</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Accounting })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Accounting Interview</h2>
            </div>
            <p className="text-gray-600">Practice financial statements and accounting concepts</p>
          </button>

          {/* Merger Model Card - Moved to last position */}
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Merger })}
            className="text-left p-6 border border-gray-100 rounded-lg hover:border-blue-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Merger Model</h2>
            </div>
            <p className="text-gray-600">Practice M&A concepts and merger modeling</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;