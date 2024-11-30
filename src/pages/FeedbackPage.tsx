import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transcript, interviewType } = location.state || {};
  const [selectedResponses, setSelectedResponses] = useState<{[key: string]: boolean}>({});

  if (!transcript) {
    navigate('/dashboard');
    return null;
  }

  const toggleResponseSelection = (id: string) => {
    setSelectedResponses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="feedback-page">
      <h1 className="text-3xl font-bold mb-6">Feedback on {interviewType} Interview</h1>
      
      <div className="transcript-container">
        {transcript.map((item: any) => {
          const isUserResponse = item.role === 'user';
          return (
            <div 
              key={item.id}
              className={`transcript-item ${isUserResponse ? 'user-response' : 'interviewer-question'} ${
                selectedResponses[item.id] ? 'selected' : ''
              }`}
              onClick={() => isUserResponse && toggleResponseSelection(item.id)}
            >
              <div className="speaker-label">
                {item.role === 'user' ? 'You' : 'Interviewer'}:
              </div>
              <div className="content">
                {item.formatted.text || item.formatted.transcript}
              </div>
            </div>
          );
        })}
      </div>

      <div className="actions">
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}; 