import { useRef, useState, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { ClientService } from '../services/ClientService';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';

const LOCAL_RELAY_SERVER_URL: string = process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

interface UseRealtimeClientProps {
  onQuestionAsked: () => void;
  onDisconnect: (items: ItemType[]) => void;
}

export function useRealtimeClient({ onQuestionAsked, onDisconnect }: UseRealtimeClientProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [items, setItems] = useState<ItemType[]>([]);

  const clientServiceRef = useRef<ClientService>(
    new ClientService(
      localStorage.getItem('tmp::voice_api_key') || '',
      LOCAL_RELAY_SERVER_URL
    )
  );

  // Helper function to check if text is a question
  const isQuestion = useCallback((text: string) => {
    return text.trim().endsWith('?');
  }, []);

  // Connect conversation
  const connectConversation = useCallback(async (instructions: string) => {
    await clientServiceRef.current.connect(
      instructions,
      (event) => {}, // Event handler for realtime events
      ({ item, delta }) => {
        if (item.role === 'assistant' && 
            item.status === 'completed' && 
            item.formatted.text && 
            isQuestion(item.formatted.text)) {
          onQuestionAsked();
        }
        setItems(clientServiceRef.current.getItems());
      }
    );
    setIsConnected(true);
    setItems(clientServiceRef.current.getItems());
  }, [isQuestion, onQuestionAsked]);

  // Disconnect conversation
  const disconnectConversation = useCallback(async () => {
    const items = clientServiceRef.current.getItems() || [];
    await clientServiceRef.current.disconnect();
    setIsConnected(false);
    setItems([]);
    onDisconnect(items);
  }, [onDisconnect]);

  // Handle turn end type changes
  const changeTurnEndType = useCallback(async (value: string) => {
    await clientServiceRef.current.changeTurnEndType(value);
    setCanPushToTalk(value === 'none');
  }, []);

  // Handle recording
  const startRecording = useCallback(async () => {
    await clientServiceRef.current.startRecording();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    await clientServiceRef.current.stopRecording();
    setIsRecording(false);
  }, []);

  return {
    isConnected,
    canPushToTalk,
    isRecording,
    items,
    wavRecorder: clientServiceRef.current.getWavRecorder(),
    wavStreamPlayer: clientServiceRef.current.getWavStreamPlayer(),
    connectConversation,
    disconnectConversation,
    changeTurnEndType,
    startRecording,
    stopRecording
  };
} 