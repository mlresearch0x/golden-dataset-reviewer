'use client'

import { useState } from 'react';
import type { JSONLDocument, JSONLDocumentMetadata } from '../lib/types';
import { validateJSONLDocument, generateId } from '../lib/utils';

interface JSONLAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (document: JSONLDocument, position: 'before' | 'after', targetIndex: number) => void;
  documentsCount: number;
}

export const JSONLAddModal: React.FC<JSONLAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  documentsCount
}) => {
  const [formData, setFormData] = useState<Partial<JSONLDocument>>({
    id: '',
    text: '',
    page_num: 0,
    metadata: {
      chapter: null,
      part: null,
      schedule: null,
      schedule_title: null,
      side_notes: [],
      references: []
    }
  });
  const [error, setError] = useState<string>('');
  const [position, setPosition] = useState<'before' | 'after'>('after');
  const [targetIndex, setTargetIndex] = useState<number>(documentsCount - 1);

  if (!isOpen) return null;

  const handleAdd = () => {
    const validationError = validateJSONLDocument(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newDocument: JSONLDocument = {
      ...formData as JSONLDocument,
      internal_id: generateId(),
      approved: false
    };

    onAdd(newDocument, position, targetIndex);

    // Reset form
    setFormData({
      id: '',
      text: '',
      page_num: 0,
      metadata: {
        chapter: null,
        part: null,
        schedule: null,
        schedule_title: null,
        side_notes: [],
        references: []
      }
    });
    setError('');
    onClose();
  };

  const updateMetadata = (field: keyof JSONLDocumentMetadata, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata!,
        [field]: value
      }
    });
  };

  const addSideNote = () => {
    const sideNotes = formData.metadata?.side_notes || [];
    updateMetadata('side_notes', [...sideNotes, '']);
  };

  const updateSideNote = (index: number, value: string) => {
    const sideNotes = [...(formData.metadata?.side_notes || [])];
    sideNotes[index] = value;
    updateMetadata('side_notes', sideNotes);
  };

  const removeSideNote = (index: number) => {
    const sideNotes = formData.metadata?.side_notes || [];
    updateMetadata('side_notes', sideNotes.filter((_, i) => i !== index));
  };

  const addReference = () => {
    const references = formData.metadata?.references || [];
    updateMetadata('references', [...references, '']);
  };

  const updateReference = (index: number, value: string) => {
    const references = [...(formData.metadata?.references || [])];
    references[index] = value;
    updateMetadata('references', references);
  };

  const removeReference = (index: number) => {
    const references = formData.metadata?.references || [];
    updateMetadata('references', references.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full my-8 border border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {documentsCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                Insert Position
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-blue-700 dark:text-blue-300 mb-2">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as 'before' | 'after')}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-blue-700 dark:text-blue-300 mb-2">
                    Document Index (0-based)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={documentsCount - 1}
                    value={targetIndex}
                    onChange={(e) => setTargetIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Will insert {position} document at index {targetIndex} ({position === 'after' ? targetIndex + 1 : targetIndex} in final position)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="e.g., Section 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Enter the document text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.page_num}
              onChange={(e) => setFormData({ ...formData, page_num: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metadata</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapter
                </label>
                <input
                  type="text"
                  value={formData.metadata?.chapter || ''}
                  onChange={(e) => updateMetadata('chapter', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part
                </label>
                <input
                  type="text"
                  value={formData.metadata?.part || ''}
                  onChange={(e) => updateMetadata('part', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule
                </label>
                <input
                  type="text"
                  value={formData.metadata?.schedule || ''}
                  onChange={(e) => updateMetadata('schedule', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule Title
                </label>
                <input
                  type="text"
                  value={formData.metadata?.schedule_title || ''}
                  onChange={(e) => updateMetadata('schedule_title', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.metadata?.type || ''}
                  onChange={(e) => updateMetadata('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Side Notes
                  </label>
                  <button
                    onClick={addSideNote}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    + Add Side Note
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.metadata?.side_notes || []).map((note, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => updateSideNote(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="Side note..."
                      />
                      <button
                        onClick={() => removeSideNote(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    References
                  </label>
                  <button
                    onClick={addReference}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    + Add Reference
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.metadata?.references || []).map((ref, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ref}
                        onChange={(e) => updateReference(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="Reference..."
                      />
                      <button
                        onClick={() => removeReference(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
          >
            Add Document
          </button>
        </div>
      </div>
    </div>
  );
};
