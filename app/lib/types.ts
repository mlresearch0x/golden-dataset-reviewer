export interface GroundTruthEntry {
  question: string;
  ground_truth_chunk_id: string;
  ground_truth_text: string;
  approved?: boolean;
  date_approved?: string;
  approved_by?: string; // Username of person who approved
  id?: string; // Internal ID for tracking
}

export interface AppState {
  entries: GroundTruthEntry[];
  filteredEntries: GroundTruthEntry[];
  searchTerm: string;
  filterApproved: 'all' | 'approved' | 'pending';
}

// JSONL Document types
export interface JSONLDocumentMetadata {
  chapter: string | null;
  part: string | null;
  schedule: string | null;
  schedule_title: string | null;
  side_notes?: string[];
  references?: string[];
  id?: string;
  type?: string;
  raw_json?: Record<string, any>;
}

export interface JSONLDocument {
  id: string;
  text: string;
  metadata: JSONLDocumentMetadata;
  page_num: number;
  approved?: boolean;
  date_approved?: string;
  approved_by?: string;
  internal_id?: string; // For tracking in the app
}
