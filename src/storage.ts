import type { GroundTruthEntry } from './types';

export interface DatasetInfo {
  name: string;
  lastModified: string;
  entryCount: number;
}

export interface StoredDataset {
  name: string;
  entries: GroundTruthEntry[];
  lastModified: string;
  createdAt: string;
}

const STORAGE_KEY = 'ground_truth_datasets';
const CURRENT_DATASET_KEY = 'current_dataset_name';
const USERNAME_KEY = 'ground_truth_username';

export class StorageService {
  // Get all stored datasets
  static getAllDatasets(): StoredDataset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Get list of dataset info (for selection UI)
  static getDatasetList(): DatasetInfo[] {
    const datasets = this.getAllDatasets();
    return datasets.map(ds => ({
      name: ds.name,
      lastModified: ds.lastModified,
      entryCount: ds.entries.length
    }));
  }

  // Get a specific dataset by name
  static getDataset(name: string): StoredDataset | null {
    const datasets = this.getAllDatasets();
    return datasets.find(ds => ds.name === name) || null;
  }

  // Save or update a dataset
  static saveDataset(name: string, entries: GroundTruthEntry[]): void {
    try {
      const datasets = this.getAllDatasets();
      const existingIndex = datasets.findIndex(ds => ds.name === name);
      const now = new Date().toISOString();

      const dataset: StoredDataset = {
        name,
        entries,
        lastModified: now,
        createdAt: existingIndex >= 0 ? datasets[existingIndex].createdAt : now
      };

      if (existingIndex >= 0) {
        datasets[existingIndex] = dataset;
      } else {
        datasets.push(dataset);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
      this.setCurrentDataset(name);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save dataset. Storage might be full.');
    }
  }

  // Delete a dataset
  static deleteDataset(name: string): void {
    try {
      const datasets = this.getAllDatasets();
      const filtered = datasets.filter(ds => ds.name !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      // Clear current dataset if it was deleted
      if (this.getCurrentDatasetName() === name) {
        this.clearCurrentDataset();
      }
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  // Rename a dataset
  static renameDataset(oldName: string, newName: string): boolean {
    try {
      const datasets = this.getAllDatasets();

      // Check if new name already exists
      if (datasets.some(ds => ds.name === newName)) {
        return false;
      }

      const datasetIndex = datasets.findIndex(ds => ds.name === oldName);
      if (datasetIndex === -1) {
        return false;
      }

      datasets[datasetIndex].name = newName;
      datasets[datasetIndex].lastModified = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));

      // Update current dataset name if it was renamed
      if (this.getCurrentDatasetName() === oldName) {
        this.setCurrentDataset(newName);
      }

      return true;
    } catch (error) {
      console.error('Error renaming dataset:', error);
      return false;
    }
  }

  // Get the name of the currently active dataset
  static getCurrentDatasetName(): string | null {
    return localStorage.getItem(CURRENT_DATASET_KEY);
  }

  // Set the current active dataset
  static setCurrentDataset(name: string): void {
    localStorage.setItem(CURRENT_DATASET_KEY, name);
  }

  // Clear current dataset reference
  static clearCurrentDataset(): void {
    localStorage.removeItem(CURRENT_DATASET_KEY);
  }

  // Check if there's a dataset that was being worked on
  static hasUnsavedWork(): boolean {
    const currentName = this.getCurrentDatasetName();
    if (!currentName) return false;

    const dataset = this.getDataset(currentName);
    return dataset !== null && dataset.entries.length > 0;
  }

  // Get the last worked on dataset
  static getLastWorkingDataset(): StoredDataset | null {
    const currentName = this.getCurrentDatasetName();
    if (!currentName) return null;

    return this.getDataset(currentName);
  }

  // Generate a unique dataset name
  static generateUniqueName(baseName: string = 'Untitled Dataset'): string {
    const datasets = this.getAllDatasets();
    const existingNames = datasets.map(ds => ds.name);

    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    let counter = 1;
    while (existingNames.includes(`${baseName} (${counter})`)) {
      counter++;
    }

    return `${baseName} (${counter})`;
  }

  // Check if a dataset name exists
  static datasetExists(name: string): boolean {
    const datasets = this.getAllDatasets();
    return datasets.some(ds => ds.name === name);
  }

  // Get stored username
  static getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  // Set username
  static setUsername(username: string): void {
    localStorage.setItem(USERNAME_KEY, username);
  }

  // Check if username is set
  static hasUsername(): boolean {
    return !!this.getUsername();
  }
}
