'use client'

import { useState, useEffect } from 'react';
import type { GroundTruthEntry } from './lib/types';
import { downloadSampleDataset } from './lib/utils';
import { loadCurrentDataset, saveDataset, updateDataset, getUsername } from './actions/dataset';
import { exportToJSON, exportToJSONL, exportToCSV } from './actions/export';
import { useTheme } from './contexts/ThemeContext';
import { FileImport } from './components/FileImport';
import { StatsBar } from './components/StatsBar';
import { GroundTruthTable } from './components/GroundTruthTable';
import { EditModal } from './components/EditModal';
import { AddNewModal } from './components/AddNewModal';
import { ViewModal } from './components/ViewModal';
import { HowToModal } from './components/HowToModal';
import { DatasetNavigation } from './components/DatasetNavigation';
import { generateId } from './lib/utils';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [entries, setEntries] = useState<GroundTruthEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [editingEntry, setEditingEntry] = useState<GroundTruthEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<GroundTruthEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load dataset and username on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Check if username exists
        const storedUsername = await getUsername();
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          // Check localStorage for backward compatibility
          const localUsername = localStorage.getItem('ground_truth_username');
          if (localUsername) {
            setUsername(localUsername);
          } else {
            setShowUsernamePrompt(true);
          }
        }

        // Load dataset
        const dataset = await loadCurrentDataset();
        if (dataset) {
          setEntries(dataset.entries);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Auto-save whenever entries change
  useEffect(() => {
    if (!loading && entries.length > 0 && username) {
      updateDataset(entries);
    }
  }, [entries, username, loading]);

  const handleSaveUsername = () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert('Please enter your name');
      return;
    }
    // Store in localStorage for persistence
    localStorage.setItem('ground_truth_username', trimmedUsername);
    setUsername(trimmedUsername);
    setShowUsernamePrompt(false);
  };

  const handleImport = async (importedEntries: GroundTruthEntry[]) => {
    // Backend protection: Reject import if dataset already exists
    if (entries.length > 0) {
      alert('⚠️ Import Blocked: Dataset already exists!\n\nYou have ' + entries.length + ' entries loaded. Please export or clear your current dataset before importing new data to prevent accidental data loss.');
      return;
    }

    setEntries(importedEntries);
    // Save immediately
    if (username) {
      await saveDataset(importedEntries, username);
    }
  };

  const handleExportJSON = async () => {
    const content = await exportToJSON(entries);
    // Trigger browser download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ground_truth_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJSONL = async () => {
    const content = await exportToJSONL(entries);
    const blob = new Blob([content], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ground_truth_export_${new Date().toISOString().split('T')[0]}.jsonl`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCSV = async () => {
    const content = await exportToCSV(entries);
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ground_truth_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleView = (entry: GroundTruthEntry) => {
    setViewingEntry(entry);
  };

  const handleViewEdit = (updatedEntry: GroundTruthEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setViewingEntry(updatedEntry);
  };

  const handleEdit = (entry: GroundTruthEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = (updatedEntry: GroundTruthEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setEditingEntry(null);
  };

  const handleAdd = (newEntry: GroundTruthEntry) => {
    setEntries([...entries, { ...newEntry, id: generateId() }]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

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

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Dataset Navigation */}
        <DatasetNavigation />

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

        {/* Import/Export Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {entries.length === 0 ? (
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Data
                </h2>
                <FileImport onImport={handleImport} />
              </div>
            ) : (
              <div className="flex-1">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        Dataset Already Loaded
                      </h3>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        You have {entries.length} {entries.length === 1 ? 'entry' : 'entries'} loaded. Import is disabled to prevent accidental data loss. Export or clear your current dataset first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Ground Truth Management System - Research Tool
          </p>
        </div>
      </div>
    </div>
  );
}
