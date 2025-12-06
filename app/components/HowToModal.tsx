import React from 'react';

interface HowToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadSample: () => void;
}

export const HowToModal: React.FC<HowToModalProps> = ({ isOpen, onClose, onDownloadSample }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            How to Use Ground Truth Management
          </h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Getting Started */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Getting Started
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Import your dataset by clicking "Choose File" and selecting a JSON or JSONL file</li>
              <li>Your data will be automatically saved with the current date</li>
              <li>Review, edit, and approve entries as needed</li>
              <li>Export your approved dataset in JSON, JSONL, or CSV format</li>
            </ol>
          </section>

          {/* Data Format */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Expected Data Format
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Your JSON file should contain an array of objects with these fields:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-900 dark:text-white overflow-x-auto">
{`[
  {
    "question": "What is machine learning?",
    "ground_truth_chunk_id": "Section 1.1",
    "ground_truth_text": "Machine learning is..."
  }
]`}
              </pre>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Key Features
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Search & Filter:</strong> Quickly find entries by searching or filtering by approval status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Edit Questions:</strong> Modify questions inline or in the edit modal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Approve Entries:</strong> Mark entries as approved to track verification progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Auto-Save:</strong> Datasets are automatically saved locally in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Multiple Export Formats:</strong> Export to JSON, JSONL, or CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">•</span>
                <span><strong>Dark Mode:</strong> Toggle between light and dark themes</span>
              </li>
            </ul>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tips
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">→</span>
                <span>Click on any row to view the full entry details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">→</span>
                <span>Use the search bar to find specific questions or chunk IDs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">→</span>
                <span>Sort by Chunk ID by clicking the column header</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black dark:text-white font-bold">→</span>
                <span>Your work is saved locally and will persist between sessions</span>
              </li>
            </ul>
          </section>

          {/* Sample Data */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Try it Out
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Download a sample dataset to see how the system works:
            </p>
            <button
              onClick={onDownloadSample}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
            >
              Download Sample Dataset
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
