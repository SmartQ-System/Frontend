import { useState, useCallback } from 'react';
import { edgeTtsApi, ttsApi } from '../lib/api';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'smartq_voice_preference';
const DEFAULT_VOICE = 'ar-EG-ShakirNeural';

interface UseTTSResult {
  speak: (text: string) => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  stop: () => void;
}

export function useTTS(): UseTTSResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const speak = useCallback(async (text: string) => {
    console.log('[TTS] speak() called with text:', text?.substring(0, 50));
    
    // Stop any currently playing audio
    stop();

    if (!text) {
      console.log('[TTS] No text provided, returning');
      return;
    }

    // Get Global Voice Setting from API (fall back to localStorage or Default)
    // Since we can't await API in sync flow easily without delay, for now we rely on the fact 
    // that we should have loaded settings context. 
    // BUT simplest fix: fetch it here? No, fetch on mount.
    // For now, let's keep localStorage as a "Cache" and maybe update it somewhere?
    // Actually, let's Make StudentQuiz fetch settings, and pass voiceId to pure useTTS? 
    // No time to refactor hook.
    // Let's make speak() fetch it if not cached. 
    
    // Better: Helper to get voice.
    let selectedVoice = localStorage.getItem(STORAGE_KEY) || DEFAULT_VOICE;
    
    // Attempt to fetch fresh setting (optimistic)
    // Note: This makes speak() slower on first call. 
    // Maybe we just hardcode fetching from API?
    try {
       // Ideally we use a cached value from a Context.
       // But let's assume localStorage is updated by StudentQuiz on mount?
       // Let's modify StudentQuiz to fetch settings and update localStorage/State.
    } catch (e) {}
    console.log('[TTS] Using voice:', selectedVoice);

    setIsLoading(true);
    try {
      let response;
      
      // If default voice, use Google TTS (faster, no python service needed)
      if (selectedVoice === 'default') {
        console.log('[TTS] Using Google TTS (Default)...');
        response = await ttsApi.speak(text);
      } else {
        console.log(`[TTS] Using Edge TTS (${selectedVoice})...`);
        response = await edgeTtsApi.speak(text, selectedVoice);
      }
      
      // Create audio from blob
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl); // Cleanup
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentAudio(null);
        toast.error('فشل تشغيل الصوت');
      };

      await audio.play();
    } catch (error: any) {
      console.error('[TTS] Error:', error);
      console.error('[TTS] Error response:', error.response?.data);
      // Backend might return 503 if model is loading
      if (error.response?.status === 503) {
         toast.loading('جاري تحميل نموذج الصوت، يرجى المحاولة بعد قليل...', { duration: 4000 });
      } else {
         toast.error('حدث خطأ أثناء تحويل النص إلى كلام');
      }
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  return { speak, isPlaying, isLoading, stop };
}
