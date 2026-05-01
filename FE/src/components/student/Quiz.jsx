import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/SideBar';

const Quiz = () => {
  const navigate = useNavigate();

  // Giả lập dữ liệu câu hỏi
  const questions = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    text: i === 14 
      ? "Explain the relationship between interest rates and investment according to the IS-LM model." 
      : `Question content for number ${i + 1}...`,
  }));

  const [currentQuestion, setCurrentQuestion] = useState(15);
  const [answers, setAnswers] = useState({});

  // Xử lý chuyển câu hỏi
  const handleNext = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Xử lý nộp bài
  const handleSubmit = () => {
    // Bạn có thể thêm logic confirm ở đây nếu muốn
    navigate('/courses/Macroeconomics'); 
  };

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white flex justify-between items-center px-6 h-16 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">Mid-Term Assessment: Advanced Macroeconomics</h1>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3f4f5] border border-[#c3c6d6]/15">
          <span className="material-symbols-outlined text-[#003d9b]">timer</span>
          <span className="text-sm font-bold text-slate-900">00:45:22</span>
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

        {/* Main Content */}
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

            {/* Quiz Options Area */}
            <div className="bg-white rounded-xl border border-[#c3c6d6]/20 shadow-sm overflow-hidden p-8">
              <div className="flex flex-col gap-4">
                {[
                  "Higher interest rates increase the cost of borrowing, leading to a decrease in planned investment spending.",
                  "Interest rates have no direct impact on investment; they primarily influence the demand for money in the LM curve.",
                  "The IS curve represents a positive relationship where higher rates stimulate capital formation through increased savings.",
                  "Lower interest rates decrease the profitability of new projects, shifting the IS curve to the left."
                ].map((option, idx) => (
                  <label 
                    key={idx}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-[#c3c6d6]/20 hover:bg-[#f3f4f5] transition-all cursor-pointer group"
                  >
                    <input type="radio" name={`quiz-${currentQuestion}`} className="w-5 h-5 text-[#003d9b] focus:ring-[#003d9b] border-[#c3c6d6]" />
                    <span className="text-slate-700 text-lg font-medium group-hover:text-slate-900 transition-colors">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
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

export default Quiz;