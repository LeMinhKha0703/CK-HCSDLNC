import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MessageSquare, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionDetail } from '../../../api/teacher';

interface AnswerItem {
  questionId: number;
  content: string;
  studentResponse: string;
  score?: number;
}

interface SubmissionData {
  fullName: string;
  status: string;
  totalScore: number | null;
  submitedAt: string;
  examType: string;
  answers: AnswerItem[];
}

const EssayStudentResult: React.FC = () => {
  const { examId, submissionId } = useParams<{ examId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    if (!examId || !submissionId) return;
    getSubmissionDetail(examId, submissionId)
      .then(res => setSubmission(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [examId, submissionId]);

  if (isLoading) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-slate-400">Loading submission...</div>;
  if (!submission) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-red-500">Submission not found.</div>;

  const questions = submission.answers || [];
  const currentQ = questions[currentQuestionIdx];
  const totalQuestions = questions.length;
  const maxScorePerQuestion = totalQuestions > 0 ? Number((10 / totalQuestions).toFixed(2)) : 10;

  return (
    <div className="max-w-6xl mx-auto pt-6">
    
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-10">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
            </button>
        </div>

        {/* Title Block */}
        <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{submission.fullName} - Essay Submission</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
            <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" /> 
                Submitted: {new Date(submission.submitedAt).toLocaleString('en-US')}
            </span>
            </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-8">
            
            {/* Left Column: Essay Content */}
            <div className="flex-1 max-w-[65%] space-y-6">
            
                {currentQ && (
                    <>
                        {/* Question Prompt */}
                        <div className="bg-[#f9fafb] border-l-4 border-[#1a38cf] rounded-r-xl p-6">
                            <div className="flex items-center text-[#1a38cf] text-xs font-bold uppercase tracking-wider mb-3">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            QUESTION {currentQuestionIdx + 1}
                            </div>
                            <div className="text-gray-800 text-[15px] leading-relaxed">
                            {currentQ.content}
                            </div>
                        </div>

                        {/* Student Response */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 pb-12">
                            <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <FileText className="w-4 h-4 mr-2" />
                                Student Response
                            </div>
                            </div>
                            
                            <div 
                                className="text-gray-800 text-[15px] leading-[1.8] space-y-6"
                                dangerouslySetInnerHTML={{ __html: currentQ.studentResponse }}
                            />
                        </div>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-2 pb-8">
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="flex items-center text-sm font-bold text-gray-600 hover:text-[#1a38cf] disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Previous Question
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                    disabled={currentQuestionIdx === totalQuestions - 1}
                    className="bg-[#1a38cf] hover:bg-[#0a2899] text-white py-2.5 px-6 rounded-lg font-bold text-sm flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-[#1a38cf]"
                  >
                    Next Question <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
            </div>

            {/* Right Column: Evaluation Panel */}
            <div className="w-[35%] space-y-6">
            
                {/* Question Navigator */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Question Navigator</h3>
                        <p className="text-[13px] text-gray-500">{totalQuestions} Total Questions</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {questions.map((q, idx) => (
                          <button
                            key={q.questionId}
                            onClick={() => setCurrentQuestionIdx(idx)}
                            className={`py-2 text-[13px] font-medium rounded border transition-colors ${
                              currentQuestionIdx === idx 
                                ? 'bg-[#1a38cf] text-white border-[#1a38cf]' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a38cf] hover:text-[#1a38cf]'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                    </div>
                </div>

                {/* Final Score Card */}
                <div className="bg-[#1a4cd2] rounded-xl p-8 text-white w-full shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">FINAL SCORE</p>
                    <div className="flex items-baseline">
                        <span className="text-[64px] font-bold leading-none">{submission.totalScore !== null ? Number(submission.totalScore).toFixed(1) : '-'}</span>
                        <span className="text-2xl font-medium ml-2 opacity-90">/ 10</span>
                    </div>
                    {currentQ && currentQ.score !== undefined && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-90">Score for Question {currentQuestionIdx + 1}</p>
                            <p className="text-xl font-medium mt-1">{currentQ.score} / {maxScorePerQuestion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default EssayStudentResult;











