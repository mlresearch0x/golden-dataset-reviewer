import { useState, useEffect } from 'react';
import type { GroundTruthEntry } from './types';
import { exportToJSON, exportToJSONL, exportToCSV, downloadSampleDataset } from './utils';
import { StorageService } from './storage';
import { useTheme } from './contexts/ThemeContext';
import { FileImport } from './components/FileImport';
import { StatsBar } from './components/StatsBar';
import { GroundTruthTable } from './components/GroundTruthTable';
import { EditModal } from './components/EditModal';
import { AddNewModal } from './components/AddNewModal';
import { ViewModal } from './components/ViewModal';
import { HowToModal } from './components/HowToModal';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [entries, setEntries] = useState<GroundTruthEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [editingEntry, setEditingEntry] = useState<GroundTruthEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<GroundTruthEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDatasetName, setCurrentDatasetName] = useState<string>('');
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Check for username and unsaved work on mount
  useEffect(() => {
    // Check if username is set
    const storedUsername = StorageService.getUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowUsernamePrompt(true);
    }

    // Check for unsaved work
    const lastDataset = StorageService.getLastWorkingDataset();
    if (lastDataset && lastDataset.entries.length > 0) {
      setShowLoadPrompt(true);
    }
  }, []);

  // Auto-save whenever entries or dataset name changes
  useEffect(() => {
    if (entries.length > 0 && currentDatasetName.trim()) {
      try {
        StorageService.saveDataset(currentDatasetName, entries);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [entries, currentDatasetName]);

  const handleLoadPreviousWork = () => {
    const lastDataset = StorageService.getLastWorkingDataset();
    if (lastDataset) {
      setCurrentDatasetName(lastDataset.name);
      setEntries(lastDataset.entries);
    }
    setShowLoadPrompt(false);
  };

  const handleStartFresh = () => {
    StorageService.clearCurrentDataset();
    setShowLoadPrompt(false);
  };

  const handleSaveUsername = () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert('Please enter your name');
      return;
    }
    StorageService.setUsername(trimmedUsername);
    setUsername(trimmedUsername);
    setShowUsernamePrompt(false);
  };

  const handleImport = (importedEntries: GroundTruthEntry[]) => {
    // Generate a unique name with current date for the imported dataset
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const newName = StorageService.generateUniqueName(`Dataset ${dateStr}`);
    setCurrentDatasetName(newName);
    setEntries(importedEntries);
    // Auto-save will trigger via useEffect
  };

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(entries, `ground_truth_export_${timestamp}.json`);
    setShowExportMenu(false);
  };

  const handleExportJSONL = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSONL(entries, `ground_truth_export_${timestamp}.jsonl`);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(entries, `ground_truth_export_${timestamp}.csv`);
    setShowExportMenu(false);
  };

  const handleView = (entry: GroundTruthEntry) => {
    setViewingEntry(entry);
  };

  const handleViewEdit = (updatedEntry: GroundTruthEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setViewingEntry(updatedEntry); // Update the modal's entry prop
  };

  const handleEdit = (entry: GroundTruthEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = (updatedEntry: GroundTruthEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setEditingEntry(null);
  };

  const handleAdd = (newEntry: GroundTruthEntry) => {
    setEntries([...entries, newEntry]);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleApprove = (id: string) => {
    const updatedEntries = entries.map((e) =>
      e.id === id
        ? {
            ...e,
            approved: true,
            date_approved: new Date().toISOString(),
            approved_by: username
          }
        : e
    );
    setEntries(updatedEntries);

    // Update viewingEntry if it's the one being approved
    if (viewingEntry?.id === id) {
      const updatedEntry = updatedEntries.find((e) => e.id === id);
      if (updatedEntry) {
        setViewingEntry(updatedEntry);
      }
    }
  };

  const handleRenameDataset = () => {
    const newName = prompt('Enter new dataset name:', currentDatasetName);
    if (!newName || newName.trim() === '') return;

    const trimmedName = newName.trim();
    if (trimmedName === currentDatasetName) return;

    if (StorageService.datasetExists(trimmedName)) {
      alert('A dataset with this name already exists. Please choose a different name.');
      return;
    }

    if (StorageService.getCurrentDatasetName() === currentDatasetName) {
      // Rename existing dataset in storage
      const success = StorageService.renameDataset(currentDatasetName, trimmedName);
      if (success) {
        setCurrentDatasetName(trimmedName);
        alert(`Dataset renamed to "${trimmedName}"`);
      } else {
        alert('Failed to rename dataset');
      }
    } else {
      // Just update the name for unsaved dataset
      setCurrentDatasetName(trimmedName);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* Username Prompt - Shows first */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Welcome!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please enter your name. This will be recorded when you approve entries.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handleSaveUsername}
              className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Load Previous Work Prompt */}
      {showLoadPrompt && !showUsernamePrompt && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Resume Previous Work?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have unsaved work from a previous session. Would you like to continue where you left off?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStartFresh}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Start Fresh
              </button>
              <button
                onClick={handleLoadPreviousWork}
                className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
              >
                Load Previous Work
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Ground Truth Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage, edit, and track approval status of your datasets
              </p>
              {username && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Logged in as: <span className="font-medium text-gray-700 dark:text-gray-300">{username}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHowToModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                How to Use
              </button>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dataset Name and Management */}
        {entries.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dataset Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentDatasetName}
                    onChange={(e) => setCurrentDatasetName(e.target.value)}
                    placeholder="Enter dataset name..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  />
                  <button
                    onClick={handleRenameDataset}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Rename
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-saved
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Import Data
              </h2>
              <FileImport onImport={handleImport} />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Add New Entry
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={entries.length === 0}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Export
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showExportMenu && entries.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-20">
                      <button
                        onClick={handleExportJSON}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors first:rounded-t-md"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={handleExportJSONL}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border-t border-gray-200 dark:border-gray-800"
                      >
                        Export as JSONL
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border-t border-gray-200 dark:border-gray-800 last:rounded-b-md"
                      >
                        Export as CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {entries.length > 0 && <StatsBar entries={entries} />}

        {/* Data Table */}
        <GroundTruthTable
          entries={entries}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterApproved={filterApproved}
          onFilterChange={setFilterApproved}
        />

        {/* Modals */}
        <ViewModal
          entry={viewingEntry}
          onClose={() => setViewingEntry(null)}
          onEdit={handleViewEdit}
          onApprove={handleApprove}
        />
        <EditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
        />
        <AddNewModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
        />
        <HowToModal
          isOpen={showHowToModal}
          onClose={() => setShowHowToModal(false)}
          onDownloadSample={downloadSampleDataset}
        />
      </div>

      {/* Footer */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Ground Truth Management System - Research Tool
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
