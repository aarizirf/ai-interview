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

import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Play, ArrowLeft, FileText } from 'react-feather';

import './ConsolePage.scss';
import { MessageType, InterviewType } from '../utils/types';
import { getTopics } from '../utils/topics';
import { getInstructions } from '../utils/instructions/helper';

const getInterviewTitle = (type: InterviewType): string => {
  switch(type) {
    case InterviewType.Merger:
      return "M&A Technical Interview";
    case InterviewType.LBO:
      return "LBO Modeling Interview";
    case InterviewType.DCF:
      return "DCF Valuation Interview";
    case InterviewType.Valuation:
      return "Company Valuation Interview";
    case InterviewType.Enterprise:
      return "Enterprise Value Interview";
    case InterviewType.Accounting:
      return "Financial Accounting Interview";
    case InterviewType.General:
      return "Investment Banking Interview";
    default:
      return "Technical Interview";
  }
};

export function ConsolePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewType = location.state?.type || InterviewType.General; // fallback if no type
  const [socket, setSocket] = useState<WebSocket | null>(null);

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   */
  const [isConnected, setIsConnected] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const [conversationTone, setConversationTone] = useState<string>('Professional');
  const [voiceSpeed, setVoiceSpeed] = useState<string>('Normal');

  useEffect(() => {
    if(!isConnected) {
      handleConnectWebSocket();
    }
  }, []);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket(){
    let serverUrl = "wss://ws1.aarizirfan.com";

    if(window.location.hostname === 'localhost') {
      console.log("Running locally");
      serverUrl = "ws://localhost:8080";
    }

    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = async () => {
      console.log("Connected to server");
      setIsConnected(true);
    };

    newSocket.onclose = async () => {
      setIsConnected(false);

      const wavStreamPlayer = wavStreamPlayerRef.current;
      await wavStreamPlayer.interrupt();

      const wavRecorder = wavRecorderRef.current;
      if (wavRecorder) {
        await wavRecorder.end();
      }
    };

    setSocket(newSocket);
  }

  /* Handling Web Socket Media Event */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function handleMessage(event: MessageEvent) {
      if(typeof event.data !== "string") {
        // Handling audio blob
        const buf = await event.data.arrayBuffer();
        const wavStreamPlayer = wavStreamPlayerRef.current;
        wavStreamPlayer.add16BitPCM(buf, "");
      } else if(typeof event.data === "string") {
        const res = JSON.parse(event.data);
        switch(res.type) {
          case MessageType.ServerReady:
            const wavStreamPlayer = wavStreamPlayerRef.current;
            const wavRecorder = wavRecorderRef.current;

            await wavStreamPlayer.connect();
            await wavRecorder.begin();

            setIsServerReady(true);

            if (socket) {
              // timeoutId = setTimeout( () => {
                await wavRecorder.record((data) => {
                  socket.send(data.mono)
                });
              // }, 2000);
            }

            break;
          case MessageType.Interrupt:
            wavStreamPlayerRef.current.interrupt();
            break;
        }
      }
    }
    
    if (socket) {
      socket.onmessage = handleMessage;
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
      }
      clearTimeout(timeoutId);
    };
  }, [socket, isServerReady]);


  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    if(!isServerReady) {
      return;
    }

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
            const clientResult = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };

            const serverResult = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };

            let result: Float32Array = new Float32Array(serverResult.values.length);

            serverResult.values.forEach((value, index) => {
              result[index] = (value + clientResult.values[index]);
            });
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result,
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
  }, [isServerReady]);

  const handleBackToDashboard = async () => {
    if (socket) {
      socket.close();
    }

    navigate('/dashboard');
  };

  

  const handleClientReady = () => {
    setIsClientReady(true);

    if (socket) {
      const payload = {
        type: MessageType.ClientReady,
        instructions: getInstructions(interviewType, conversationTone, voiceSpeed),
        voice: selectedVoice,
      }
      console.log(payload);
      socket.send(JSON.stringify(payload));
    }
  }

  const handleEndInterview = async () => {
    if (socket) {
      socket.close();
      // setIsConnected(false);
    }
  }

  /**
   * Render the application
   */
  if(!isConnected) {
    return <div className="min-h-screen flex flex-col items-center justify-center">Connecting to server...</div>;
  }


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
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Title Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                {getInterviewTitle(interviewType)}
              </h1>
            </div>

            

            {/* Interview Controls and Visualization */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
              {!isClientReady ? (
                <div>
            <div className="w-full max-w-md mb-12 space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="voice-select" className="text-sm font-medium text-gray-700">
                  Select Voice
                </label>
                <select
                  id="voice-select"
                  className="block w-full rounded-md border border-gray-300 p-1 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                  }}
                  value={selectedVoice}
                >
                  {['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'].map((voice) => (
                    <option key={voice} value={voice}>
                      {voice.charAt(0).toUpperCase() + voice.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="tone-select" className="text-sm font-medium text-gray-700">
                  Conversation Tone
                </label>
                <select
                  id="tone-select"
                  className="block w-full rounded-md border border-gray-300 p-1 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  onChange={(e) => {
                    setConversationTone(e.target.value);
                  }}
                  value={conversationTone}
                >
                  {['Professional', 'Warm', 'Helpful'].map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="speed-select" className="text-sm font-medium text-gray-700">
                  Voice Speed
                </label>
                <select
                  id="tone-select"
                  className="block w-full rounded-md border border-gray-300 p-1 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  onChange={(e) => {
                    setVoiceSpeed(e.target.value);
                  }}
                  value={voiceSpeed}
                >
                  {['Slow', 'Normal', 'Fast'].map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}
                    </option>
                  ))}
                </select>
              </div>
              </div>  
                <button
                  onClick={() => {handleClientReady()}}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors gap-2"
                >
                  <Play size={24} />
                  Start Interview
                </button>
                </div>
              ) : !isServerReady ? (
                <button
                  disabled
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-gray-400 text-white font-medium text-lg cursor-not-allowed gap-2"
                >
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {handleEndInterview()}}
                    className="inline-flex items-center px-8 py-4 rounded-lg bg-gray-800 text-white font-medium text-lg hover:bg-gray-900 transition-colors gap-2"
                  >
                    <X size={24} />
                    End Interview
                  </button>
                  {/* Visualization */}
                  <div className="visualization-entry">
                    <canvas ref={clientCanvasRef} />
                    {/* <canvas ref={serverCanvasRef} /> */}
                  </div>
                </>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
