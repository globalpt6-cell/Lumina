
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { VocabularyWord } from '../types';
import { Loader2, Volume2, Sparkles, RefreshCw, Trophy } from 'lucide-react';

export const VocabularySection: React.FC = () => {
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const fetchWord = async () => {
    setLoading(true);
    try {
      const res = await geminiService.getWordOfTheDay();
      setWord(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  const handleSpeak = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const base64 = await geminiService.speakText(text);
      if (base64) await playAudio(base64);
    } catch (error) {
      console.error(error);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden text-center p-8 relative">
        <div className="absolute top-4 left-4">
           <Trophy className="w-6 h-6 text-amber-400" />
        </div>
        
        <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-8 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Word of the Day
        </h2>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-medium italic">Finding a great word for you...</p>
          </div>
        ) : word ? (
          <div className="animate-in zoom-in duration-300">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-4">
                {word.partOfSpeech}
              </span>
              <h1 className="text-5xl font-black text-slate-800 mb-6">{word.word}</h1>
            </div>

            <div className="flex justify-center gap-4 mb-10">
              <button
                onClick={() => handleSpeak(word.word)}
                disabled={speaking}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {speaking ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>

            <div className="space-y-6 text-left border-t border-slate-100 pt-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Definition</h4>
                <p className="text-slate-700 text-xl font-medium leading-relaxed">
                  {word.definition}
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 not-italic">Example</h4>
                <p className="text-slate-600 text-lg">"{word.example}"</p>
              </div>
            </div>

            <button
              onClick={fetchWord}
              className="mt-12 flex items-center gap-2 text-indigo-500 font-bold hover:text-indigo-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Get a Different Word
            </button>
          </div>
        ) : null}
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
            <p className="text-slate-600 text-sm">Read the word and its definition out loud.</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">2</div>
            <p className="text-slate-600 text-sm">Try using this word in a sentence today!</p>
         </div>
      </div>
    </div>
  );
};
