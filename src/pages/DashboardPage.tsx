import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, TrendingUp, DollarSign, PieChart, BarChart, Activity, FileText } from 'react-feather';

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
    { id: 'investment-banking', label: 'Investment Banking', disabled: false },
    { id: 'consulting', label: 'Consulting (Coming Soon)', disabled: true },
    { id: 'behavioral', label: 'Behavioral (Coming Soon)', disabled: true }
  ];

  const color = "#399844";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center pl-0">
                <span className="text-2xl font-extrabold text-[#399844] tracking-tight hover:scale-105 transition-transform duration-200">
                  AlphaEd
                </span>
              </div>
              
              {/* Navigation Tabs */}
              <div className="ml-16 flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-[#399844] text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } ${
                      tab.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
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
                className="bg-white text-gray-700 px-4 py-2 font-semibold border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/console', { state: { type: 'merger' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Merger Model</h2>
            </div>
            <p className="text-gray-600">Practice M&A concepts and merger modeling</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'lbo' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">LBO Interview</h2>
            </div>
            <p className="text-gray-600">Practice leveraged buyout concepts and modeling</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'dcf' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">DCF Interview</h2>
            </div>
            <p className="text-gray-600">Practice discounted cash flow analysis and valuation</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'valuation' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Valuation Interview</h2>
            </div>
            <p className="text-gray-600">Practice company valuation methodologies and analysis</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'enterprise' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Enterprise Value</h2>
            </div>
            <p className="text-gray-600">Practice enterprise and equity value concepts</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'accounting' }})}
            className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Accounting Interview</h2>
            </div>
            <p className="text-gray-600">Practice financial statements and accounting concepts</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;