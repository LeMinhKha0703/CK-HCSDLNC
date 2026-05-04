import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trash2, ChevronDown, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createExam, getGroups } from '../../../api/teacher';

interface CreateExamProps {
  onBack?: () => void;
  onCreateExam?: () => void;
}

interface Group {
  groupId: string;
  groupName: string;
}

interface MCQQuestion {
  content: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: string;
}

interface EssayQuestion {
  content: string;
}

const CreateExam: React.FC<CreateExamProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [examType, setExamType] = useState<'MCQ' | 'Essay'>('MCQ');
  const [endAt, setEndAt] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    { content: '', options: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' },
  ]);
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([{ content: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getGroups().then(res => setGroups(res.data)).catch(console.error);
  }, []);

  // --- MCQ Handlers ---
  const updateMCQContent = (idx: number, val: string) => {
    setMcqQuestions(prev => prev.map((q, i) => i === idx ? { ...q, content: val } : q));
  };
  const updateMCQOption = (idx: number, opt: keyof MCQQuestion['options'], val: string) => {
    setMcqQuestions(prev => prev.map((q, i) => i === idx ? { ...q, options: { ...q.options, [opt]: val } } : q));
  };
  const updateMCQAnswer = (idx: number, val: string) => {
    setMcqQuestions(prev => prev.map((q, i) => i === idx ? { ...q, correctAnswer: val } : q));
  };
  const addMCQQuestion = () => {
    setMcqQuestions(prev => [...prev, { content: '', options: { a: '', b: '', c: '', d: '' }, correctAnswer: 'A' }]);
  };
  const removeMCQQuestion = (idx: number) => {
    setMcqQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // --- Essay Handlers ---
  const updateEssayContent = (idx: number, val: string) => {
    setEssayQuestions(prev => prev.map((q, i) => i === idx ? { content: val } : q));
  };
  const addEssayQuestion = () => {
    setEssayQuestions(prev => [...prev, { content: '' }]);
  };
  const removeEssayQuestion = (idx: number) => {
    setEssayQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAndPublish = async () => {
    setError('');
    if (!examTitle.trim()) { setError('Please enter an exam title.'); return; }
    if (!selectedGroupId) { setError('Please select a group.'); return; }
    if (!endAt) { setError('Please select a due date.'); return; }

    const questions =
      examType === 'MCQ'
        ? mcqQuestions.map(q => ({ content: q.content, options: q.options, correctAnswer: q.correctAnswer }))
        : essayQuestions.map(q => ({ content: q.content }));

    if (questions.some(q => !q.content.trim())) {
      setError('All questions must have content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createExam({
        title: examTitle.trim(),
        type: examType,
        groupId: selectedGroupId,
        endAt: new Date(endAt).toISOString(),
        questions,
      });
      if (onBack) onBack();
      else navigate('/teacher/exammanagement');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || 'Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-12 overflow-y-auto flex-1 w-full max-w-6xl mx-auto pb-32">
      <button onClick={onBack || (() => navigate(-1))} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="flex items-center text-[#1a4cd2] text-xs font-bold uppercase tracking-wider mb-2">
        <BookOpen className="w-4 h-4 mr-2" /> NEW ASSESSMENT
      </div>
      <h1 className="text-[32px] font-bold text-[#111827] mb-8 tracking-tight">Create Examination</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Top Config Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6 flex flex-wrap gap-6 border border-gray-100">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Exam Title</label>
          <input
            type="text"
            value={examTitle}
            onChange={e => setExamTitle(e.target.value)}
            placeholder="e.g., Midterm MCQ - Database Systems"
            className="w-full bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors"
          />
        </div>
        <div className="w-[220px]">
          <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Exam Type</label>
          <div className="relative">
            <select
              value={examType}
              onChange={e => setExamType(e.target.value as 'MCQ' | 'Essay')}
              className="w-full bg-white border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors appearance-none cursor-pointer"
            >
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="Essay">Essay</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-6 flex flex-wrap gap-6 border border-gray-100">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Group</label>
          <div className="relative">
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors appearance-none cursor-pointer"
            >
              <option value="">-- Select a Group --</option>
              {groups.map(g => (
                <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="w-[280px]">
          <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Due Date & Time</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={e => setEndAt(e.target.value)}
            className="w-full bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors"
          />
        </div>
      </div>

      {/* MCQ Questions */}
      {examType === 'MCQ' && (
        <div className="space-y-6 mb-6">
          {mcqQuestions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#f0f2f5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Question {String(idx + 1).padStart(2, '0')} — Multiple Choice
                </span>
                {mcqQuestions.length > 1 && (
                  <button onClick={() => removeMCQQuestion(idx)}>
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Question Content</label>
                  <textarea
                    value={q.content}
                    onChange={e => updateMCQContent(idx, e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full h-24 bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg p-4 outline-none text-gray-800 resize-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['a', 'b', 'c', 'd'] as const).map(opt => (
                    <div key={opt} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#e0e7ff] text-[#1a38cf] font-bold text-xs flex items-center justify-center flex-shrink-0">{opt.toUpperCase()}</span>
                      <input
                        type="text"
                        value={q.options[opt]}
                        onChange={e => updateMCQOption(idx, opt, e.target.value)}
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="flex-1 bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg py-2 px-4 outline-none text-gray-800 text-sm transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correct Answer:</label>
                  <div className="relative">
                    <select
                      value={q.correctAnswer}
                      onChange={e => updateMCQAnswer(idx, e.target.value)}
                      className="bg-white border border-gray-200 focus:border-[#1a38cf] rounded-lg py-2 px-4 outline-none text-gray-900 font-bold text-sm appearance-none cursor-pointer pr-8"
                    >
                      {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addMCQQuestion}
            className="w-full py-10 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1a4cd2] hover:bg-blue-50 transition-colors flex flex-col items-center justify-center group"
          >
            <Plus className="w-8 h-8 text-gray-300 group-hover:text-[#1a4cd2] mb-2 transition-colors" />
            <span className="text-gray-400 font-bold uppercase tracking-wider text-sm group-hover:text-[#1a4cd2] transition-colors">+ Add Question</span>
          </button>
        </div>
      )}

      {/* Essay Questions */}
      {examType === 'Essay' && (
        <div className="space-y-6 mb-6">
          {essayQuestions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#f0f2f5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <span className="text-xs font-bold text-[#4b5563] uppercase tracking-wider">
                  Question {String(idx + 1).padStart(2, '0')} — Essay Prompt
                </span>
                {essayQuestions.length > 1 && (
                  <button onClick={() => removeEssayQuestion(idx)}>
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
              <div className="p-8">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Essay Prompt</label>
                <textarea
                  value={q.content}
                  onChange={e => updateEssayContent(idx, e.target.value)}
                  placeholder="Analyze the impact of..."
                  className="w-full h-32 bg-[#f9fafb] border border-gray-100 focus:border-[#1a38cf] rounded-lg p-5 outline-none text-gray-800 resize-none transition-colors"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addEssayQuestion}
            className="w-full py-10 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1a4cd2] hover:bg-blue-50 transition-colors flex flex-col items-center justify-center group"
          >
            <Plus className="w-8 h-8 text-gray-300 group-hover:text-[#1a4cd2] mb-2 transition-colors" />
            <span className="text-gray-400 font-bold uppercase tracking-wider text-sm group-hover:text-[#1a4cd2] transition-colors">+ Add Question</span>
          </button>
        </div>
      )}

      {/* Bottom Fixed Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-12 flex justify-end items-center z-10">
        <button
          onClick={handleSaveAndPublish}
          disabled={isSubmitting}
          className="bg-[#0a44cc] hover:bg-[#0a3bbb] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-bold text-[14px] transition-colors flex items-center shadow-sm"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Publishing...' : 'Save and Publish'}
        </button>
      </div>
    </div>
  );
};

export default CreateExam;