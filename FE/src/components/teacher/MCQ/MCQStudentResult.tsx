import React, { useState } from 'react';
import { ArrowLeft, XCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface MCQStudentResultProps {
  onBack?: () => void;
  studentName?: string;
}

const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  text: i === 0 ? "In the context of memory encoding, what does \"semantic processing\" refer to?" :
        i === 1 ? "Which neurological structure is primarily implicated in the consolidation of new explicit memories?" :
        i === 2 ? "Piaget's stage of cognitive development characterized by abstract reasoning is:" :
        i === 3 ? "The phenomenon where a person's behavior changes simply because they are being observed is known as:" :
        `Mock Question ${i + 1}: This is a sample multiple choice question to demonstrate the UI.`,
  isCorrect: i !== 1, // Mock: question 2 is incorrect, others correct
  options: i === 0 ? [
    { label: 'C', text: 'Encoding the meaning of a word and relating it to similar words.', isSelected: true, isCorrect: true },
    { label: 'A', text: 'Encoding the physical structure or appearance of a word.', isSelected: false, isCorrect: false }
  ] : i === 1 ? [
    { label: 'B', text: 'The Hippocampus', isSelected: false, isCorrect: true },
    { label: 'D', text: 'The Amygdala', isSelected: true, isCorrect: false }
  ] : i === 2 ? [
    { label: 'A', text: 'Formal Operational Stage', isSelected: true, isCorrect: true }
  ] : i === 3 ? [
    { label: 'A', text: 'The Placebo Effect', isSelected: false, isCorrect: false },
    { label: 'C', text: 'The Hawthorne Effect', isSelected: true, isCorrect: true }
  ] : [
    { label: 'A', text: 'Option A text', isSelected: false, isCorrect: false },
    { label: 'B', text: 'Option B text', isSelected: true, isCorrect: true },
    { label: 'C', text: 'Option C text', isSelected: false, isCorrect: false },
    { label: 'D', text: 'Option D text', isSelected: false, isCorrect: false },
  ]
}));

