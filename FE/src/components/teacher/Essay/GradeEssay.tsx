import React, { useState } from 'react';
import { ArrowLeft, Clock, BookOpen, MessageSquare, Save, Lightbulb, ChevronLeft, ChevronRight, FileText  } from 'lucide-react';

interface GradeEssayProps {
  onBack?: () => void;
  studentName?: string;
}

const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  prompt: i === 0 ? (
    <>Analyze the role of isolation and environment in Emily Brontë's <span className="italic">Wuthering Heights</span>. How does the setting of the Yorkshire moors function as an active participant in shaping the psychological states of Heathcliff and Catherine? Support your argument with specific textual evidence.</>
  ) : (
    `Mock Question ${i + 1}: Please analyze the given topic and provide relevant evidence.`
  ),
  response: i === 0 ? (
    <>
      <p>
        In Emily Brontë's masterful novel <span className="italic">Wuthering Heights</span>, the landscape is never merely a backdrop; it is a primal force that mirrors and shapes the turbulent internal lives of its protagonists. The Yorkshire moors—wild, unforgiving, and desolate—serve as both an isolator and an incubator for the intense, destructive passion between Heathcliff and Catherine Earnshaw. Unlike the sheltered, civilized environment of Thrushcross Grange, Wuthering Heights exposes its inhabitants to the raw elements of nature, fundamentally altering their psychological composition.
      </p>
      <p>
        The moors represent an untamed wilderness that aligns perfectly with Heathcliff's mysterious origins and feral disposition. When Mr. Earnshaw brings the young Heathcliff to Wuthering Heights, he introduces an element of the chaotic outside world into the domestic sphere. The resulting isolation of the estate ensures that social norms and moral boundaries are suspended. Catherine notes this profound connection when she famously declares, "My love for Heathcliff resembles the eternal rocks beneath." She does not compare their love to anything cultivated or domestic, but to the harsh, enduring geological reality of their environment.
      </p>
      <p>
        Furthermore, the physical distance between Wuthering Heights and the nearest town fosters an insular, almost claustrophobic psychological state. The characters are forced inward, turning upon one another in acts of cruelty and obsession. The wind that constantly batters the farmhouse is a sonic reminder of their separation from polite society, effectively drowning out the...
      </p>
    </>
  ) : (
    <p>Mock Student Response for Question {i + 1}.</p>
  )
}));

const GradeEssay: React.FC<GradeEssayProps> = ({ onBack, studentName }) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const currentQuestionInfo = mockQuestions.find(q => q.id === currentQuestionId) || mockQuestions[0];

  return (
    <div className="max-w-6xl mx-auto pt-6">
    
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-10">
            <button onClick={onBack} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
            </button>
        </div>

        {/* Title Block */}
        <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{studentName} - Essay Submission</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Submitted: Oct 24, 2023</span>
            </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-8">
            
            {/* Left Column: Essay Content */}
            <div className="flex-1 max-w-[65%] space-y-6">
            
                {/* Question Prompt */}
                <div className="bg-[#f9fafb] border-l-4 border-[#1a38cf] rounded-r-xl p-6">
                    <div className="flex items-center text-[#1a38cf] text-xs font-bold uppercase tracking-wider mb-3">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    QUESTION {currentQuestionId}
                    </div>
                    <div className="text-gray-800 text-[15px] leading-relaxed">
                    {currentQuestionInfo.prompt}
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
                    
                    <div className="text-gray-800 text-[15px] leading-[1.8] space-y-6">
                    {currentQuestionInfo.response}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-2 pb-8">
                  <button
                    onClick={() => setCurrentQuestionId(prev => Math.max(1, prev - 1))}
                    disabled={currentQuestionId === 1}
                    className="flex items-center text-sm font-bold text-gray-600 hover:text-[#1a38cf] disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
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

            {/* Right Column: Evaluation Panel */}
            <div className="w-[35%] space-y-6">
            
                {/* Question Navigator */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
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
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a38cf] hover:text-[#1a38cf]'
                            }`}
                          >
                            {q.id}
                          </button>
                        ))}
                    </div>
                </div>

                {/* Evaluation Panel Card */}
                <div className="bg-[#f9fafb] rounded-xl p-6 border border-gray-100 shadow-sm">
                    {/* <div className="flex items-center text-gray-900 font-bold mb-6">
                    <CheckSquareIcon className="w-5 h-5 mr-2 text-[#1a38cf]" />
                    Evaluation Panel or Grading
                    </div> */}
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Overall Score / 100</label>
                        <div className="relative">
                            <input type="text" placeholder="e.g. 85" className="w-full bg-[#f0f2f5] border border-transparent focus:border-[#1a38cf] focus:bg-white rounded-lg py-3 px-4 outline-none text-gray-900 font-medium transition-colors" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">pts</span>
                        </div>
                    </div>


                    <button className="w-full bg-[#0a44cc] hover:bg-[#0a3bbb] text-white py-3.5 rounded-lg font-bold text-sm flex justify-center items-center transition-colors shadow-sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Evaluation
                    </button>
                </div>
            </div>
        </div>

    </div>
  );
};

export default GradeEssay;
