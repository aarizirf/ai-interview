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
    <div className="min-h-screen bg-gray-800">
      {/* Navigation Bar */}
      <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center pl-0">
                <span className="text-lg font-light text-blue-500 tracking-tight flex items-center space-x-2">
                  <span className="">InterviewGPT</span>
                  <span className="text-xs bg-blue-500 font-black uppercase text-white px-2 py-px rounded-full">Beta</span>
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
          <h2 className="text-3xl font-light text-white">
            Hi {userName || 'there'} 👋
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl text-sm">
            We've sourced thousands of historical interviews and prep materials to create personalized mock interviews tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Large Feature Card - Q&A */}
          <div className="md:col-span-2">
            <button
              onClick={() => navigateToInterview(navigate, { type: InterviewType.General })}
              
              className="w-full border border-gray-700 hover:border-gray-800 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <MessageCircle className="w-12 h-12 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-500 mb-2">General Q&A</h2>
                  <p className="text-gray-500 text-lg">
                    Practice common investment banking interview questions with real-time feedback and guidance.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Regular Cards */}
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.LBO })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-500">LBO Interview</h2>
            </div>
            <p className="text-gray-500">Practice leveraged buyout concepts and modeling</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.DCF })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-blue-500">DCF Interview</h2>
            </div>
            <p className="text-gray-500">Practice discounted cash flow analysis and valuation</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Valuation })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-blue-500">Valuation Interview</h2>
            </div>
            <p className="text-gray-500">Practice company valuation methodologies and analysis</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Enterprise })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-blue-500">Enterprise Value</h2>
            </div>
            <p className="text-gray-500">Practice enterprise and equity value concepts</p>
          </button>
          
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Accounting })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-blue-500">Accounting Interview</h2>
            </div>
            <p className="text-gray-500">Practice financial statements and accounting concepts</p>
          </button>

          {/* Merger Model Card - Moved to last position */}
          <button
            onClick={() => navigateToInterview(navigate, { type: InterviewType.Merger })}
            className="border hover:border-gray-800 border-px border-gray-700 text-left p-6 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-500">Merger Model</h2>
            </div>
            <p className="text-gray-500">Practice M&A concepts and merger modeling</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;