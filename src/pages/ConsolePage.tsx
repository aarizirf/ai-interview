/**
 * Running a local relay server will allow you to hide your API key
 * and run custom logic on the server
 *
 * Set the local relay server address to:
 * REACT_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8081
 *
 * This will also require you to set OPENAI_API_KEY= in a `.env` file
 * You can run it with `npm run relay`, in parallel with `npm start`
 */
const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { 
  mergerModelInstructions, 
  lboInstructions, 
  dcfInstructions, 
  valuationInstructions, 
  enterpriseValueInstructions, 
  accountingInstructions 
} from '../utils/conversation_config.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Edit, Play, ArrowUp, ArrowDown, ArrowLeft, PieChart, BarChart, Activity, FileText } from 'react-feather';
import { Button } from '../components/button/Button';
import { Toggle } from '../components/toggle/Toggle';
import { Map } from '../components/Map';

import './ConsolePage.scss';
import { isJsxOpeningLikeElement } from 'typescript';

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

// Add this helper function to get topics based on interview type
const getTopics = (type: string) => {
  switch(type) {
    case 'merger':
      return [
        'Accretion/Dilution Analysis',
        'Deal Structures',
        'Synergy Valuation',
        'Purchase Price Allocation',
        'Transaction Impact'
      ];
    case 'lbo':
      return [
        'Leverage Analysis',
        'Debt Structuring',
        'Returns Modeling',
        'Exit Strategies',
        'PE Investment Criteria'
      ];
    case 'dcf':
      return [
        'Free Cash Flow Projections',
        'WACC Calculation',
        'Terminal Value Analysis',
        'Growth Rate Assumptions',
        'Sensitivity Analysis'
      ];
    case 'valuation':
      return [
        'Trading Comparables',
        'Precedent Transactions',
        'Public Company Analysis',
        'Industry Multiples',
        'Private Company Valuation'
      ];
    case 'enterprise':
      return [
        'Enterprise vs Equity Value',
        'Diluted Share Calculations',
        'Treatment of Debt & Cash',
        'Minority Interest',
        'Convertible Securities'
      ];
    case 'accounting':
      return [
        'Financial Statements',
        'Working Capital Analysis',
        'Cash vs Accrual',
        'GAAP vs Non-GAAP',
        'Balance Sheet Impact'
      ];
    default:
      return [];
  }
};

export function ConsolePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewType = location.state?.type || 'interview'; // fallback if no type

  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey = LOCAL_RELAY_SERVER_URL
    ? ''
    : localStorage.getItem('tmp::voice_api_key') ||
      prompt('OpenAI API Key') ||
      '';
  if (apiKey !== '') {
    localStorage.setItem('tmp::voice_api_key', apiKey);
  }

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 3; // Change to 10 when ready

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set instructions based on interview type
    const currentInstructions = 
      interviewType === 'merger' ? mergerModelInstructions :
      interviewType === 'lbo' ? lboInstructions :
      interviewType === 'dcf' ? dcfInstructions :
      interviewType === 'valuation' ? valuationInstructions :
      interviewType === 'enterprise' ? enterpriseValueInstructions :
      interviewType === 'accounting' ? accountingInstructions :
      mergerModelInstructions;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    
    // Set VAD mode from the start
    client.updateSession({
      turn_detection: { type: 'server_vad' }
    });
    
    // Update session with appropriate instructions
    client.updateSession({ instructions: currentInstructions });
    
    // Start with a contextual greeting
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello, I'm ready for my ${interviewType} interview.`,
      },
    ]);

    // Start recording immediately since we're in VAD mode
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [interviewType]);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    const items = clientRef.current?.conversation.getItems() || [];
    
    try {
      const client = clientRef.current;
      if (client) {
        client.disconnect();
      }

      const wavRecorder = wavRecorderRef.current;
      if (wavRecorder) {
        await wavRecorder.end();
      }

      const wavStreamPlayer = wavStreamPlayerRef.current;
      if (wavStreamPlayer) {
        await wavStreamPlayer.interrupt();
      }

      // Navigate to feedback page with transcript
      navigate('/feedback', {
        state: {
          transcript: items,
          interviewType: interviewType
        }
      });

    } catch (error) {
      console.error('Error during disconnect:', error);
    }

    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});
  }, [navigate, interviewType]);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  };

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#000000',
              50,
              10,
              5
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              50,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions based on interview type
    const currentInstructions = 
      interviewType === 'merger' ? mergerModelInstructions :
      interviewType === 'lbo' ? lboInstructions :
      interviewType === 'dcf' ? dcfInstructions :
      interviewType === 'valuation' ? valuationInstructions :
      interviewType === 'enterprise' ? enterpriseValueInstructions :
      interviewType === 'accounting' ? accountingInstructions :
      mergerModelInstructions;

    // Set instructions
    client.updateSession({ instructions: currentInstructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { [key: string]: any }) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      
      // Check if this is a new question from the assistant
      if (item.role === 'assistant' && 
          item.status === 'completed' && 
          item.formatted.text && 
          isQuestion(item.formatted.text)) {
        const newCount = questionCount + 1;
        setQuestionCount(newCount);
        
        // End interview if max questions reached
        if (newCount >= MAX_QUESTIONS) {
          await disconnectConversation();
          navigate('/feedback', { 
            state: { 
              transcript: items,
              interviewType: interviewType
            }
          });
        }
      }
      
      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, [interviewType]);

  /**
   * Add this function near your other handlers
   */
  const handleLeavePage = useCallback(async () => {
    if (isConnected) {
      await disconnectConversation();
    }
  }, [isConnected, disconnectConversation]);

  /**
   * Modify the back button handler
   */
  const handleBackToDashboard = async () => {
    await handleLeavePage();
    navigate('/dashboard');
  };

  /**
   * Add cleanup effect
   */
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          if (isConnected && clientRef.current) {
            await disconnectConversation();
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
      cleanup();
    };
  }, [isConnected, disconnectConversation]);

  /**
   * Add function to detect questions from AI
   */
  const isQuestion = (text: string) => {
    return text.trim().endsWith('?');
  };

  /**
   * Render the application
   */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
          
          {!LOCAL_RELAY_SERVER_URL && (
            <button
              onClick={resetAPIKey}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              API Key: {apiKey.slice(0, 3)}...
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Column - Topics */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Main Topics and Ideas
              </h2>
              <div className="space-y-3">
                {getTopics(interviewType).map((topic, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      {topic}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                {interviewType.toUpperCase()} INTERVIEW
              </h1>
            </div>

            {/* Interview Controls and Visualization */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
              {!isConnected ? (
                <button
                  onClick={connectConversation}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors gap-2"
                >
                  <Play size={24} />
                  Start Interview
                </button>
              ) : (
                <button
                  onClick={disconnectConversation}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-gray-800 text-white font-medium text-lg hover:bg-gray-900 transition-colors gap-2"
                >
                  <X size={24} />
                  End Interview
                </button>
              )}

              {/* Visualization */}
              <div className="w-full bg-white rounded-xl border border-gray-100 p-6">
                <div className="visualization-entry">
                  <canvas ref={clientCanvasRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Toggle
            defaultValue={true}
            labels={['Press to talk', 'Automatic']}
            values={['none', 'server_vad']}
            onChange={(_, value) => changeTurnEndType(value)}
          />
          
          {isConnected && canPushToTalk && (
            <button
              className={`px-6 py-3 rounded-lg font-medium ${
                isRecording 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!isConnected || !canPushToTalk}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
            >
              {isRecording ? 'Release to send' : 'Push to talk'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
