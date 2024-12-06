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

import { X, Play, ArrowLeft, FileText } from 'react-feather';

import './ConsolePage.scss';
import { MessageType, InterviewType } from '../utils/types';
import { getTopics } from '../utils/topics';
import { getInstructions } from '../utils/instructions/helper';

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

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

  const currentInstructions = getInstructions(interviewType);

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
  const [isReadyForInterview, setIsReadyForInterview] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket(){
    let serverUrl = "wss://ws1.aarizirfan.com";

    if(window.location.hostname === 'localhost') {
      console.log("Running locally");
      // serverUrl = "ws://localhost:8080";
    }

    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = async () => {
      console.log("Connected to server");
      setIsConnected(true);

      newSocket.send(JSON.stringify({
        type: "send-user-message",
        instructions: currentInstructions
      }))
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
    async function handleMessage(event: MessageEvent) {
      console.log("Received message from server", typeof event.data);
      console.log("is ready for interview", isReadyForInterview);

      if(typeof event.data === "string") {
        const obj = JSON.parse(event.data);
        console.log("Received message from server", obj);
        switch(obj.type) {
          case "interrupt":
            wavStreamPlayerRef.current.interrupt();
            break;
          case "ready-for-interview":
            const wavStreamPlayer = wavStreamPlayerRef.current;
            const wavRecorder = wavRecorderRef.current;

            await wavStreamPlayer.connect();
            await wavRecorder.begin();

            setIsReadyForInterview(true);

            if (socket) {
              await wavRecorder.record((data) => {
                socket.send(data.mono)
                console.log("Sending audio data to server");
              });
            }
            break;
          default:
            console.log("Received unknown message from server", obj);
        }
      } else if (isReadyForInterview) {
        // Handling audio blob
        const buf = await event.data.arrayBuffer();
        console.log("PLAYING 16 BIT PCM");

        const wavStreamPlayer = wavStreamPlayerRef.current;
        wavStreamPlayer.add16BitPCM(buf, "");
      }
    }
    
    if (socket) {
      socket.onmessage = handleMessage;
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [socket, isReadyForInterview]);


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

  const handleBackToDashboard = async () => {
    if (socket) {
      socket.close();
    }
    navigate('/dashboard');
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
              <h1 className="text-4xl font-light text-gray-900 mb-4">
                {getInterviewTitle(interviewType)}
              </h1>
            </div>

            {/* Interview Controls and Visualization */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
              {!isConnected ? (
                <button
                  onClick={handleConnectWebSocket}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors gap-2"
                >
                  <Play size={24} />
                  Start Interview
                </button>
              ) : !isReadyForInterview ? (
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
                <button
                  onClick={() => {
                    if (socket) {
                      socket.close();
                      setIsConnected(false);
                    }
                  }}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-gray-800 text-white font-medium text-lg hover:bg-gray-900 transition-colors gap-2"
                >
                  <X size={24} />
                  End Interview
                </button>
              )}

              {/* Visualization */}
              <div className="visualization-entry">
                <canvas ref={clientCanvasRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
