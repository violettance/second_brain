import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Crown, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { enhanceSpeechText } from '../lib/gemini';

interface CompactVoiceRecorderProps {
  onTextUpdate: (text: string) => void;
  isProUser?: boolean;
  onUpgradeClick?: () => void;
  disabled?: boolean;
  theme?: 'short-term' | 'long-term';
  enableAI?: boolean; // New prop to control AI enhancement
  recordingTimeout?: number; // Configurable timeout in seconds
  language?: 'tr-TR' | 'en-US'; // Language setting from app-wide settings
}

export const CompactVoiceRecorder: React.FC<CompactVoiceRecorderProps> = ({
  onTextUpdate,
  isProUser = false,
  onUpgradeClick,
  disabled = false,
  theme = 'short-term',
  enableAI = false, // Default to false for faster performance
  recordingTimeout = 10, // Default 10 seconds, more time for longer dictation
  language = 'en-US' // Default to English for now, will be from app settings later
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTextRef = useRef<string>(''); // Track accumulated text
  const lastSentTextRef = useRef<string>(''); // Track what was last sent

  // Clean up speech recognition text
  const cleanSpeechText = (text: string): string => {
    if (!text || text.trim() === '') return text;
    
    return text
      // Fix random capitalization in middle of words
      .replace(/\b([a-zA-ZçğıöşüÇĞIİÖŞÜ]+)([A-ZÇĞIİÖŞÜ])([a-zA-ZçğıöşüÇĞIİÖŞÜ]+)\b/g, (match, start, middle, end) => {
        // If it's a normal word with random capital in middle, lowercase the middle part
        return start + middle.toLowerCase() + end;
      })
      // Fix random capitalization in middle of sentences (but keep sentence starts)
      .replace(/(\w)\s+([A-Z])([a-z]+)/g, (match, prevChar, firstChar, restOfWord) => {
        // Don't change if it's after sentence endings (., !, ?)
        if (/[.!?]/.test(prevChar)) {
          return match; // Keep original capitalization after sentence endings
        }
        // Otherwise, lowercase the first character
        return prevChar + ' ' + firstChar.toLowerCase() + restOfWord;
      })
      // Fix obvious speech recognition errors for common English words
      .replace(/\bAre wil wantt that\b/gi, 'Are you wanting that')
      .replace(/\bdo you KNow have harss\b/gi, 'do you know how harsh')
      .replace(/\bE süpermiş\b/gi, 'eh süpermiş')
      .replace(/\bETKi\b/gi, 'etki')
      .replace(/\bET\b/gi, 'et')
      .replace(/\bRecognize\b/g, 'recognize') // Fix specific "Recognize" issue
      // General cleanup
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();
  };

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser');
    }
  }, []);

  const startListening = () => {
    if (!isProUser && onUpgradeClick) {
      onUpgradeClick();
      return;
    }

    if (!isSupported || disabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language; // Use language from props (app-wide setting)
    recognition.maxAlternatives = 1;
    
    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscriptText('');
      // Reset refs when starting new recording
      accumulatedTextRef.current = '';
      lastSentTextRef.current = '';
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let newFinalTranscript = '';

      // Build transcript from all results
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Ensure final transcript always ends with space
          newFinalTranscript += transcript.trim() + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Clean the transcripts
      const cleanedFinalTranscript = cleanSpeechText(newFinalTranscript);
      const cleanedInterimTranscript = cleanSpeechText(interimTranscript);

      // Update accumulated final text
      accumulatedTextRef.current = cleanedFinalTranscript;
      
      // Current full text (final + interim)
      // Add space before interim if we have accumulated text and interim doesn't start with space
      const spacedInterimTranscript = cleanedInterimTranscript && accumulatedTextRef.current && !cleanedInterimTranscript.startsWith(' ') 
        ? ' ' + cleanedInterimTranscript 
        : cleanedInterimTranscript;
      
      const currentFullText = accumulatedTextRef.current + spacedInterimTranscript;
      
      // Only send new text that hasn't been sent before
      if (currentFullText !== lastSentTextRef.current) {
        setTranscriptText(currentFullText);
        
        // Calculate only the new part
        const newTextToSend = currentFullText.slice(lastSentTextRef.current.length);
        
        if (newTextToSend.trim()) {
          onTextUpdate(newTextToSend);
          lastSentTextRef.current = currentFullText;
        }
      }

      // Auto-stop after configurable timeout of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        stopListening();
        
        // Apply AI enhancement only at the end if enabled and we have final text
        if (enableAI && accumulatedTextRef.current.trim()) {
          enhanceAndSend(accumulatedTextRef.current);
        }
      }, recordingTimeout * 1000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
  };

  const enhanceAndSend = async (text: string) => {
    setIsProcessing(true);
    
    try {
      const enhancedText = await enhanceSpeechText(text);
      onTextUpdate(enhancedText);
      setTranscriptText(enhancedText);
    } catch (err) {
      console.error('Error enhancing text:', err);
      // Fallback to original text
      onTextUpdate(text);
    } finally {
      setIsProcessing(false);
    }
  };

  const getThemeColors = () => {
    if (theme === 'short-term') {
      return {
        primary: '#fb923c',
        primaryRgba: 'rgba(251, 146, 60, 0.2)',
        primaryBorder: 'rgba(251, 146, 60, 0.3)'
      };
    }
    return {
      primary: '#C2B5FC',
      primaryRgba: 'rgba(194, 181, 252, 0.2)',
      primaryBorder: 'rgba(194, 181, 252, 0.3)'
    };
  };

  const colors = getThemeColors();

  if (!isSupported) {
    return (
      <button
        className="relative flex items-center justify-center p-2 rounded-full bg-slate-700 border border-slate-600 opacity-50 cursor-not-allowed"
        title="Voice recording not supported in this browser"
        disabled
      >
        <AlertCircle className="h-4 w-4 text-red-400" />
      </button>
    );
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      disabled={disabled || isProcessing}
      className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
        isListening 
          ? 'animate-pulse' 
          : 'hover:scale-105'
      } ${
        !isProUser 
          ? 'bg-slate-700 border border-slate-600 hover:bg-slate-600' 
          : ''
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      style={
        isProUser 
          ? { 
              backgroundColor: isListening ? colors.primaryRgba : colors.primaryRgba,
              border: `1px solid ${colors.primaryBorder}`,
              color: isListening ? colors.primary : colors.primary
            }
          : {}
      }
      title={
        !isProUser 
          ? 'Voice recording is a Pro feature' 
          : isListening 
            ? `Recording... (stops after ${recordingTimeout}s of silence)` 
            : isProcessing
              ? 'Processing speech...'
              : 'Start live dictation'
      }
    >
      {!isProUser && (
        <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 bg-slate-800 rounded-full p-0.5" />
      )}
      
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className={`h-4 w-4 ${!isProUser ? 'text-slate-400' : ''}`} />
      )}
    </button>
  );
};

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
