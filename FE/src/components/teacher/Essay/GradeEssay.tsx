import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MessageSquare, Save, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionDetail, gradeSubmission } from '../../../api/teacher';

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

const GradeEssay: React.FC = () => {
  const { examId, submissionId } = useParams<{ examId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  // scores[questionId] = điểm cho câu đó (thang 10)
  const [scores, setScores] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!examId || !submissionId) return;
    getSubmissionDetail(examId, submissionId)
      .then(res => {
        setSubmission(res.data);
        // Nạp điểm cũ (nếu đã có từ MongoDB)
        const initScores: Record<number, string> = {};
        for (const a of (res.data.answers || [])) {
          if (a.score !== undefined) initScores[a.questionId] = String(a.score);
        }
        setScores(initScores);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [examId, submissionId]);

  const handleSaveAll = async () => {
    if (!examId || !submissionId || !submission) return;
    const grades = submission.answers.map(a => ({
      questionId: a.questionId,
      score: parseFloat(scores[a.questionId] || '0'),
    }));
    setIsSaving(true);
    try {
      await gradeSubmission(examId, submissionId, { grades });
      alert('Grade saved successfully!');
      navigate(-1);
    } catch {
      alert('Failed to save grade!');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-slate-400">Loading submission...</div>;
  if (!submission) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-red-500">Submission not found.</div>;

  const questions = submission.answers;
  const currentQ = questions[currentQuestionIdx];
  const totalQuestions = questions.length;
  const maxScorePerQuestion = totalQuestions > 0 ? Number((10 / totalQuestions).toFixed(2)) : 10;

  return (
    <div className="max-w-6xl mx-auto pt-6">

        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{submission.fullName} — Essay Submission</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Submitted: {new Date(submission.submitedAt).toLocaleString('en-US')}
              </span>
            </div>
        </div>

        <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1 max-w-[65%] space-y-6">

                {currentQ && (
                  <>
                    <div className="bg-[#f9fafb] border-l-4 border-[#1a38cf] rounded-r-xl p-6">
                        <div className="flex items-center text-[#1a38cf] text-xs font-bold uppercase tracking-wider mb-3">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          QUESTION {currentQuestionIdx + 1}
                        </div>
                        <div className="text-gray-800 text-[15px] leading-relaxed">{currentQ.content}</div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 pb-12">
                        <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider mb-6">
                          <FileText className="w-4 h-4 mr-2" /> Student Response
                        </div>
                        <div
                          className="text-gray-800 text-[15px] leading-[1.8]"
                          dangerouslySetInnerHTML={{ __html: currentQ.studentResponse }}
                        />
                    </div>

                    {/* Grade input for this question */}
                    <div className="bg-[#f9fafb] rounded-xl p-6 border border-gray-100 shadow-sm">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Score for Question {currentQuestionIdx + 1} / {maxScorePerQuestion}
                      </label>
                      <div className="relative">
                        <input
                          type="number" min="0" max={maxScorePerQuestion} step="0.1"
                          placeholder={`e.g. ${Number((maxScorePerQuestion * 0.8).toFixed(1))}`}
                          value={scores[currentQ.questionId] ?? ''}
                          onChange={e => setScores(prev => ({ ...prev, [currentQ.questionId]: e.target.value }))}
                          className="w-full bg-[#f0f2f5] border border-transparent focus:border-[#1a38cf] focus:bg-white rounded-lg py-3 px-4 outline-none text-gray-900 font-medium transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">/ {maxScorePerQuestion}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2 pb-8">
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="flex items-center text-sm font-bold text-gray-600 hover:text-[#1a38cf] disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Previous Question
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                    disabled={currentQuestionIdx === totalQuestions - 1}
                    className="bg-[#1a38cf] hover:bg-[#0a2899] text-white py-2.5 px-6 rounded-lg font-bold text-sm flex items-center transition-colors shadow-sm disabled:opacity-50"
                  >
                    Next Question <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
            </div>

            {/* Right Column: Navigator + Save */}
            <div className="w-[35%] space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Question Navigator</h3>
                        <p className="text-[13px] text-gray-500">{totalQuestions} Total Questions</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => (
                          <button
                            key={q.questionId}
                            onClick={() => setCurrentQuestionIdx(idx)}
                            className={`py-2 text-[13px] font-medium rounded border transition-colors ${
                              currentQuestionIdx === idx
                                ? 'bg-[#1a38cf] text-white border-[#1a38cf]'
                                : scores[q.questionId]
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a38cf] hover:text-[#1a38cf]'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                    </div>
                </div>

                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="w-full bg-[#0a44cc] hover:bg-[#0a3bbb] text-white py-3.5 rounded-lg font-bold text-sm flex justify-center items-center transition-colors shadow-sm disabled:opacity-60"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save All Grades'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default GradeEssay;
