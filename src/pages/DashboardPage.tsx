import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Interview Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/console', { state: { type: 'technical' }})}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Technical Interview</h2>
            <p className="text-gray-600">Practice coding problems and system design questions</p>
          </button>
          
          <button
            onClick={() => navigate('/console', { state: { type: 'behavioral' }})}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Behavioral Questions</h2>
            <p className="text-gray-600">Practice common behavioral and situational questions</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 