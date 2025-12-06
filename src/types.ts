export interface GroundTruthEntry {
  question: string;
  ground_truth_chunk_id: string;
  ground_truth_text: string;
  approved?: boolean;
  date_approved?: string;
  id?: string; // Internal ID for tracking
}

export interface AppState {
  entries: GroundTruthEntry[];
  filteredEntries: GroundTruthEntry[];
  searchTerm: string;
  filterApproved: 'all' | 'approved' | 'pending';
}
