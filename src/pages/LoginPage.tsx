import { useState } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] relative">
      {/* Centered Text */}
      <div className="absolute top-0 w-full text-center pt-24">
        <span className="text-5xl font-bold text-gray-900">AlphaEd</span>
        <div className="mt-3">
          <span className="text-xl text-gray-900">Finance and Consulting Interview Prep</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center relative">
        {/* Large Alpha Background */}
        <div className="absolute text-[#399844] font-['Times_New_Roman'] italic text-[20rem] opacity-20 right-[45%]">
          α
        </div>
        
        {/* Card Content */}
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-2xl shadow-2xl backdrop-blur-lg bg-opacity-95">
            <h2 className="text-3xl font-bold leading-tight font-['Inter'] text-gray-800 mb-6">
              Master Your Interviews
            </h2>
            <div className="space-y-4 font-['Inter'] mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#399844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600">
                  Interviews and prep are hard. We made it easy.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#399844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600">
                  Turbo charge your learning experience with AI-powered feedback
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#399844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600">
                  Practice with real consulting and finance case scenarios
                </p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-gradient-to-r from-[#399844] via-[#2c7a3d] to-[#1f5c36] text-white py-3 px-6 rounded-lg font-medium text-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl font-['Inter']"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Get Started Today</span>
            </button>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            <p className="mt-6 text-sm text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;