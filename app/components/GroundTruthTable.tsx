import React, { useState } from 'react';
import type { GroundTruthEntry } from '../lib/types';

interface GroundTruthTableProps {
  entries: GroundTruthEntry[];
  onView: (entry: GroundTruthEntry) => void;
  onEdit: (entry: GroundTruthEntry) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterApproved: 'all' | 'approved' | 'pending';
  onFilterChange: (filter: 'all' | 'approved' | 'pending') => void;
}

export const GroundTruthTable: React.FC<GroundTruthTableProps> = ({
  entries,
  onView,
  onEdit,
  onDelete,
  onApprove,
  searchTerm,
  onSearchChange,
  filterApproved,
  onFilterChange,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const filteredEntries = entries.filter((entry) => {
    // Filter by approval status
    if (filterApproved === 'approved' && !entry.approved) return false;
    if (filterApproved === 'pending' && entry.approved) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        entry.question.toLowerCase().includes(search) ||
        entry.ground_truth_chunk_id.toLowerCase().includes(search) ||
        entry.ground_truth_text.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Sort by chunk ID if sort direction is set
  const sortedEntries = sortDirection
    ? [...filteredEntries].sort((a, b) => {
        const aId = a.ground_truth_chunk_id;
        const bId = b.ground_truth_chunk_id;

        // Try to parse as numbers for numeric sorting
        const aNum = parseFloat(aId);
        const bNum = parseFloat(bId);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Fall back to string comparison
        const comparison = aId.localeCompare(bId, undefined, { numeric: true, sensitivity: 'base' });
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredEntries;

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const toggleSort = () => {
    if (sortDirection === null) {
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search questions, chunk IDs, or text..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
          />
          <select
            value={filterApproved}
            onChange={(e) => onFilterChange(e.target.value as 'all' | 'approved' | 'pending')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-medium transition-colors"
          >
            <option value="all">All Entries</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing {sortedEntries.length} of {entries.length} entries
          </div>
          {/* Sort Button - Mobile Only */}
          <button
            onClick={toggleSort}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sort
            {sortDirection && (
              <span className="text-sm">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {entries.length === 0 ? 'No entries yet. Import a JSON file to get started.' : 'No entries found. Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 pb-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:bg-gray-100 dark:active:bg-gray-700 relative"
            >
              {/* Tap hint */}
              <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Tap for details</span>
              </div>

              <div onClick={() => onView(entry)}>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-24">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Chunk ID
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {entry.ground_truth_chunk_id}
                      </span>
                    </div>
                    {entry.approved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-black dark:bg-white text-white dark:text-black">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                    Question
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
                    {entry.question}
                  </div>
                </div>

                {/* Ground Truth Preview */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                    Ground Truth (Preview)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {entry.ground_truth_text}
                  </div>
                  {entry.ground_truth_text.length > 150 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Tap to read more...
                    </div>
                  )}
                </div>

                {/* Metadata */}
                {(entry.date_approved || entry.approved_by) && (
                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    {entry.date_approved && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(entry.date_approved).toLocaleDateString()}</span>
                      </div>
                    )}
                    {entry.approved_by && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{entry.approved_by}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions - Fixed at bottom */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                {!entry.approved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(entry.id!);
                    }}
                    className="col-span-2 px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 font-semibold transition-colors text-sm active:scale-95"
                  >
                    ✓ Approve
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(entry);
                  }}
                  className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors text-sm active:scale-95"
                >
                  View Full
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm active:scale-95"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id!);
                  }}
                  className={`col-span-2 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm active:scale-95 ${
                    deleteConfirm === entry.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  {deleteConfirm === entry.id ? '⚠️ Tap Again to Confirm Delete' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none transition-colors"
                onClick={toggleSort}
                title="Click to sort"
              >
                <div className="flex items-center space-x-2">
                  <span>Chunk ID</span>
                  {sortDirection && (
                    <span className="text-gray-900 dark:text-white text-base font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Ground Truth (Preview)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date Approved
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Approved By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {entries.length === 0 ? 'No entries yet. Import a JSON file to get started.' : 'No entries found. Try adjusting your search or filter.'}
                  </p>
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap" onClick={() => onView(entry)}>
                    {entry.approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-black dark:bg-white text-white dark:text-black">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" onClick={() => onView(entry)}>
                    {entry.ground_truth_chunk_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md" onClick={() => onView(entry)}>
                    <div className="line-clamp-2">{entry.question}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs" onClick={() => onView(entry)}>
                    <div className="line-clamp-2">{entry.ground_truth_text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400" onClick={() => onView(entry)}>
                    {entry.date_approved ? new Date(entry.date_approved).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400" onClick={() => onView(entry)}>
                    {entry.approved_by || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {!entry.approved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(entry.id!);
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-xs"
                          title="Approve"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(entry);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-xs"
                        title="View details"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(entry);
                        }}
                        className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors text-xs"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id!);
                        }}
                        className={`px-3 py-1 rounded font-medium transition-colors text-xs ${
                          deleteConfirm === entry.id
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
                        }`}
                        title={deleteConfirm === entry.id ? 'Click again to confirm' : 'Delete'}
                      >
                        {deleteConfirm === entry.id ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
