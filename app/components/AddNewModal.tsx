import React, { useState } from 'react';
import type { GroundTruthEntry } from '../lib/types';
import { validateEntry, generateId } from '../lib/utils';

interface AddNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: GroundTruthEntry) => void;
}

export const AddNewModal: React.FC<AddNewModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [question, setQuestion] = useState('');
  const [chunkId, setChunkId] = useState('');
  const [groundTruthText, setGroundTruthText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setQuestion('');
    setChunkId('');
    setGroundTruthText('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAdd = () => {
    const newEntry: Partial<GroundTruthEntry> = {
      question: question.trim(),
      ground_truth_chunk_id: chunkId.trim(),
      ground_truth_text: groundTruthText.trim(),
    };

    const validationError = validateEntry(newEntry);
    if (validationError) {
      setError(validationError);
      return;
    }

    onAdd({
      ...newEntry as GroundTruthEntry,
      id: generateId(),
      approved: false,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Ground Truth Entry</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ground Truth Chunk ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={chunkId}
              onChange={(e) => setChunkId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Section 11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ground Truth Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={groundTruthText}
              onChange={(e) => setGroundTruthText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the ground truth text..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
};
