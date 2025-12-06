import React, { useRef } from 'react';
import { parseJSONFile } from '../lib/utils';
import type { GroundTruthEntry } from '../lib/types';

interface FileImportProps {
  onImport: (entries: GroundTruthEntry[]) => void;
}

export const FileImport: React.FC<FileImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const entries = await parseJSONFile(file);
      onImport(entries);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.jsonl"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 dark:file:border-gray-700 file:text-sm file:font-medium file:bg-white dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-50 dark:hover:file:bg-gray-700 file:transition-colors disabled:opacity-50 cursor-pointer"
        />
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
};
