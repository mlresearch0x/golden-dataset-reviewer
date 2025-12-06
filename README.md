# Ground Truth Management System

A modern web application for managing, editing, and tracking approval status of ground truth datasets for research purposes.

## Features

- **Import/Export**: Import ground truth data from JSON files and export edited versions
- **Edit Questions**: Edit question text while keeping ground truth chunk IDs and text locked
- **Add New Entries**: Create new ground truth entries with all required fields
- **Delete Entries**: Remove entries with confirmation prompts
- **Approval Tracking**: Mark questions as approved with automatic date stamping
- **Search & Filter**: Search across all fields and filter by approval status
- **Statistics Dashboard**: Real-time stats showing total entries, approved count, pending count, and approval rate
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Data Format

The application expects JSON files with the following structure:

```json
[
  {
    "question": "Your question here?",
    "ground_truth_chunk_id": "Section 11",
    "ground_truth_text": "The actual text from the source document...",
    "approved": false,
    "date_approved": null
  }
]
```

### Field Descriptions

- **question** (editable): The question text
- **ground_truth_chunk_id** (locked): The reference ID for the source chunk
- **ground_truth_text** (locked): The actual text from the source document
- **approved** (auto-managed): Boolean flag for approval status
- **date_approved** (auto-managed): ISO timestamp when approved

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open http://localhost:5173/ in your browser.

## Usage Guide

### Importing Data

1. Click the "Choose File" button in the Import Data section
2. Select a JSON or JSONL file with ground truth entries
3. The data will be loaded and displayed in the table

**Example**: Import your `gold_dataset_nigeria_tax_act_2025_december_05_2025.jsonl` file

### Editing Entries

1. Click "Edit" on any entry in the table
2. Modify the question text (chunk ID and text are locked for data integrity)
3. Click "Save Changes" to apply edits

### Adding New Entries

1. Click the "+ Add New Entry" button
2. Fill in all required fields:
   - Question
   - Ground Truth Chunk ID
   - Ground Truth Text
3. Click "Add Entry" to create the new entry

### Approving Entries

1. Click "Approve" on any pending entry
2. The entry will be marked as approved with the current date
3. Approved entries show a green badge

### Deleting Entries

1. Click "Delete" on any entry
2. Click "Confirm?" when prompted to confirm deletion (you have 3 seconds to confirm)

### Searching and Filtering

- **Search**: Use the search box to find entries by question, chunk ID, or text
- **Filter**: Use the dropdown to show:
  - All Entries
  - Approved Only
  - Pending Only

### Exporting Data

1. Click "Export to JSON" button
2. A JSON file will be downloaded with the current date in the filename
3. The export includes all your edits and approval status
4. Internal IDs are removed for clean data

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **Modern ESNext** - Latest JavaScript features

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileImport.tsx       # File upload component
│   │   ├── StatsBar.tsx         # Statistics dashboard
│   │   ├── GroundTruthTable.tsx # Main data table
│   │   ├── EditModal.tsx        # Edit entry modal
│   │   └── AddNewModal.tsx      # Add new entry modal
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # Utility functions
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles (Tailwind)
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## Build Commands

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

Research Tool - For internal use
# golden-dataset-reviewer
