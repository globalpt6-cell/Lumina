
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { createPcmBlob } from '../services/audioService';
import { Mic, MicOff, Loader2, X, RefreshCw, AlertCircle } from 'lucide-react';

interface ReadingPracticeProps {
  text: string;
  onClose: () => void;
}

export const ReadingPractice: React.FC<ReadingPracticeProps> = ({ text, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [matchedWords, setMatchedWords] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      sessionPromiseRef.current = geminiService.connectLiveReading(text, {
        onTranscription: (newText, isUser) => {
          if (isUser) {
            setTranscription(prev => prev + ' ' + newText);
            updateWordTracking(newText);
          }
        },
        onError: (e) => {
          console.error(e);
          setError("Connection lost. Please try again.");
          stopRecording();
        }
      });

      scriptProcessorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        sessionPromiseRef.current?.then((session: any) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or error starting session.");
    }
  };

  const stopRecording = () => {
    scriptProcessorRef.current?.disconnect();
    audioContextRef.current?.close();
    sessionPromiseRef.current?.then((session: any) => session.close());
    setIsRecording(false);
  };

  const updateWordTracking = (newTranscript: string) => {
    const spokenWords = newTranscript.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
    
    setMatchedWords(prev => {
      const next = new Set(prev);
      words.forEach((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        if (spokenWords.some(sw => sw.includes(cleanWord) || cleanWord.includes(sw))) {
          next.add(index);
        }
      });
      return next;
    });
  };

  const reset = () => {
    stopRecording();
    setTranscription('');
    setMatchedWords(new Set());
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
            Reading Practice
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-8 overflow-y-auto text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Read the text below out loud</p>
          
          <div className="text-2xl md:text-3xl leading-relaxed font-medium text-slate-700 select-none">
            {words.map((word, idx) => (
              <span 
                key={idx} 
                className={`inline-block mx-1.5 transition-all duration-300 ${
                  matchedWords.has(idx) 
                    ? 'text-emerald-500 font-bold' 
                    : isRecording ? 'text-slate-400' : 'text-slate-700'
                }`}
              >
                {word}
              </span>
            ))}
          </div>

          {transcription && (
            <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">What I heard:</p>
              <p className="text-slate-500 text-sm italic">"{transcription.trim()}"</p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center justify-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 group"
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                <MicOff className="w-8 h-8" />
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center text-slate-400">
             <button onClick={reset} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-4 h-4" /> Reset
             </button>
             <p className="text-xs font-medium italic">
                {isRecording ? "Listening..." : "Click the mic to start reading"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
