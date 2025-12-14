import React from 'react';
import type { GroundTruthEntry } from '../lib/types';

interface StatsBarProps {
  entries: GroundTruthEntry[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ entries }) => {
  const totalCount = entries.length;
  const approvedCount = entries.filter((e) => e.approved).length;
  const pendingCount = totalCount - approvedCount;
  const approvalRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
        <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
          Total
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
        <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
          Approved
        </div>
        <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
        <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
          Pending
        </div>
        <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
        <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
          Rate
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{approvalRate}%</div>
      </div>
    </div>
  );
};
