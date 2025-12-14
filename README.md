# Ground Truth Management - Next.js Frontend

Simple research tool for managing ground truth datasets with file-based storage.

## Features

- **File-based storage** - No database needed, data stored in `data/` folder
- **Auto-save** - All changes automatically saved to file
- **Import/Export** - JSON, JSONL, CSV formats
- **Dark mode** - Toggle between light and dark themes
- **Search & filter** - Find entries quickly
- **Approval tracking** - Track who approved and when

## Tech Stack

- Next.js 16.0.7
- React 19
- TypeScript
- Tailwind CSS
- Server Actions (for file operations)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Project Structure

```
app/
├── actions/           # Server Actions
│   ├── dataset.ts    # Load/save dataset
│   └── export.ts     # Export functionality
├── components/        # React components
│   ├── FileImport.tsx
│   ├── GroundTruthTable.tsx
│   ├── ViewModal.tsx
│   ├── EditModal.tsx
│   ├── AddNewModal.tsx
│   ├── HowToModal.tsx
│   └── StatsBar.tsx
├── contexts/
│   └── ThemeContext.tsx
├── lib/
│   ├── file-storage.ts  # File system operations
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── layout.tsx           # Root layout
├── page.tsx            # Main page
└── globals.css         # Global styles

data/
├── current-dataset.json    # Active dataset
└── exports/                # Export history
```

## Data Storage

All data is stored in the `data/` directory:

- **`data/current-dataset.json`** - Currently active dataset
- **`data/exports/`** - Export files (JSON, JSONL, CSV)

The `data/` directory is gitignored to keep your research data private.

## How It Works

1. **Import** - Upload JSON file, auto-saves to `data/current-dataset.json`
2. **Edit** - Make changes, auto-saves on every change
3. **Export** - Download in JSON/JSONL/CSV format, saved to `data/exports/`

## Usage

### First Time

1. Open app → Enter your name
2. Import a JSON file (or use sample dataset)
3. Start reviewing and approving entries

### Import Format

```json
[
  {
    "question": "What is machine learning?",
    "ground_truth_chunk_id": "ML-101",
    "ground_truth_text": "Machine learning is..."
  }
]
```

### Export Formats

- **JSON** - Standard JSON array
- **JSONL** - One JSON object per line
- **CSV** - Comma-separated values

## Notes

- All data is stored locally on your machine
- No authentication or user management
- Designed for single-user research workflows
- Data persists between sessions
- Automatic backups in `data/exports/`

## License

MIT
