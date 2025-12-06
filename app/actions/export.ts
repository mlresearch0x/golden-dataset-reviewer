'use server'

import { saveExport } from '@/app/lib/file-storage';
import type { GroundTruthEntry } from '@/app/lib/types';

/**
 * Export entries to JSON format
 */
export async function exportToJSON(entries: GroundTruthEntry[]): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ground_truth_export_${timestamp}.json`;

  // Remove internal IDs before export
  const exportData = entries.map(({ id, ...rest }) => rest);
  const content = JSON.stringify(exportData, null, 2);

  await saveExport(filename, content);
  return content; // Return content for download
}

/**
 * Export entries to JSONL format
 */
export async function exportToJSONL(entries: GroundTruthEntry[]): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ground_truth_export_${timestamp}.jsonl`;

  // Remove internal IDs before export
  const exportData = entries.map(({ id, ...rest }) => rest);
  const content = exportData.map(entry => JSON.stringify(entry)).join('\n');

  await saveExport(filename, content);
  return content;
}

/**
 * Export entries to CSV format
 */
export async function exportToCSV(entries: GroundTruthEntry[]): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ground_truth_export_${timestamp}.csv`;

  if (entries.length === 0) {
    return '';
  }

  // Headers
  const headers = [
    'question',
    'ground_truth_chunk_id',
    'ground_truth_text',
    'approved',
    'date_approved',
    'approved_by'
  ];

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Remove internal IDs and create CSV rows
  const exportData = entries.map(({ id, ...rest }) => rest);
  const csvRows = [
    headers.join(','),
    ...exportData.map(entry =>
      headers.map(header => escapeCSV((entry as any)[header])).join(',')
    )
  ];

  const content = csvRows.join('\n');
  await saveExport(filename, content);
  return content;
}
