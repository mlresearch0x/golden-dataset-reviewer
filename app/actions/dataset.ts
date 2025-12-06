'use server'

import {
  datasetExists,
  readDataset,
  writeDataset,
  deleteDataset,
  type StoredDataset
} from '@/app/lib/file-storage';
import type { GroundTruthEntry } from '@/app/lib/types';

/**
 * Load the current dataset from file
 * Returns null if no dataset exists
 */
export async function loadCurrentDataset(): Promise<StoredDataset | null> {
  try {
    if (!(await datasetExists())) {
      return null;
    }
    return await readDataset();
  } catch (error) {
    console.error('Error loading dataset:', error);
    return null;
  }
}

/**
 * Save/create a new dataset
 */
export async function saveDataset(
  entries: GroundTruthEntry[],
  username: string
): Promise<StoredDataset> {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const dataset: StoredDataset = {
    name: `Dataset ${dateStr}`,
    username,
    created_at: now,
    updated_at: now,
    entries
  };

  await writeDataset(dataset);
  return dataset;
}

/**
 * Update existing dataset with new entries
 * Preserves creation date and username
 */
export async function updateDataset(
  entries: GroundTruthEntry[]
): Promise<StoredDataset> {
  try {
    const current = await readDataset();
    current.entries = entries;
    current.updated_at = new Date().toISOString();
    await writeDataset(current);
    return current;
  } catch (error) {
    // If dataset doesn't exist, create a new one with default username
    return saveDataset(entries, 'User');
  }
}

/**
 * Clear/delete the current dataset
 */
export async function clearDataset(): Promise<void> {
  await deleteDataset();
}

/**
 * Get username from current dataset
 */
export async function getUsername(): Promise<string | null> {
  try {
    if (!(await datasetExists())) {
      return null;
    }
    const dataset = await readDataset();
    return dataset.username;
  } catch {
    return null;
  }
}
