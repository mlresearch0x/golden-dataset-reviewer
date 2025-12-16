import type { GroundTruthEntry, JSONLDocument } from './types';

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

// Sample dataset for demonstration
export const getSampleDataset = (): GroundTruthEntry[] => {
  return [
    {
      question: "What is machine learning?",
      ground_truth_chunk_id: "ML-101",
      ground_truth_text: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves."
    },
    {
      question: "What are the main types of machine learning?",
      ground_truth_chunk_id: "ML-102",
      ground_truth_text: "The three main types of machine learning are: 1) Supervised Learning - where the model learns from labeled training data, 2) Unsupervised Learning - where the model finds patterns in unlabeled data, and 3) Reinforcement Learning - where the model learns through trial and error using feedback from its own actions."
    },
    {
      question: "What is neural network architecture?",
      ground_truth_chunk_id: "NN-201",
      ground_truth_text: "A neural network architecture refers to the arrangement of neurons and layers in a neural network. It includes the input layer, one or more hidden layers, and an output layer. Each layer contains interconnected nodes (neurons) that process information and pass it to the next layer."
    },
    {
      question: "What is the purpose of the activation function in neural networks?",
      ground_truth_chunk_id: "NN-202",
      ground_truth_text: "Activation functions introduce non-linearity into the neural network, allowing it to learn complex patterns. Common activation functions include ReLU (Rectified Linear Unit), Sigmoid, and Tanh. They determine whether a neuron should be activated based on the weighted sum of its inputs."
    },
    {
      question: "What is data preprocessing and why is it important?",
      ground_truth_chunk_id: "DATA-301",
      ground_truth_text: "Data preprocessing is the process of cleaning and transforming raw data before training a machine learning model. It includes handling missing values, removing duplicates, normalizing data, and encoding categorical variables. Proper preprocessing improves model accuracy and training efficiency."
    },
    {
      question: "What is overfitting in machine learning?",
      ground_truth_chunk_id: "ML-103",
      ground_truth_text: "Overfitting occurs when a machine learning model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data. The model essentially memorizes the training data rather than learning general patterns. Techniques like regularization, cross-validation, and using more training data can help prevent overfitting."
    },
    {
      question: "What is the difference between classification and regression?",
      ground_truth_chunk_id: "ML-104",
      ground_truth_text: "Classification and regression are both supervised learning tasks, but they differ in their output types. Classification predicts discrete categories or classes (e.g., spam or not spam), while regression predicts continuous numerical values (e.g., house prices). Classification uses metrics like accuracy and F1-score, whereas regression uses MSE and R-squared."
    },
    {
      question: "What is feature engineering?",
      ground_truth_chunk_id: "DATA-302",
      ground_truth_text: "Feature engineering is the process of selecting, modifying, or creating new features from raw data to improve machine learning model performance. It involves domain knowledge to transform data into a format that better represents the underlying problem, potentially including feature scaling, creating interaction terms, or extracting features from text or images."
    }
  ];
};

// Export sample dataset as downloadable JSON file
export const downloadSampleDataset = () => {
  const sampleData = getSampleDataset();
  const dataStr = JSON.stringify(sampleData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_ground_truth_dataset.json';
  link.click();
  URL.revokeObjectURL(url);
};

// Export to JSONL format
export const exportToJSONL = (entries: GroundTruthEntry[], filename: string = 'ground_truth_export.jsonl') => {
  // Remove internal IDs before export
  const exportData = entries.map(({ id, ...rest }) => rest);

  // Convert to JSONL format (one JSON object per line)
  const dataStr = exportData.map(entry => JSON.stringify(entry)).join('\n');
  const dataBlob = new Blob([dataStr], { type: 'application/jsonl' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Export to CSV format
export const exportToCSV = (entries: GroundTruthEntry[], filename: string = 'ground_truth_export.csv') => {
  // Remove internal IDs before export
  const exportData = entries.map(({ id, ...rest }) => rest);

  if (exportData.length === 0) {
    return;
  }

  // Define headers
  const headers = ['question', 'ground_truth_chunk_id', 'ground_truth_text', 'approved', 'date_approved', 'approved_by'];

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, newline, or quote
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create CSV content
  const csvRows = [
    headers.join(','),
    ...exportData.map(entry =>
      headers.map(header => escapeCSV(entry[header as keyof typeof entry])).join(',')
    )
  ];

  const dataStr = csvRows.join('\n');
  const dataBlob = new Blob([dataStr], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ========== JSONL Document Utilities ==========

/**
 * Parse JSONL file (one JSON object per line)
 */
export const parseJSONLDocumentFile = async (file: File): Promise<JSONLDocument[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');

        const documents: JSONLDocument[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines

          try {
            const doc = JSON.parse(line);

            // Add internal tracking ID if not present
            documents.push({
              ...doc,
              internal_id: doc.internal_id || generateId(),
              approved: doc.approved || false,
            });
          } catch (lineError) {
            console.error(`Error parsing line ${i + 1}:`, lineError);
            reject(new Error(`Invalid JSON on line ${i + 1}`));
            return;
          }
        }

        if (documents.length === 0) {
          reject(new Error('No valid documents found in JSONL file'));
          return;
        }

        resolve(documents);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Export JSONL documents to JSONL format
 */
export const exportJSONLDocuments = (documents: JSONLDocument[], filename: string = 'jsonl_export.jsonl') => {
  // Remove internal tracking fields before export
  const exportData = documents.map(({ internal_id, approved, date_approved, approved_by, ...rest }) => rest);

  // Convert to JSONL format (one JSON object per line)
  const dataStr = exportData.map(doc => JSON.stringify(doc)).join('\n');
  const dataBlob = new Blob([dataStr], { type: 'application/jsonl' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export JSONL documents to JSON format (array)
 */
export const exportJSONLDocumentsAsJSON = (documents: JSONLDocument[], filename: string = 'jsonl_export.json') => {
  // Remove internal tracking fields before export
  const exportData = documents.map(({ internal_id, approved, date_approved, approved_by, ...rest }) => rest);

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Validate JSONL document
 */
export const validateJSONLDocument = (doc: Partial<JSONLDocument>): string | null => {
  if (!doc.id?.trim()) {
    return 'Document ID is required';
  }
  if (!doc.text?.trim()) {
    return 'Document text is required';
  }
  if (doc.page_num === undefined || doc.page_num === null) {
    return 'Page number is required';
  }
  if (!doc.metadata) {
    return 'Metadata is required';
  }
  return null;
};
