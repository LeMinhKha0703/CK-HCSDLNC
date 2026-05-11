import React, { useState } from 'react';
import { X, FileUp, XCircle } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, studentEmails: string[]) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailChips, setEmailChips] = useState<string[]>([]);

  const resetForm = () => {
    setGroupName('');
    setEmailInput('');
    setEmailChips([]);
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;
    setEmailChips(prev => [...prev, trimmedEmail]);
    setEmailInput('');
  };

  const handleCreateGroup = () => {
    const trimmedGroupName = groupName.trim();
    if (!trimmedGroupName) return;

    const trimmedEmail = emailInput.trim();
    const finalEmails = [...emailChips];
    if (trimmedEmail) {
      finalEmails.push(trimmedEmail);
    }

    onCreateGroup(trimmedGroupName, finalEmails);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] p-8 relative">
        <button 
          onClick={handleClose} 
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Group</h2>
          <p className="text-gray-600 text-sm">Organize your students into a new collaborative learning unit.</p>
        </div>

        {/* Group Name */}
        <div>
          <label className="block text-[13px] font-bold text-gray-800 mb-2">Group Name</label>
          <input 
            type="text" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Advanced Calculus Section A" 
            className="w-full bg-[#f1f3f5] border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-colors text-gray-700"
          />
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-[13px] font-bold text-gray-800 mb-2">Upload Student List</label>
          <div className="border-2 border-dashed border-[#d1d5db] rounded-xl bg-[#f8f9fa] p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
              <FileUp className="w-6 h-6 text-[#1a4cd2]" />
            </div>
            <p className="text-[14px] text-gray-800 font-medium mb-1">
              Drop Excel file here or <span className="text-[#1a4cd2] font-semibold cursor-pointer hover:underline">browse</span>
            </p>
            <p className="text-xs text-gray-500">Supports .xlsx, .csv formats (Max 5MB)</p>
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Add Student by Email */}
        <div>
          <label className="block text-[13px] font-bold text-[#1a38cf] uppercase tracking-wide mb-2">
            ADD STUDENT BY EMAIL
          </label>
          <div className="flex space-x-3 mb-4">
            <input 
              type="text" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="student@example.com" 
              className="flex-1 bg-[#f1f3f5] border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="bg-[#b6c6ff] hover:bg-[#a3b7ff] text-[#1a38cf] font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Add
            </button>
          </div>
            
          {/* Email Chips */}
          <div className="flex flex-wrap gap-2">
            {emailChips.map((email, idx) => (
              <div key={`${email}-${idx}`} className="flex items-center bg-[#f1f3f5] rounded-full px-3 py-1.5 border border-gray-200">
                <span className="text-sm text-gray-700 mr-2 font-medium">{email}</span>
                <button
                  type="button"
                  onClick={() => setEmailChips(prev => prev.filter((_, index) => index !== idx))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1.5 focus:outline-none flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end items-center space-x-4">
          <button 
            onClick={handleClose} 
            className="text-[#1a38cf] hover:text-[#112480] font-semibold text-sm px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="bg-[#1a38cf] hover:bg-[#112480] disabled:bg-[#9db0f0] disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-sm"
          >
            Create Group
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGroupModal;