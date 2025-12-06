import React, { useState } from 'react';
import type { GroundTruthEntry } from '../types';

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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Chunk ID:
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {entry.ground_truth_chunk_id}
            </span>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                entry.approved
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {entry.approved ? 'Approved' : 'Pending'}
            </span>
            {entry.approved && entry.date_approved && (
              <>
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(entry.date_approved).toLocaleDateString()}
                </span>
              </>
            )}
            {entry.approved && entry.approved_by && (
              <>
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  by {entry.approved_by}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!entry.approved && onApprove && (
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors text-sm"
              >
                Approve
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

        {/* Content: Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Question */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800">
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Question {isEditing && '(Editing)'}
              </h3>
              {isEditing ? (
                <textarea
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  className="w-full h-[calc(100%-2rem)] px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors resize-none"
                  placeholder="Enter question..."
                />
              ) : (
                <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
                >
                  Edit Question
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Ground Truth Text */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Ground Truth Text
              </h3>
              <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {entry.ground_truth_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
