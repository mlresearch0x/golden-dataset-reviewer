import fs from 'fs/promises';
import path from 'path';
import type { GroundTruthEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATASET_FILE = path.join(DATA_DIR, 'current-dataset.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

export interface StoredDataset {
  name: string;
  username: string;
  created_at: string;
  updated_at: string;
  entries: GroundTruthEntry[];
}

/**
 * Ensure data directories exist
 */
export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(EXPORTS_DIR, { recursive: true });
}

/**
 * Check if current dataset file exists
 */
export async function datasetExists(): Promise<boolean> {
  try {
    await fs.access(DATASET_FILE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read current dataset from file
 */
export async function readDataset(): Promise<StoredDataset> {
  const data = await fs.readFile(DATASET_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write dataset to file
 */
export async function writeDataset(dataset: StoredDataset): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATASET_FILE, JSON.stringify(dataset, null, 2));
}

/**
 * Delete current dataset file
 */
export async function deleteDataset(): Promise<void> {
  try {
    await fs.unlink(DATASET_FILE);
  } catch {
    // File doesn't exist, ignore
  }
}

/**
 * Save export file
 */
export async function saveExport(
  filename: string,
  content: string
): Promise<string> {
  await ensureDataDir();
  const filepath = path.join(EXPORTS_DIR, filename);
  await fs.writeFile(filepath, content);
  return filepath;
}
