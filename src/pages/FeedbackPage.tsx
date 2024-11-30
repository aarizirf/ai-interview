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

  // Helper function to combine consecutive user messages
  const combineConsecutiveUserMessages = (transcript: any[]) => {
    return transcript
      .filter((item: any) => {
        const content = item.formatted.text || item.formatted.transcript;
        return content && content.trim().length > 0;
      })
      .reduce((acc: any[], item: any, index: number, array: any[]) => {
        const prevItem = array[index - 1];
        const prevCombinedItem = acc[acc.length - 1];

        if (
          item.role === 'user' && 
          prevItem?.role === 'user' && 
          prevCombinedItem?.role === 'user'
        ) {
          // Combine with previous user message
          prevCombinedItem.messages.push({
            id: item.id,
            content: item.formatted.text || item.formatted.transcript
          });
          return acc;
        } else {
          // Create new item
          const newItem = {
            role: item.role,
            messages: [{
              id: item.id,
              content: item.formatted.text || item.formatted.transcript
            }]
          };
          return [...acc, newItem];
        }
      }, []);
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
          <h1 className='text-3xl font-extrabold tracking-tight text-gray-700'>{interviewType.toUpperCase()} INTERVIEW TRANSCRIPT</h1>
        </div>
      </div>

      <div className="transcript-container">
        {combineConsecutiveUserMessages(transcript).map((item: any, index: number) => (
          <div 
            key={index}
            className={`transcript-item ${item.role}`}
          >
            <div className="card-header">
              <div className="speaker-label">
                {item.role === 'user' ? 'You' : 'Interviewer'}
              </div>
              {item.role === 'user' && (
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(
                    item.messages.map((m: any) => m.content).join('\n\n'),
                    item.messages[0].id
                  )}
                >
                  {copiedId === item.messages[0].id ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedId === item.messages[0].id ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="content">
              {item.messages.map((message: any, msgIndex: number) => (
                <div key={message.id} className={msgIndex > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 