'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const DatasetNavigation = () => {
  const pathname = usePathname();

  const isGroundTruth = pathname === '/';
  const isJSONL = pathname === '/jsonl-documents';

  return (
    <div className="flex gap-2 mb-6">
      <Link
        href="/"
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          isGroundTruth
            ? 'bg-black dark:bg-white text-white dark:text-black'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Ground Truth Datasets
      </Link>
      <Link
        href="/jsonl-documents"
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          isJSONL
            ? 'bg-black dark:bg-white text-white dark:text-black'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Nigeria Tax Act 2025
      </Link>
    </div>
  );
};
