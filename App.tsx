
import React, { useState } from 'react';
import { AppSection } from './types';
import { WritingSection } from './components/WritingSection';
import { ReadingSection } from './components/ReadingSection';
import { VocabularySection } from './components/VocabularySection';
import { PenTool, BookOpen, GraduationCap, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.WRITING);

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.WRITING:
        return <WritingSection />;
      case AppSection.READING:
        return <ReadingSection />;
      case AppSection.VOCABULARY:
        return <VocabularySection />;
      default:
        return <WritingSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Persistent on Desktop, Nav Bar on Mobile */}
      <nav className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col z-10 sticky top-0 md:h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Lumina</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Literacy Tools</p>
          </div>
        </div>

        <div className="flex-grow p-4 space-y-2 overflow-x-auto md:overflow-x-visible flex md:flex-col items-center md:items-stretch">
          <button
            onClick={() => setActiveSection(AppSection.WRITING)}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeSection === AppSection.WRITING 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <PenTool className="w-5 h-5" />
            <span className="hidden md:inline">Writing Help</span>
            <span className="md:hidden">Writing</span>
          </button>

          <button
            onClick={() => setActiveSection(AppSection.READING)}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeSection === AppSection.READING 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden md:inline">Reading Help</span>
            <span className="md:hidden">Reading</span>
          </button>

          <button
            onClick={() => setActiveSection(AppSection.VOCABULARY)}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeSection === AppSection.VOCABULARY 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="hidden md:inline">Daily Words</span>
            <span className="md:hidden">Words</span>
          </button>
        </div>

        <div className="hidden md:block p-6 mt-auto border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl">
             <p className="text-xs text-slate-500 font-bold uppercase mb-2">Supportive Tip</p>
             <p className="text-sm text-slate-600 leading-relaxed">
               "Reading just 15 minutes a day can double your vocabulary in a year!"
             </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">
              Welcome Back
            </h2>
            <h1 className="text-3xl font-black text-slate-900">
              {activeSection === AppSection.WRITING && "Master Your Writing"}
              {activeSection === AppSection.READING && "Understand Everything"}
              {activeSection === AppSection.VOCABULARY && "Expand Your Vocabulary"}
            </h1>
          </div>
        </header>

        {renderSection()}
        
        <footer className="max-w-4xl mx-auto mt-20 pb-8 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm font-medium">
            Lumina Literacy — Empowering Adult Learners Through AI
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
