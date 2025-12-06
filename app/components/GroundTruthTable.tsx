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
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => onView(entry)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Chunk ID
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {entry.ground_truth_chunk_id}
                    </span>
                  </div>
                  {entry.approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-black dark:bg-white text-white dark:text-black">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Question
                </div>
                <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
                  {entry.question}
                </div>
              </div>

              {/* Ground Truth Preview */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Ground Truth (Preview)
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {entry.ground_truth_text}
                </div>
              </div>

              {/* Metadata */}
              {(entry.date_approved || entry.approved_by) && (
                <div className="flex gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
                  {entry.date_approved && (
                    <div>
                      <span className="font-medium">Approved:</span> {new Date(entry.date_approved).toLocaleDateString()}
                    </div>
                  )}
                  {entry.approved_by && (
                    <div>
                      <span className="font-medium">By:</span> {entry.approved_by}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {!entry.approved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(entry.id!);
                    }}
                    className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(entry);
                  }}
                  className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm"
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  className="flex-1 min-w-[100px] px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id!);
                  }}
                  className={`flex-1 min-w-[100px] px-3 py-2 rounded font-medium transition-colors text-sm ${
                    deleteConfirm === entry.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  {deleteConfirm === entry.id ? 'Confirm?' : 'Delete'}
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
