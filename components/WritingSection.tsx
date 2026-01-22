
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { WritingFeedback } from '../types';
import { Loader2, CheckCircle2, Copy, Sparkles, MessageSquare } from 'lucide-react';

export const WritingSection: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await geminiService.getWritingFeedback(input);
      setFeedback(result);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Writing Assistant
        </h2>
        <p className="text-slate-600 mb-6">Type anything—an email, a text message, or a note. I'll help you make it clear and correct.</p>
        
        <textarea
          className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-lg"
          placeholder="Type your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Check My Writing
          </button>
        </div>
      </div>

      {feedback && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Corrected Version
              </h3>
              <p className="text-emerald-900 text-lg leading-relaxed mb-4">{feedback.correctedText}</p>
              <button 
                onClick={() => copyToClipboard(feedback.correctedText)}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Why these changes?</h3>
              <ul className="space-y-2">
                {feedback.explanations.map((exp, idx) => (
                  <li key={idx} className="text-slate-600 flex gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Alternative Tones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Professional', text: feedback.variations.professional, icon: '💼' },
                { label: 'Friendly', text: feedback.variations.friendly, icon: '😊' },
                { label: 'Extra Simple', text: feedback.variations.simple, icon: '✨' }
              ].map((v, idx) => (
                <div key={idx} className="flex flex-col h-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="text-xl">{v.icon}</span> {v.label}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(v.text)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-600 text-sm flex-grow leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
