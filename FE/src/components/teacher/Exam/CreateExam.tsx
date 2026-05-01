import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Trash2, GripVertical, Check, ChevronDown, Circle, Save, Send, Plus, Sparkles, Gauge } from 'lucide-react';

interface CreateExamProps {
  onBack?: () => void;
  onCreateExam?: (exam: { name: string; group: string; type: string; createdAt: string; dueDate: string }) => void;
}

const CreateExam: React.FC<CreateExamProps> = ({ onBack, onCreateExam }) => {
  const [examTitle, setExamTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [examType, setExamType] = useState('Multiple Choice');

  const handleSaveAndPublish = () => {
    if (!examTitle.trim() || !selectedGroup.trim()) return;

    onCreateExam?.({
      name: examTitle.trim(),
      group: selectedGroup.trim(),
      type: examType,
      createdAt: '',
      dueDate: '',
    });
    onBack?.();
  };

  return (
      <div className="p-12 overflow-y-auto flex-1 w-full max-w-6xl mx-auto pb-32">
         <button onClick={onBack} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
           <ArrowLeft className="w-4 h-4 mr-2" />
           Back
         </button>
         {/* Breadcrumb */}
         <div className="flex items-center text-[#1a4cd2] text-xs font-bold uppercase tracking-wider mb-2">
           <BookOpen className="w-4 h-4 mr-2" /> NEW ASSESSMENT
         </div>
         <h1 className="text-[32px] font-bold text-[#111827] mb-8 tracking-tight">Create Examination</h1>

         {/* Top Config Card */}
         <div className="bg-white rounded-xl shadow-sm p-8 mb-8 flex gap-6 border border-gray-100">
           <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Exam Title</label>
             <input
               type="text"
               value={examTitle}
               onChange={(e) => setExamTitle(e.target.value)}
               placeholder="e.g., Advanced Macroeconomics - Spring 2024"
               className="w-full bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors"
             />
           </div>
           <div className="w-[300px]">
             <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Examination Type</label>
             <div className="relative">
               <select
                 value={examType}
                 onChange={(e) => setExamType(e.target.value)}
                 className="w-full bg-white border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors appearance-none cursor-pointer"
               >
                 <option value="Multiple Choice">Multiple Choice</option>
                 <option value="Essay">Essay</option>
               </select>
               <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
           </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
           <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Group</label>
           <input
             type="text"
             value={selectedGroup}
             onChange={(e) => setSelectedGroup(e.target.value)}
             placeholder="e.g., Group: CS-202"
             className="w-full bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg py-4 px-5 outline-none text-gray-900 font-medium transition-colors"
           />
         </div>

         {/* Dynamic content based on type */}
         {examType === 'Multiple Choice' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
             {/* Card Header */}
             <div className="bg-[#f0f2f5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
               <div className="flex items-center space-x-4">
                 <div className="bg-[#0a44cc] text-white text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded">01</div>
                 <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">Question Type: Multiple Choice</span>
               </div>
               <div className="flex items-center space-x-4 text-gray-400">
                 <Trash2 className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
                 <div className="w-px h-5 bg-gray-300"></div>
                 <GripVertical className="w-4 h-4 cursor-grab hover:text-gray-600 transition-colors" />
               </div>
             </div>

             {/* Card Body */}
             <div className="p-8">
               <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Question Content</label>
               <textarea
                 placeholder="Enter your question here..."
                 className="w-full h-32 bg-[#f9fafb] border border-gray-200 focus:border-[#1a38cf] rounded-lg p-5 outline-none text-gray-800 resize-none transition-colors mb-6 text-[15px]"
               ></textarea>

               <div className="flex flex-col space-y-3">
                 {/* Option 1 */}
                 <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start cursor-pointer hover:bg-gray-50 transition-colors">
                   <Circle className="w-[22px] h-[22px] text-gray-400 mr-4 shrink-0 mt-0.5" strokeWidth={2} />
                   <p className="text-gray-700 text-[15px] leading-snug">Because debug defaults primarily affect frontend debugging and rarely backend risk</p>
                 </div>
                 {/* Option 2 */}
                 <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start cursor-pointer hover:bg-gray-50 transition-colors">
                   <Circle className="w-[22px] h-[22px] text-gray-400 mr-4 shrink-0 mt-0.5" strokeWidth={2} />
                   <p className="text-gray-700 text-[15px] leading-snug">Because in-memory databases are acceptable only when the application is stateless</p>
                 </div>
                 {/* Option 3 */}
                 <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start cursor-pointer hover:bg-gray-50 transition-colors">
                   <Circle className="w-[22px] h-[22px] text-gray-400 mr-4 shrink-0 mt-0.5" strokeWidth={2} />
                   <p className="text-gray-700 text-[15px] leading-snug">Because production needs durable storage and tighter security/observability controls</p>
                 </div>
                 {/* Option 4 */}
                 <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start cursor-pointer hover:bg-gray-50 transition-colors">
                   <Circle className="w-[22px] h-[22px] text-gray-400 mr-4 shrink-0 mt-0.5" strokeWidth={2} />
                   <p className="text-gray-700 text-[15px] leading-snug">Because production performance depends mainly on disabling logs rather than storage durability</p>
                 </div>
               </div>
             </div>

            {/* OR Divider */}
            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
            
             {/* Add New Question Button */}
             <button className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center group">
               <Plus className="w-8 h-8 text-[#cdd8ff] group-hover:text-[#1a4cd2] mb-3 transition-colors" />
               <span className="text-[#9ca3af] font-bold uppercase tracking-wider text-sm group-hover:text-[#1a4cd2] transition-colors">+ ADD NEW QUESTION</span>
             </button>
           </div>
         )}

         {examType === 'Essay' && (
           <div className="space-y-6 mb-6">
             {/* Essay Question Card */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               {/* Card Header */}
               <div className="bg-[#f0f2f5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                 <div className="flex items-center space-x-4">
                   <div className="bg-[#9ca3af] text-white text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded">02</div>
                   <span className="text-xs font-bold text-[#4b5563] uppercase tracking-wider">Question Type: Essay</span>
                 </div>
                 <div className="flex items-center text-gray-400">
                   <Trash2 className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
                 </div>
               </div>

               {/* Card Body */}
               <div className="p-8">
                 <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Essay Prompt</label>
                 <textarea
                   placeholder="Analyze the impact of..."
                   className="w-full h-32 bg-[#f9fafb] border border-gray-100 focus:border-[#1a38cf] rounded-lg p-5 outline-none text-gray-800 resize-none transition-colors text-[15px]"
                 ></textarea>
               </div>
             </div>

             {/* Add New Question Button */}
             <button className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center group">
               <Plus className="w-8 h-8 text-[#cdd8ff] group-hover:text-[#1a4cd2] mb-3 transition-colors" />
               <span className="text-[#9ca3af] font-bold uppercase tracking-wider text-sm group-hover:text-[#1a4cd2] transition-colors">+ ADD NEW QUESTION</span>
             </button>
           </div>
         )}

        {/* Bottom Fixed Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-12 flex justify-end items-center z-10">
            <div className="flex space-x-4">
          <button onClick={handleSaveAndPublish} className="bg-[#0a44cc] hover:bg-[#0a3bbb] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] transition-colors flex items-center shadow-sm">
                <Send className="w-4 h-4 mr-2" />
                Save and Publish
            </button>
            </div>
        </div>
      </div>
  );
};

export default CreateExam;