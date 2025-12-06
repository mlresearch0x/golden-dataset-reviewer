import type { GroundTruthEntry } from './types';

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const exportToJSON = (entries: GroundTruthEntry[], filename: string = 'ground_truth_export.json') => {
  // Remove internal IDs before export
  const exportData = entries.map(({ id, ...rest }) => rest);

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const parseJSONFile = async (file: File): Promise<GroundTruthEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        // Validate that data is an array
        if (!Array.isArray(data)) {
          reject(new Error('Invalid JSON format: expected an array'));
          return;
        }

        // Add internal IDs if not present
        const entries = data.map((entry) => ({
          ...entry,
          id: entry.id || generateId(),
          approved: entry.approved || false,
        }));

        resolve(entries);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const validateEntry = (entry: Partial<GroundTruthEntry>): string | null => {
  if (!entry.question?.trim()) {
    return 'Question is required';
  }
  if (!entry.ground_truth_chunk_id?.trim()) {
    return 'Ground truth chunk ID is required';
  }
  if (!entry.ground_truth_text?.trim()) {
    return 'Ground truth text is required';
  }
  return null;
};
