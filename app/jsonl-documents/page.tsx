'use client'

import { useState, useEffect } from 'react';
import type { JSONLDocument } from '../lib/types';
import { parseJSONLDocumentFile, exportJSONLDocuments, exportJSONLDocumentsAsJSON } from '../lib/utils';
import { loadCurrentJSONLDataset, saveJSONLDataset, updateJSONLDataset, getJSONLUsername } from '../actions/jsonl-dataset';
import { verifyNigeriaTaxActPassword } from '../actions/auth';
import { useTheme } from '../contexts/ThemeContext';
import { DatasetNavigation } from '../components/DatasetNavigation';
import { JSONLEditModal } from '../components/JSONLEditModal';
import { JSONLAddModal } from '../components/JSONLAddModal';

export default function NigeriaTaxActPage() {
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [checkingPassword, setCheckingPassword] = useState(false);

  const [documents, setDocuments] = useState<JSONLDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [viewingDocument, setViewingDocument] = useState<JSONLDocument | null>(null);
  const [editingDocument, setEditingDocument] = useState<JSONLDocument | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importError, setImportError] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  // Check authentication first
  useEffect(() => {
    const authenticated = sessionStorage.getItem('nigeria_tax_act_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load dataset and username after authentication
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        const storedUsername = await getJSONLUsername();
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          const localUsername = localStorage.getItem('jsonl_username');
          if (localUsername) {
            setUsername(localUsername);
          } else {
            setShowUsernamePrompt(true);
          }
        }

        const dataset = await loadCurrentJSONLDataset();
        if (dataset) {
          setDocuments(dataset.documents);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Auto-save whenever documents change
  useEffect(() => {
    if (!loading && documents.length > 0 && username && isAuthenticated) {
      updateJSONLDataset(documents);
    }
  }, [documents, username, loading, isAuthenticated]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingPassword(true);
    setPasswordError('');

    try {
      const isValid = await verifyNigeriaTaxActPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('nigeria_tax_act_authenticated', 'true');
        setPassword('');
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleSaveUsername = () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert('Please enter your name');
      return;
    }
    localStorage.setItem('jsonl_username', trimmedUsername);
    setUsername(trimmedUsername);
    setShowUsernamePrompt(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (documents.length > 0) {
      alert('⚠️ Import Blocked: Dataset already exists!\n\nYou have ' + documents.length + ' documents loaded. Please export or clear your current dataset before importing new data to prevent accidental data loss.');
      e.target.value = '';
      return;
    }

    setImportError('');
    setIsImporting(true);

    try {
      const importedDocuments = await parseJSONLDocumentFile(file);
      setDocuments(importedDocuments);

      if (username) {
        await saveJSONLDataset(importedDocuments, username);
      }

      e.target.value = '';
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportJSONL = () => {
    exportJSONLDocuments(documents, `nigeria_tax_act_${new Date().toISOString().split('T')[0]}.jsonl`);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportJSONLDocumentsAsJSON(documents, `nigeria_tax_act_${new Date().toISOString().split('T')[0]}.json`);
    setShowExportMenu(false);
  };

  const handleApprove = (internal_id: string) => {
    const updatedDocuments = documents.map((doc) =>
      doc.internal_id === internal_id
        ? {
            ...doc,
            approved: true,
            date_approved: new Date().toISOString(),
            approved_by: username
          }
        : doc
    );
    setDocuments(updatedDocuments);

    if (viewingDocument?.internal_id === internal_id) {
      const updatedDoc = updatedDocuments.find((doc) => doc.internal_id === internal_id);
      if (updatedDoc) {
        setViewingDocument(updatedDoc);
      }
    }
  };

  const handleEdit = (document: JSONLDocument) => {
    setEditingDocument(document);
  };

  const handleSaveEdit = (updatedDocument: JSONLDocument) => {
    setDocuments(documents.map((doc) =>
      doc.internal_id === updatedDocument.internal_id ? updatedDocument : doc
    ));
    setEditingDocument(null);

    // Update viewing modal if it's the same document
    if (viewingDocument?.internal_id === updatedDocument.internal_id) {
      setViewingDocument(updatedDocument);
    }
  };

  const handleAdd = (newDocument: JSONLDocument, position: 'before' | 'after', targetIndex: number) => {
    const newDocs = [...documents];
    const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    newDocs.splice(insertIndex, 0, newDocument);
    setDocuments(newDocs);
  };

  const handleDelete = (internal_id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter((doc) => doc.internal_id !== internal_id));
      if (viewingDocument?.internal_id === internal_id) {
        setViewingDocument(null);
      }
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.metadata.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.metadata.part?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.metadata.schedule?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterApproved === 'all' ||
      (filterApproved === 'approved' && doc.approved) ||
      (filterApproved === 'pending' && !doc.approved);

    return matchesSearch && matchesFilter;
  });

  const approvedCount = documents.filter((doc) => doc.approved).length;

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nigeria Tax Act 2025
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This section is password protected
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Enter password..."
                autoFocus
                disabled={checkingPassword}
              />
            </div>
            {passwordError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                {passwordError}
              </div>
            )}
            <button
              type="submit"
              disabled={checkingPassword || !password}
              className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingPassword ? 'Verifying...' : 'Access'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* Username Prompt */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Welcome!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please enter your name. This will be recorded when you approve documents.
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
                Nigeria Tax Act 2025
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage, edit, and track approval status of tax act documents
              </p>
              {username && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Logged in as: <span className="font-medium text-gray-700 dark:text-gray-300">{username}</span>
                </p>
              )}
            </div>
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

        {/* Import/Export Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {documents.length === 0 ? (
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import JSONL Data
                </h2>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".jsonl"
                    onChange={handleFileChange}
                    disabled={isImporting}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 dark:file:border-gray-700 file:text-sm file:font-medium file:bg-white dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-50 dark:hover:file:bg-gray-700 file:transition-colors disabled:opacity-50 cursor-pointer"
                  />
                  {isImporting && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  )}
                  {importError && (
                    <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
                      {importError}
                    </div>
                  )}
                </div>
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
                        You have {documents.length} {documents.length === 1 ? 'document' : 'documents'} loaded. Import is disabled to prevent accidental data loss.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Add Document
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={documents.length === 0}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Export
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showExportMenu && documents.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-20">
                      <button
                        onClick={handleExportJSONL}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors first:rounded-t-md"
                      >
                        Export as JSONL
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border-t border-gray-200 dark:border-gray-800 last:rounded-b-md"
                      >
                        Export as JSON
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {documents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">{approvedCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{documents.length - approvedCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {documents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterApproved('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filterApproved === 'all'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterApproved('approved')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filterApproved === 'approved'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterApproved('pending')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filterApproved === 'pending'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        {documents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Text Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDocuments.map((doc, index) => (
                    <tr key={doc.internal_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {documents.findIndex(d => d.internal_id === doc.internal_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {doc.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="max-w-md truncate">{doc.text}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {doc.page_num}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.approved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setViewingDocument(doc)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                        >
                          Edit
                        </button>
                        {!doc.approved && (
                          <button
                            onClick={() => handleApprove(doc.internal_id!)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.internal_id!)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No documents match your search criteria
              </div>
            )}
          </div>
        )}

        {/* View Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Document Details
                </h2>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {viewingDocument.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
                    {viewingDocument.text}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Number
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {viewingDocument.page_num}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {viewingDocument.approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded space-y-2">
                    {viewingDocument.metadata.chapter && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Chapter: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{viewingDocument.metadata.chapter}</span>
                      </div>
                    )}
                    {viewingDocument.metadata.part && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Part: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{viewingDocument.metadata.part}</span>
                      </div>
                    )}
                    {viewingDocument.metadata.schedule && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Schedule: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{viewingDocument.metadata.schedule}</span>
                      </div>
                    )}
                    {viewingDocument.metadata.schedule_title && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Schedule Title: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{viewingDocument.metadata.schedule_title}</span>
                      </div>
                    )}
                    {viewingDocument.metadata.type && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{viewingDocument.metadata.type}</span>
                      </div>
                    )}
                    {viewingDocument.metadata.side_notes && viewingDocument.metadata.side_notes.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Side Notes: </span>
                        <ul className="text-sm text-gray-900 dark:text-white list-disc list-inside">
                          {viewingDocument.metadata.side_notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {viewingDocument.metadata.references && viewingDocument.metadata.references.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">References: </span>
                        <ul className="text-sm text-gray-900 dark:text-white list-disc list-inside">
                          {viewingDocument.metadata.references.map((ref, i) => (
                            <li key={i}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {viewingDocument.approved && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <span className="font-medium">Approved by:</span> {viewingDocument.approved_by}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {new Date(viewingDocument.date_approved!).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleEdit(viewingDocument);
                      setViewingDocument(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Edit Document
                  </button>
                  {!viewingDocument.approved && (
                    <button
                      onClick={() => handleApprove(viewingDocument.internal_id!)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                      Approve Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <JSONLEditModal
          document={editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={handleSaveEdit}
        />

        {/* Add Modal */}
        <JSONLAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
          documentsCount={documents.length}
        />
      </div>

      {/* Footer */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Nigeria Tax Act 2025 Management System - Research Tool
          </p>
        </div>
      </div>
    </div>
  );
}
