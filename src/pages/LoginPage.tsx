import { useState } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MessageCircle, BookOpen, DollarSign, BarChart2, Users, CheckCircle, ArrowRight, BarChart } from 'react-feather';

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center -mt-16">
            <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
              Train your <span className="text-blue-600">technicals</span>.
            </h1>
            <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
              Nail your <span className="underline decoration-blue-600">interview</span>.
            </h1>
            <p className="mt-3 text-xl font-light text-gray-500">
              InterviewGPT
            </p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex justify-center -mt-32">
          <div className="text-center opacity-0 animate-fadeIn">
            <button
              onClick={handleGoogleSignIn}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 mr-4"
            >
              Start now, for free
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="pb-16">
          {/* Subheading */}
          <div className="text-center mt-48 mb-24">
            <h2 className="text-4xl font-light text-gray-900">
              Your personal mock interviewer
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-16">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <BarChart className="w-12 h-12 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment Banking</h3>
                  <p className="text-gray-500 text-lg">
                    Master technicals, LBO modeling, and valuation concepts with real-time feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Consulting</h3>
                  <p className="text-gray-500 text-lg">
                    Practice case interviews, frameworks, and market sizing with expert guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="mt-48">
            <div className="text-center mb-24">
              <h2 className="text-4xl font-light text-gray-900">
                <span className="text-blue-60">Excess returns</span> per unit of studying
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">1000+ Free Questions</h3>
                  <p className="mt-2 text-gray-500">
                    Access our comprehensive library of technical and behavioral questions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BarChart2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Performance Tracking</h3>
                  <p className="mt-2 text-gray-500">
                    Track your progress and identify areas for improvement.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Feedback</h3>
                  <p className="mt-2 text-gray-500">
                    Get instant feedback on your answers and improve in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-48">
            <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">
              Simple, transparent pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-24">
              {/* Free Tier */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-light">$0</span>
                    <span className="text-gray-500 ml-2">forever</span>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  <p className="text-gray-600 text-center">Perfect for getting started with interview prep</p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Up to 1000 questions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">All question types</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Basic analytics</span>
                    </li>
                  </ul>
                </div>
                <button onClick={handleGoogleSignIn} className="w-full mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" >
                  Get started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 ring-1 ring-blue-500 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-light">$10</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  <p className="text-gray-600 text-center">For serious interview preparation</p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Unlimited questions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Priority support</span>
                    </li>
                  </ul>
                </div>
                <button 
                  className="w-full mt-8 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Coming soon
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Enterprise</h3>
                  <div className="mt-4">
                    <span className="text-2xl text-gray-600">Custom pricing</span>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  <p className="text-gray-600 text-center">For organizations and teams</p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Team management</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Dedicated support</span>
                    </li>
                  </ul>
                </div>
                <button 
                  className="w-full mt-8 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Coming soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Members */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
              <ul className="space-y-3">
                <li><a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a></li>
                <li><a href="/support" className="text-gray-600 hover:text-gray-900">Urgent Support</a></li>
              </ul>
            </div>

            {/* Jaimy */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AlphaEd</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-600 hover:text-gray-900">Home</a></li>
                <li><a href="/security" className="text-gray-600 hover:text-gray-900">Security</a></li>
                <li><a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="/wiki" className="text-gray-600 hover:text-gray-900">Wiki</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="/integrations" className="text-gray-600 hover:text-gray-900">Integrations</a></li>
                <li><a href="/support" className="text-gray-600 hover:text-gray-900">Support</a></li>
                <li><a href="/blog" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-600 hover:text-gray-900">About us</a></li>
                <li><a href="/careers" className="text-gray-600 hover:text-gray-900">Careers</a></li>
                <li><a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-500">© 2024 AlphaEd Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="https://linkedin.com" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;