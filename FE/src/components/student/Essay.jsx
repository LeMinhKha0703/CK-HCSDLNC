import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/SideBar';

const Essay = () => {
  const navigate = useNavigate();

  // 1. Logic dữ liệu câu hỏi (Giữ nguyên cấu trúc 50 câu)
  const questions = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    text: i === 14 
      ? "Discuss the long-term impacts of expansionary fiscal policy on a nation's debt-to-GDP ratio." 
      : `Question content for number ${i + 1}: Analyze the macroeconomic implications of this scenario...`,
    subText: "Consider the Crowding Out effect, potential for inflationary pressure, and the role of automatic stabilizers in your response..."
  }));

  const [currentQuestion, setCurrentQuestion] = useState(15);
  const [answers, setAnswers] = useState({});
  const [editorRef, setEditorRef] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Kiểm tra trạng thái formatting
  const checkFormatState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  // Xử lý formatting
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef) {
      editorRef.focus();
      setTimeout(checkFormatState, 0);
    }
  };

  const handleEditorChange = () => {
    if (editorRef) {
      setAnswers({
        ...answers,
        [currentQuestion]: editorRef.innerHTML
      });
    }
  };

  const handleEditorRef = (ref) => {
    setEditorRef(ref);
  };

  // Reset editor khi đổi câu hỏi
  React.useEffect(() => {
    if (editorRef) {
      editorRef.innerHTML = answers[currentQuestion] || '';
    }
  }, [currentQuestion]);

  // 2. Xử lý thay đổi văn bản
  const handleTextChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion]: e.target.value
    });
  };

  // 3. Xử lý điều hướng
  const handleNext = () => {
    if (currentQuestion < questions.length) setCurrentQuestion(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) setCurrentQuestion(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Quay về trang group detail
    navigate('/courses/Macroeconomics'); 
  };

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
      {/* TopAppBar - GIỮ NGUYÊN */}
      <header className="fixed top-0 w-full z-50 bg-white flex justify-between items-center px-6 h-16 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">Mid-Term Assessment: Advanced Macroeconomics</h1>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3f4f5] border border-[#c3c6d6]/15">
          <span className="material-symbols-outlined text-[#003d9b]">timer</span>
          <span className="text-sm font-bold text-slate-900">00:44:10</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSubmit}
            className="bg-[#0052cc] text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-80 active:scale-95 transition-all"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        <Sidebar 
          type="exam" 
          currentQuestion={currentQuestion}
          onQuestionSelect={setCurrentQuestion}
          answers={answers}
          questions={questions}
        />

        {/* Main Content - GIỮ NGUYÊN - Đổ dữ liệu động */}
        <main className="flex-1 ml-0 md:ml-64 p-8 md:p-12 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#003d9b] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Question {currentQuestion}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-headline font-bold text-slate-900 leading-tight mb-6">
                {questions[currentQuestion - 1].text}
              </h2>
            </div>

            {/* Essay Editor Area */}
            <div className="bg-white rounded-xl border border-[#c3c6d6]/20 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="flex items-center gap-1 p-2 bg-[#f3f4f5] border-b border-[#c3c6d6]/15">
                <div className="flex items-center gap-1 p-1">
                  <button 
                    onClick={() => applyFormat('bold')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors font-bold ${
                      isBold ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'
                    }`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    onClick={() => applyFormat('italic')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors italic ${
                      isItalic ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'
                    }`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    onClick={() => applyFormat('underline')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded text-slate-600 transition-colors underline ${
                      isUnderline ? 'bg-blue-200 text-blue-700' : 'hover:bg-white hover:text-slate-900'
                    }`}
                    title="Underline"
                  >
                    U
                  </button>
                </div>
              </div>
              <div
                ref={handleEditorRef}
                contentEditable
                onInput={handleEditorChange}
                onMouseUp={checkFormatState}
                onKeyUp={checkFormatState}
                onSelect={checkFormatState}
                data-placeholder="Enter your answer here..."
                className="flex-1 p-8 text-lg text-slate-800 focus:outline-none bg-transparent leading-relaxed outline-none editor-placeholder"
                style={{ minHeight: '400px', wordWrap: 'break-word' }}
                suppressContentEditableWarning
              >
              </div>
            </div>

            {/* Navigation - GIỮ NGUYÊN - Thêm logic Click */}
            <div className="flex justify-between items-center mt-12 pb-20">
              <button 
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentQuestion === 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#e7e8e9] text-[#434654] hover:bg-[#e1e3e4]'}`}
              >
                <span className="material-symbols-outlined">arrow_back</span> Previous
              </button>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 text-[#003d9b] font-bold hover:bg-blue-50 rounded-xl transition-all">Save</button>
                <button 
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-[#003d9b] text-white font-bold shadow-lg shadow-blue-900/10 hover:brightness-110 transition-all ${currentQuestion === questions.length ? 'opacity-50 cursor-not-allowed' : ''}`}
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