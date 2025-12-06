import React, { useState, useEffect } from 'react';
import type { GroundTruthEntry } from '../types';

interface EditModalProps {
  entry: GroundTruthEntry | null;
  onClose: () => void;
  onSave: (entry: GroundTruthEntry) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ entry, onClose, onSave }) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setQuestion(entry.question);
      setError('');
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = () => {
    if (!question.trim()) {
      setError('Question cannot be empty');
      return;
    }

    onSave({
      ...entry,
      question: question.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Question</h2>
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

        <div className="p-6 space-y-4">
          {/* Question - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question (Editable)
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
              placeholder="Enter question..."
            />
            {error && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Ground Truth Chunk ID - Locked */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ground Truth Chunk ID (Locked)
            </label>
            <input
              type="text"
              value={entry.ground_truth_chunk_id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md cursor-not-allowed"
            />
          </div>

          {/* Ground Truth Text - Locked */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ground Truth Text (Locked)
            </label>
            <textarea
              value={entry.ground_truth_text}
              disabled
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md cursor-not-allowed"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