const MCQStudentResult: React.FC<MCQStudentResultProps> = ({ onBack, studentName }) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const currentQuestion = mockQuestions.find(q => q.id === currentQuestionId) || mockQuestions[0];

  return (
    <div className="max-w-6xl mx-auto pt-6">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Top Layout (Title Block + Navigator) */}
      <div className="flex flex-col lg:flex-row justify-between mb-8 lg:mb-12 gap-8">
        
        {/* Left Side: Title and Stats */}
        <div className="flex flex-col">
          {/* Title Block */}
          <div className="mb-8">
            <h1 className="text-[40px] font-bold text-[#111827] leading-none mb-3">
              {studentName || 'Student Name'}
            </h1>
            <p className="text-gray-600 text-[18px] font-medium">
              Advanced Cognitive Psychology - Midterm Assessment
            </p>
          </div>

          {/* Stats Section */}
          <div className="bg-[#1a4cd2] rounded-xl p-8 text-white w-[340px] shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">FINAL SCORE</p>
            <div className="flex items-baseline">
              <span className="text-[64px] font-bold leading-none">49</span>
              <span className="text-2xl font-medium ml-2 opacity-90">/ 50</span>
            </div>
          </div>
        </div>

        {/* Right Side: Question Navigator */}
        <div className="w-full lg:w-[400px] bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex-shrink-0">
            <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Question Navigator</h3>
                <p className="text-[13px] text-gray-500">{mockQuestions.length} Total Questions</p>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {mockQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionId(q.id)}
                    className={`py-2 text-[13px] font-medium rounded border transition-colors ${
                      currentQuestionId === q.id 
                        ? 'bg-[#1a38cf] text-white border-[#1a38cf]' 
                        : (q.isCorrect 
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-[#1a38cf] hover:text-[#1a38cf]' 
                            : 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5] hover:border-[#dc2626]')
                    }`}
                  >
                    {q.id}
                  </button>
                ))}
            </div>
        </div>

      </div>

      {/* Submission Details Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[24px] font-bold text-[#111827]">Submission Details</h2>
        <div className="flex items-center space-x-6 text-sm font-medium text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#1a38cf] mr-2"></div>
            Correct
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#dc2626] mr-2"></div>
            Incorrect
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="flex flex-col gap-8 pb-12">
        
        {/* Render Current Question */}
        <div className={`bg-[#f9fafb] rounded-xl p-8 border shadow-sm flex flex-col ${
            !currentQuestion.isCorrect ? 'border-l-4 border-l-[#dc2626] border-gray-100' : 'border-gray-100'
        }`}>
          <div className="flex justify-between items-start mb-6">
              <p className="text-[16px] text-gray-900 font-medium leading-relaxed pr-8">
                <span className={currentQuestion.isCorrect ? "text-[#1a38cf] font-bold mr-2" : "text-[#dc2626] font-bold mr-2"}>
                  {currentQuestion.id.toString().padStart(2, '0')}.
                </span>
                {currentQuestion.text}
              </p>
              {currentQuestion.isCorrect ? (
                <CheckCircle className="w-6 h-6 text-[#1a38cf] flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-[#dc2626] flex-shrink-0" />
              )}
          </div>
          <div className="space-y-4 flex-grow">
              {currentQuestion.options.map((opt, idx) => {
                // Determine styling based on selection and correctness
                let bgClass = "bg-white border border-gray-100";
                let textClass = "text-gray-600";
                let iconClass = "border border-gray-400 text-gray-500 bg-transparent";
                let statusLabel = null;

                if (opt.isSelected && opt.isCorrect) {
                  bgClass = "bg-[#e0e7ff]";
                  textClass = "text-gray-900";
                  iconClass = "bg-[#1a38cf] text-white border-transparent";
                } else if (opt.isSelected && !opt.isCorrect) {
                  bgClass = "bg-[#fee2e2]";
                  textClass = "text-[#991b1b]";
                  iconClass = "bg-[#dc2626] text-white border-transparent";
                  statusLabel = <span className="text-[11px] font-bold text-[#dc2626] tracking-widest ml-4">SELECTED</span>;
                } else if (!opt.isSelected && opt.isCorrect && !currentQuestion.isCorrect) {
                  // The correct option that wasn't selected (show when question is wrong)
                  bgClass = "bg-[#f0f4ff]";
                  textClass = "text-gray-900";
                  iconClass = "border-2 border-[#1a38cf] text-[#1a38cf] bg-transparent";
                  statusLabel = <span className="text-[11px] font-bold text-[#1a38cf] tracking-widest ml-4">CORRECT</span>;
                }

                return (
                  <div key={idx} className={`flex items-center justify-between rounded-lg p-5 ${bgClass}`}>
                    <div className="flex items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-4 shrink-0 ${iconClass}`}>
                        {opt.label}
                      </div>
                      <p className={`text-[14px] font-medium ${textClass}`}>{opt.text}</p>
                    </div>
                    {statusLabel}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Navigation Buttons for questions */}
        <div className="flex justify-between items-center pt-2 pb-8">
            <button
            onClick={() => setCurrentQuestionId(prev => Math.max(1, prev - 1))}
            disabled={currentQuestionId === 1}
            className="flex items-center text-sm font-bold text-[#1a38cf] hover:text-[#0a2899] disabled:opacity-50 disabled:hover:text-[#1a38cf] transition-colors"
            >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous Question
            </button>
            <button
            onClick={() => setCurrentQuestionId(prev => Math.min(mockQuestions.length, prev + 1))}
            disabled={currentQuestionId === mockQuestions.length}
            className="bg-[#1a38cf] hover:bg-[#0a2899] text-white py-2.5 px-6 rounded-lg font-bold text-sm flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-[#1a38cf]"
            >
            Next Question <ChevronRight className="w-5 h-5 ml-1" />
            </button>
        </div>

      </div>

    </div>
  );
};

export default MCQStudentResult;