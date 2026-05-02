// src/components/student/Essay.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExamSidebar from '../common/ExamSidebar';
import { getExamContent, submitExam } from '../../api/student';

interface Question {
  id: number;
  text: string;
}

interface ExamContent {
  examId: string;
  title: string;
  type: string;
  totalQuestions: number;
  questions: Question[];
}

const Essay: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamContent | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (!examId) return;
    getExamContent(examId)
      .then(res => setExam(res.data))
      .catch(() => setError('Không thể tải nội dung bài kiểm tra'))
      .finally(() => setIsLoading(false));
  }, [examId]);

  // Khôi phục nội dung editor khi đổi câu hỏi
  useEffect(() => {
    if (editorRef.current && exam) {
      const qId = exam.questions[currentQuestionIndex]?.id;
      if (qId) {
        editorRef.current.innerHTML = answers[qId] || '';
      }
    }
  }, [currentQuestionIndex, exam, answers]);

  const checkFormatState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(checkFormatState, 0);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current && exam) {
      const qId = exam.questions[currentQuestionIndex].id;
      setAnswers(prev => ({
        ...prev,
        [qId]: editorRef.current!.innerHTML
      }));
    }
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!examId || !exam) return;
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài tự luận này?')) return;
    
    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qId, ans]) => ({
        questionId: Number(qId),
        studentResponse: ans,
      }));
      await submitExam(examId, { answers: answersPayload });
      alert('Nộp bài thành công!');
      navigate(-1);
    } catch (err) {
      alert('Lỗi nộp bài!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-20">Đang tải bài thi...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!exam || exam.questions.length === 0) return <div className="text-center py-20">Không có câu hỏi nào.</div>;

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen font-body">
      <style>
        {`
          .editor-placeholder:empty::before {
            content: attr(data-placeholder);
            color: #a0aec0;
            font-style: italic;
          }
          .editor-placeholder:empty:focus::before {
            color: #a0aec0;
          }
        `}
      </style>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white flex justify-between items-center px-6 h-16 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">{exam.title}</h1>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3f4f5] border border-[#c3c6d6]/15">
          <span className="material-symbols-outlined text-[#003d9b]">timer</span>
          <span className="text-sm font-bold text-slate-900">--:--:--</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#0052cc] text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-80 active:scale-95 transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Đang nộp...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        <ExamSidebar 
          currentQuestion={currentQuestion.id}
          onQuestionSelect={(id) => {
            const index = exam.questions.findIndex(q => q.id === id);
            if (index !== -1) setCurrentQuestionIndex(index);
          }}
          answers={answers}
          questions={exam.questions}
        />

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-64 p-8 md:p-12 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#003d9b] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                Question {currentQuestionIndex + 1}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-headline font-bold text-slate-900 leading-tight mb-6">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Essay Editor Area */}
            <div className="bg-white rounded-xl border border-[#c3c6d6]/20 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="flex items-center gap-1 p-2 bg-[#f3f4f5] border-b border-[#c3c6d6]/15">
                <div className="flex items-center gap-1 p-1">
                  <button 
                    onClick={() => applyFormat('bold')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors font-bold ${isBold ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'}`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    onClick={() => applyFormat('italic')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors italic font-serif ${isItalic ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'}`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    onClick={() => applyFormat('underline')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors underline ${isUnderline ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'}`}
                    title="Underline"
                  >
                    U
                  </button>
                </div>
              </div>
              
              <div 
                ref={editorRef}
                onInput={handleEditorInput}
                onKeyUp={checkFormatState}
                onMouseUp={checkFormatState}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 p-6 outline-none text-slate-700 text-lg leading-relaxed editor-placeholder min-h-[300px]"
                data-placeholder="Enter your essay response here..."
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pb-20">
              <button 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentQuestionIndex === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#e7e8e9] text-[#434654] hover:bg-[#e1e3e4]'}`}
              >
                <span className="material-symbols-outlined">arrow_back</span> Previous
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleNext}
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-[#003d9b] text-white font-bold shadow-lg shadow-blue-900/10 hover:brightness-110 transition-all ${currentQuestionIndex === exam.questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next Question <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Essay;
