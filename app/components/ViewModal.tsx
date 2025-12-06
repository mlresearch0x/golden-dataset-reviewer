import React, { useState } from 'react';
import type { GroundTruthEntry } from '../lib/types';

interface ViewModalProps {
  entry: GroundTruthEntry | null;
  onClose: () => void;
  onEdit: (entry: GroundTruthEntry) => void;
}

interface ExtendedViewModalProps extends ViewModalProps {
  onApprove?: (id: string) => void;
}

export const ViewModal: React.FC<ExtendedViewModalProps> = ({ entry, onClose, onEdit, onApprove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState('');

  // Initialize editedQuestion when entry changes
  React.useEffect(() => {
    if (entry) {
      setEditedQuestion(entry.question);
      // Reset editing state when entry changes (e.g., when switching entries or after update)
      setIsEditing(false);
    }
  }, [entry?.id]); // Only trigger when the entry ID changes

  // Sync editedQuestion with entry.question when not editing
  React.useEffect(() => {
    if (entry && !isEditing) {
      setEditedQuestion(entry.question);
    }
  }, [entry?.question, isEditing]);

  if (!entry) return null;

  const handleSave = () => {
    if (editedQuestion.trim()) {
      onEdit({ ...entry, question: editedQuestion.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedQuestion(entry.question);
    setIsEditing(false);
  };

  const handleApprove = () => {
    if (onApprove && entry.id) {
      onApprove(entry.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-none md:rounded-lg shadow-2xl w-full md:max-w-6xl h-full md:h-[85vh] flex flex-col border-0 md:border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-800 gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                Chunk ID:
              </span>
              <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                {entry.ground_truth_chunk_id}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                entry.approved
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
              }`}
            >
              {entry.approved ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approved
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Pending
                </>
              )}
            </span>
            {entry.approved && entry.date_approved && (
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(entry.date_approved).toLocaleDateString()}
              </span>
            )}
            {entry.approved && entry.approved_by && (
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {entry.approved_by}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 justify-between md:justify-end">
            {!entry.approved && onApprove && (
              <button
                onClick={handleApprove}
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 font-semibold transition-colors text-sm"
              >
                ✓ Approve
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content: Responsive Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-auto md:overflow-hidden">
          {/* Question Section */}
          <div className="md:flex-1 md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            <div className="p-4 md:p-6 md:flex-1 md:overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Question {isEditing && '(Editing)'}
              </h3>
              {isEditing ? (
                <textarea
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  className="w-full min-h-[200px] md:h-[calc(100%-2rem)] px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors resize-none"
                  placeholder="Enter question..."
                  autoFocus
                />
              ) : (
                <div className="text-sm md:text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {entry.question}
                </div>
              )}
            </div>

            {/* Edit/Save Toggle Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold transition-colors active:scale-95"
                  >
                    ✓ Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors active:scale-95"
                >
                  Edit Question
                </button>
              )}
            </div>
          </div>

          {/* Ground Truth Section */}
          <div className="md:flex-1 md:w-1/2 flex flex-col">
            <div className="p-4 md:p-6 md:flex-1 md:overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Ground Truth Text
              </h3>
              <div className="text-sm md:text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {entry.ground_truth_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
