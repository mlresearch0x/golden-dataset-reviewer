'use server'

import {
  jsonlDatasetExists,
  readJSONLDataset,
  writeJSONLDataset,
  deleteJSONLDataset,
  type StoredJSONLDataset
} from '@/app/lib/jsonl-storage';
import type { JSONLDocument } from '@/app/lib/types';

/**
 * Load the current JSONL dataset from file
 * Returns null if no dataset exists
 */
export async function loadCurrentJSONLDataset(): Promise<StoredJSONLDataset | null> {
  try {
    if (!(await jsonlDatasetExists())) {
      return null;
    }
    return await readJSONLDataset();
  } catch (error) {
    console.error('Error loading JSONL dataset:', error);
    return null;
  }
}

/**
 * Save/create a new JSONL dataset
 */
export async function saveJSONLDataset(
  documents: JSONLDocument[],
  username: string
): Promise<StoredJSONLDataset> {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const dataset: StoredJSONLDataset = {
    name: `JSONL Dataset ${dateStr}`,
    username,
    created_at: now,
    updated_at: now,
    documents
  };

  await writeJSONLDataset(dataset);
  return dataset;
}

/**
 * Update existing JSONL dataset with new documents
 * Preserves creation date and username
 */
export async function updateJSONLDataset(
  documents: JSONLDocument[]
): Promise<StoredJSONLDataset> {
  try {
    const current = await readJSONLDataset();
    current.documents = documents;
    current.updated_at = new Date().toISOString();
    await writeJSONLDataset(current);
    return current;
  } catch (error) {
    // If dataset doesn't exist, create a new one with default username
    return saveJSONLDataset(documents, 'User');
  }
}

/**
 * Clear/delete the current JSONL dataset
 */
export async function clearJSONLDataset(): Promise<void> {
  await deleteJSONLDataset();
}

/**
 * Get username from current JSONL dataset
 */
export async function getJSONLUsername(): Promise<string | null> {
  try {
    if (!(await jsonlDatasetExists())) {
      return null;
    }
    const dataset = await readJSONLDataset();
    return dataset.username;
  } catch {
    return null;
  }
}
