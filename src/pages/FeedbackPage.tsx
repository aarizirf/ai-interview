import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'react-feather';
import { useState } from 'react';
import './FeedbackPage.scss';

export const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transcript, interviewType } = location.state || {};
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!transcript) {
    navigate('/dashboard');
    return null;
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div data-component="FeedbackPage" className="feedback-page">
      <div className="header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1>{interviewType} Interview Transcript</h1>
        </div>
      </div>

      <div className="transcript-container">
        {transcript
          .filter((item: any) => {
            const content = item.formatted.text || item.formatted.transcript;
            return content && content.trim().length > 0;  // Only show items with non-empty content
          })
          .map((item: any) => (
            <div 
              key={item.id}
              className={`transcript-item ${item.role}`}
            >
              <div className="card-header">
                <div className="speaker-label">
                  {item.role === 'user' ? 'You' : 'Interviewer'}
                </div>
                {item.role === 'user' && (
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(item.formatted.text || item.formatted.transcript, item.id)}
                  >
                    {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div className="content">
                {item.formatted.text || item.formatted.transcript}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}; 