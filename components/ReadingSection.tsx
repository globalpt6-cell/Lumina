
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { ReadingSimplification } from '../types';
import { ReadingPractice } from './ReadingPractice';
import { Loader2, Volume2, BookOpen, ChevronRight, FileText, HelpCircle, Mic } from 'lucide-react';

export const ReadingSection: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [data, setData] = useState<ReadingSimplification | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);

  const handleSimplify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await geminiService.simplifyReading(input);
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Error processing text.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Reading Assistant
        </h2>
        <p className="text-slate-600 mb-6">Paste a difficult article or document. I'll break it down into simple language for you.</p>
        
        <textarea
          className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-lg"
          placeholder="Paste text you want to read..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSimplify}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
            Make It Simple
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-inner">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Simple Version
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSpeak(data.simpleVersion)}
                  disabled={speaking}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  {speaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  Read To Me
                </button>
                <button
                  onClick={() => setIsPracticing(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Mic className="w-4 h-4" />
                  Practice Reading Out Loud
                </button>
              </div>
            </div>
            <p className="text-indigo-900 text-lg leading-relaxed">{data.simpleVersion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Key Points</h3>
              <ul className="space-y-4">
                {data.summary.map((point, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-600">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                Vocabulary Help
              </h3>
              <div className="space-y-4">
                {data.difficultWords.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-3 last:border-0">
                    <span className="font-bold text-indigo-600 block mb-1">{item.word}</span>
                    <span className="text-slate-600 text-sm">{item.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPracticing && data && (
        <ReadingPractice 
          text={data.simpleVersion} 
          onClose={() => setIsPracticing(false)} 
        />
      )}
    </div>
  );
};
