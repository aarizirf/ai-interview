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

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Play, ArrowLeft, FileText, Mic } from 'react-feather';

import './ConsolePage.scss';
import { MessageType, InterviewType } from '../utils/types';
import { getTopics } from '../utils/topics';
import { getInstructions, getQuestions } from '../utils/instructions/helper';

import Markdown from 'markdown-to-jsx'

const getInterviewTitle = (type: InterviewType): string => {
  switch (type) {
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
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [conversationTone, setConversationTone] = useState<string>('Professional');
  const [voiceSpeed, setVoiceSpeed] = useState<string>('Normal');
  const [items, setItems] = useState<any[]>([]);
  const [serverFeedback, setServerFeedback] = useState<string | undefined>(undefined);
  const [isVad, setIsVad] = useState<boolean>(true);

  useEffect(() => {
    console.log("Do this once")
    if (!isConnected) {
      handleConnectWebSocket();
    }
  }, []);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    let serverUrl = "wss://ws1.aarizirfan.com";

    if (window.location.hostname === 'localhost') {
      console.log("Running locally");
       // serverUrl = "ws://localhost:8080";
    }

    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = async () => {
      console.log("Connected to server");
      setIsConnected(true);
    };

    newSocket.onclose = async () => {
      setIsConnected(false);
    };

    setSocket(newSocket);
  }

  useEffect(() => {
    if (!(isClientReady && isServerReady)) return;
    const wavRecorder = wavRecorderRef.current;

    if (isVad) {
      wavRecorder.record((data) => {
        if (socket) {
          socket.send(data.mono);
        }
      });
    }

    if (!isVad) {
      wavRecorder.pause();
    }
  }, [isVad])

  const closeAudioHandlers = async () => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    wavStreamPlayer.interrupt();

    const wavRecorder = wavRecorderRef.current;
    if (wavRecorder) {
      wavRecorder.end();
    }
  }

  /* Handling Web Socket Media Event */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function handleMessage(event: MessageEvent) {
      if (typeof event.data !== "string") {
        // Handling audio blob
        const buf = await event.data.arrayBuffer();
        const wavStreamPlayer = wavStreamPlayerRef.current;

        if (!isFeedbackMode) {
          wavStreamPlayer.add16BitPCM(buf, "");
        }
      } else if (typeof event.data === "string") {
        const res = JSON.parse(event.data);
        switch (res.type) {
          case MessageType.ServerReady:
            setIsServerReady(true);
            break;
          case MessageType.Interrupt:
            wavStreamPlayerRef.current.interrupt();
            break;
          case MessageType.FeedbackComplete:
            setServerFeedback(res.feedback);
            break;
          case MessageType.ItemsUpdated:
            const batchedItems: Array<{ content: string, role: string }> = [];
            let lastRole = res.items[0].role;
            
            res.items.forEach((item: any) => {
              const content = item.content[0].transcript;
              if (!content) return;

              const role = item.role;

              if (role == lastRole) {
                batchedItems[batchedItems.length - 1].content += '\n' + content;
              } else {
                batchedItems.push({ content, role });
                lastRole = role;
              }
            });
            console.log(batchedItems, res.items);
            setItems(batchedItems);
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

    if (!isServerReady) {
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
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              80,
              2,
              3,
              true
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
              80,
              2,
              3,
              true
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

    closeAudioHandlers();

    navigate('/dashboard');
  };

  const handleClientReady = async () => {
    setIsClientReady(true);

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const wavRecorder = wavRecorderRef.current;

    await wavStreamPlayer.connect();
    await wavRecorder.begin();


    if (isVad) {
      await wavRecorder.record((data) => {
        if (socket) {
          socket.send(data.mono);
        }
      });
    }

    if (socket) {
      const payload = {
        type: MessageType.ClientReady,
        instructions: getInstructions(getQuestions(interviewType), conversationTone, voiceSpeed),
        voice: selectedVoice,
      }
      socket.send(JSON.stringify(payload));
    }
  }

  const handleEndInterview = async () => {
    setIsFeedbackMode(true);
    
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    if(isVad) {
      await wavRecorder.pause();
    }
    wavStreamPlayer.interrupt();

    const payload = {
      type: MessageType.RequestingFeedback,
      items: items
    }

    if (socket) {
      socket.send(JSON.stringify(payload));
    }
  }

  const handleStartRecording = async () => {
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.record((data) => {
      if (socket) {
        socket.send(data.mono);
        console.log("Sending data");
      }
    });
  }

  const handleStopRecording = async () => {
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
  }

  /**
   * Render the application
   */
  // if (!isConnected) {
  //   return <div className="min-h-screen flex flex-col items-center justify-center">Connecting to server...</div>;
  // }

  const header = (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => {handleBackToDashboard()}}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (isFeedbackMode) {
    return (
      <div className="min-h-screen flex flex-col">
        {header}

        <div className="my-10 ">
          <h1 className="text-3xl font-semibold text-gray-900 text-center">
            {getInterviewTitle(interviewType)}
          </h1>

          <p className="text-center text-gray-500">Your recent interview.</p>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 justify-center">
          {serverFeedback ? (
            <div className="p-6 ring rounded-lg bg-blue-500 shadow-lg w-full max-w-2xl h-2/6 overflow-y-auto">
              <h3 className="mb-2 font-bold text-white">Our Feedback:</h3>
              <div className="text-sm text-gray-200 [&>ul>li]:list-disc [&>ul]:list-inside">
                <Markdown options={{ forceBlock: true }}>{serverFeedback}</Markdown>
              </div>
            </div>

          ) : (
            <h1 className="text-gray-500 font-medium text-xl flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating feedback...</span>
            </h1>
          )}

          <div className="w-full max-w-2xl mx-auto mt-8 grid grid-cols-1 divide-y divide-gray-100">

            {items.map((item, index) => item.content && (
              <button key={index} className="py-4 px-2 hover:bg-gray-100 text-left" onClick={() => {
                navigator.clipboard.writeText(item.content)
              }}>
                <p className="text-gray-700 font-mono text-sm">
                  <strong>{item.role === 'assistant' ? 'Interviewer' : 'You'}: </strong>
                  <span>{item.content ? item.content : '(truncated)'}</span>
                </p>
                
              </button>
            ))}

          </div>
        </div>

      </div>
    )
  }


  return (
    <div className="min-h-screen flex flex-col">
      {header}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 justify-center">

        {/* Topics as badges */}
        {/* Title Section */}
        <div className="mb-0">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 text-center">
            {getInterviewTitle(interviewType)}
          </h1>
        </div>

        <div className="flex flex-row gap-2 flex-wrap py-2 max-w-xl mx-auto justify-center rounded-lg">
          {getTopics(interviewType).map((topic, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap"
            >
              {topic}
            </div>
          ))}
        </div>


        {/* Center Column - Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center mt-8">
          {/* Interview Controls and Visualization */}
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
            <div className="w-full flex justify-end">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm text-gray-600">Push to Talk</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={(e) => setIsVad(!e.target.checked)}
                    checked={!isVad}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {!isClientReady && (
              <div className="w-full">
                <div className="mb-12 space-y-4 w-full">
                  <div className="flex flex-col gap-2 w-full">
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
                  onClick={() => { handleClientReady() }}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors gap-2"
                >
                  <Play size={24} />
                  Start Interview
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Visualization */}
        <div className="min-w-md max-w-2xl">
          <div className="visualization-entry min-w-2xl justify-center flex my-20">
            <canvas ref={clientCanvasRef} />
            <canvas ref={serverCanvasRef} />
          </div>

          <div className="flex justify-start space-x-4">
            {isClientReady && (!isServerReady ? (
              <button
                disabled
                className="inline-flex items-center px-8 py-4 rounded-lg text-gray-400 font-medium text-lg cursor-not-allowed gap-2"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </button>
            ) : (
              <>
                <button
                  onClick={() => { handleEndInterview() }}
                  className="inline-flex items-center px-8 py-4 rounded-lg border border-gray-50 border-2 text-red-800 font-medium text-lg hover:bg-gray-50 transition-colors gap-2"
                >
                  <X size={24} />
                  End Interview
                </button>

              </>
            ))}

            {!isVad && (
              <button
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                className="inline-flex items-center px-8 py-4 rounded-lg text-white font-medium text-lg gap-2 bg-blue-500 hover:bg-blue-400 transition-colors"
              >
                <Mic size={24} />
                Push to talk
              </button>
            )}
          </div>

          {items.length > 0 && items.filter(item => item.role === 'assistant').slice(-1).map((item, index) => (
            <div key={index} className="mt-4 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Interviewer</div>
              <div className="text-gray-700">{item.content}</div>
            </div>
          ))}


        </div>
      </div>
    </div>

  );
}
