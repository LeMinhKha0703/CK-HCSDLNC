// src/components/common/ExamSidebar.tsx
import React from 'react';

interface Question {
  id: number | string;
}

interface ExamSidebarProps {
  currentQuestion: number | string;
  onQuestionSelect: (id: number | string) => void;
  answers: Record<string, unknown>;
  questions: Question[];
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  currentQuestion,
  onQuestionSelect,
  answers = {},
  questions = [],
}) => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-slate-50 flex-col p-4 overflow-y-auto hidden md:flex border-r border-slate-100">
      <div className="mb-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Question Navigator</h2>
        <p className="text-xs text-slate-500 font-medium">{questions.length || 0} Total Questions</p>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-8">
        {questions.map((q) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = currentQuestion === q.id;
          
          return (
            <div
              key={q.id}
              onClick={() => onQuestionSelect(q.id)}
              className={`h-10 w-10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer rounded-md border
              ${isCurrent
                ? 'bg-[#003d9b] text-white scale-90 border-[#003d9b]'
                : isAnswered
                ? 'bg-blue-50 text-[#003d9b] border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
            >
              {q.id}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ExamSidebar;
