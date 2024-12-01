import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder } from '../lib/wavtools/index.js';
import { WavStreamPlayer } from '../lib/wavtools/index.js';

export interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export class ClientService {
  private client: RealtimeClient;
  private wavRecorder: WavRecorder;
  private wavStreamPlayer: WavStreamPlayer;
  private isConnected: boolean = false;

  constructor(apiKey: string, localRelayServerUrl: string = '') {
    this.wavRecorder = new WavRecorder({ sampleRate: 24000 });
    this.wavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });
    
    this.client = new RealtimeClient(
      localRelayServerUrl
        ? { url: localRelayServerUrl }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    );
  }

  async connect(instructions: string, onEvent: (event: RealtimeEvent) => void, onConversationUpdate: (data: any) => void) {
    try {
      if (this.isConnected) {
        console.warn('Already connected');
        return;
      }

      // Connect to microphone
      await this.wavRecorder.begin();

      // Connect to audio output
      await this.wavStreamPlayer.connect();

      // Connect to realtime API
      await this.client.connect();
      this.isConnected = true;
      
      // Set VAD mode from the start
      this.client.updateSession({
        turn_detection: { type: 'server_vad' }
      });
      
      // Update session with appropriate instructions
      this.client.updateSession({ instructions });
      
      // Set transcription
      this.client.updateSession({ 
        input_audio_transcription: { model: 'whisper-1' } 
      });

      // Handle realtime events
      this.client.on('realtime.event', onEvent);

      // Handle conversation updates (for audio playback and transcripts)
      this.client.on('conversation.updated', async ({ item, delta }: any) => {
        if (delta?.audio) {
          this.wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
        onConversationUpdate({ item, delta });
      });

      // Handle interruptions
      this.client.on('conversation.interrupted', async () => {
        const trackSampleOffset = await this.wavStreamPlayer.interrupt();
        if (trackSampleOffset?.trackId) {
          const { trackId, offset } = trackSampleOffset;
          await this.client.cancelResponse(trackId, offset);
        }
      });

      // Start recording immediately since we're in VAD mode
      await this.wavRecorder.record((data) => this.client.appendInputAudio(data.mono));

    } catch (error) {
      this.isConnected = false;
      console.error('Error during connect:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (!this.isConnected) {
        console.warn('Already disconnected');
        return [];
      }

      // First get the items before disconnecting anything
      const items = this.client.conversation.getItems();

      // Then stop recording - only if it's active
      if (this.wavRecorder && this.wavRecorder.getStatus() === 'recording') {
        await this.wavRecorder.pause();
      }

      // Then stop playback
      if (this.wavStreamPlayer) {
        await this.wavStreamPlayer.interrupt();
      }

      // Finally disconnect everything
      if (this.wavRecorder) {
        await this.wavRecorder.end();
      }
      
      if (this.client) {
        this.client.disconnect();
      }

      this.isConnected = false;
      return items;
    } catch (error) {
      this.isConnected = false;
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  async startRecording() {
    try {
      // Make sure recorder is ready
      if (this.wavRecorder.getStatus() === 'ended') {
        await this.wavRecorder.begin();
      }

      // First check if we're already recording
      if (this.wavRecorder.getStatus() === 'recording') {
        await this.wavRecorder.pause();
      }

      const trackSampleOffset = await this.wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await this.client.cancelResponse(trackId, offset);
      }
      await this.wavRecorder.record((data) => this.client.appendInputAudio(data.mono));
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      if (this.wavRecorder.getStatus() === 'recording') {
        await this.wavRecorder.pause();
        this.client.createResponse();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  async changeTurnEndType(value: string) {
    // If switching to manual mode or already recording, stop recording
    if ((value === 'none' || this.wavRecorder.getStatus() === 'recording')) {
      await this.wavRecorder.pause();
    }

    // Update the session mode
    this.client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' }
    });

    // Only auto-start recording if in VAD mode
    if (value === 'server_vad' && this.client.isConnected()) {
      await this.wavRecorder.record((data) => this.client.appendInputAudio(data.mono));
    }
  }

  getItems(): ItemType[] {
    return this.client.conversation.getItems();
  }

  deleteItem(id: string) {
    this.client.deleteItem(id);
  }

  getWavRecorder() {
    return this.wavRecorder;
  }

  getWavStreamPlayer() {
    return this.wavStreamPlayer;
  }

  addTool(toolConfig: any, handler: (params: any) => Promise<any>) {
    this.client.addTool(toolConfig, handler);
  }

  onConversationInterrupted(callback: () => void) {
    this.client.on('conversation.interrupted', callback);
  }

  onConversationUpdated(callback: (data: any) => void) {
    this.client.on('conversation.updated', callback);
  }

  onError(callback: (error: any) => void) {
    this.client.on('error', callback);
  }

  reset() {
    this.client.reset();
  }

  async startSession(interviewType: string) {
    // Send contextual greeting based on interview type
    await this.client.sendUserMessageContent([
      {
        type: 'input_text',
        text: `Hello, I'm ready for my ${interviewType} interview.`,
      },
    ]);
  }

  // Update the cleanup method
  cleanup() {
    if (this.isConnected) {
      this.disconnect();
    }
    
    // Remove all event listeners we set up
    this.client.off('realtime.event');
    this.client.off('conversation.updated');
    this.client.off('conversation.interrupted');
    this.client.off('error');
  }

  removeTool(name: string) {
    this.client.removeTool(name);
  }
} 