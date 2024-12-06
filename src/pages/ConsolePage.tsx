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

export function ConsolePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewType = location.state?.type || InterviewType.General; // fallback if no type
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const currentInstructions = getInstructions(interviewType);
  console.log("Current Instructions", currentInstructions);

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
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   */
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  const sendSocket = (type: MessageType, payload: Object) => {
    if (socket) {
      const message = {
        type,
        payload
      };
      socket.send(JSON.stringify(message));
      console.log(`Sent ${type} message:`, message);
    } else {
      console.warn('Socket not connected');
    }
  };

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket(){

    let serverUrl = "wss://ws1.aarizirfan.com";

    if(window.location.hostname === 'localhost') {
      serverUrl = "ws://localhost:8080";
    }
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = async () => {
      console.log("Connected to socket, sending instructions", currentInstructions);
      sendSocket(MessageType.SendUserMessage, currentInstructions);
      
      const wavStreamPlayer = wavStreamPlayerRef.current;
      const wavRecorder = wavRecorderRef.current;

      await wavStreamPlayer.connect();
      await wavRecorder.begin();

      await wavRecorder.record((data) => {
        newSocket.send(data.mono)
      });
    };

    newSocket.onclose = async () => {
      console.log("Disconnected");

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
      if(typeof event.data === "string") {
        const obj = JSON.parse(event.data);
        switch(obj.type) {
          case "interrupt":
            wavStreamPlayerRef.current.interrupt();
            break;
        }
      } else {
        // Handling audio blob
        const buf = await event.data.arrayBuffer();

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
  }, [socket]);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  

  // /**
  //  * In push-to-talk mode, start recording
  //  * .appendInputAudio() for each sample
  //  */
  // const startRecording = async () => {
  //   setIsRecording(true);
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   const wavStreamPlayer = wavStreamPlayerRef.current;
  //   const trackSampleOffset = await wavStreamPlayer.interrupt();
  //   if (trackSampleOffset?.trackId) {
  //     const { trackId, offset } = trackSampleOffset;
  //     await client.cancelResponse(trackId, offset);
  //   }
  //   await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  // };

  // /**
  //  * In push-to-talk mode, stop recording
  //  */
  // const stopRecording = async () => {
  //   setIsRecording(false);
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   await wavRecorder.pause();
  //   client.createResponse();
  // };

  // /**
  //  * Switch between Manual <> VAD mode for communication
  //  */
  // const changeTurnEndType = async (value: string) => {
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   if (value === 'none' && wavRecorder.getStatus() === 'recording') {
  //     await wavRecorder.pause();
  //   }
  //   client.updateSession({
  //     turn_detection: value === 'none' ? null : { type: 'server_vad' },
  //   });
  //   if (value === 'server_vad' && client.isConnected()) {
  //     await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  //   }
  //   setCanPushToTalk(value === 'none');
  // };


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
   * Add this function near your other handlers
   */
  // const handleLeavePage = useCallback(async () => {
  //   if (isConnected) {
  //     await disconnectConversation();
  //   }
  // }, [isConnected, disconnectConversation]);

  /**
   * Modify the back button handler
   */
  const handleBackToDashboard = async () => {
    // await handleLeavePage();
    if (socket) {
      socket.close();
      setIsConnected(false);
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
              <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                {interviewType.toUpperCase()} INTERVIEW
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
              <div className="w-full bg-white rounded-xl border border-gray-100 p-6">
                <div className="visualization-entry">
                  <canvas ref={clientCanvasRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
