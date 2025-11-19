# Czech Psalter Manuscripts Visualization

Interactive web application for analyzing and visualizing variations across medieval Czech psalter manuscripts.

## Overview

This application provides comprehensive tools for exploring textual variations across 33 medieval Czech psalter manuscripts. It enables researchers to:

- **Visualize manuscript relationships** through cluster analysis (heatmap, dendrogram, network graph)
- **Compare text variations** side-by-side with color-coded change types
- **Analyze statistical patterns** across manuscript families
- **Search and filter** specific psalms and manuscripts

## Features

### 1. Cluster Analysis View
- **Similarity Heatmap**: 33×33 matrix showing pairwise similarity percentages
- **Hierarchical Dendrogram**: Tree visualization of manuscript relationships
- **Network Graph**: Interactive force-directed graph showing high-similarity connections (>95%)

### 2. Text Comparison View
- Side-by-side comparison of up to 5 manuscripts
- Color-coded variations:
  - **Green**: Autosemantic changes (major semantic differences)
  - **Orange**: Synsemantic changes (minor grammatical differences)
  - **White**: Identical to reference (BiblPad)
- Search functionality for Latin and Czech terms

### 3. Statistics & Profiles View
- Overall distribution of change types
- Top 10 most "innovative" vs "conservative" manuscripts
- Detailed manuscript profiles with metadata:
  - Full manuscript name
  - Date of creation
  - Current location
  - Variation statistics

## Data Sources

- **Excel file**: `Kolace Ps_autosemantika_synsemantika_final_zaloha.xlsx`
  - Contains word-by-word comparison across 33 manuscripts
  - Color-coded cells indicate change types
  - Covers Psalms 6, 50, 100, 148, and aggregate data

- **PDF file**: `Prvni_tisteny_zaltar_KOMPLET_imprimatur-pages.pdf`
  - Manuscript metadata (dates, locations, full names)
  - Translation family classifications
  - Historical context

## Technical Stack

### Frontend
- **React 18** with **TypeScript**
- **Material-UI (MUI)** for UI components
- **D3.js** for advanced visualizations
- **Recharts** for statistical charts
- **Vite** for build tooling

### Data Processing
- **Python** with pandas, openpyxl, scipy
- Hierarchical clustering (Ward's method)
- Similarity matrix calculation
- JSON export for frontend consumption

## Project Structure

```
czech-psalter-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClusterView.tsx       # Cluster visualizations
│   │   │   ├── ComparisonView.tsx    # Text comparison
│   │   │   ├── StatisticsView.tsx    # Statistics dashboard
│   │   │   └── SearchPanel.tsx       # Search functionality
│   │   ├── data/
│   │   │   ├── psalter_data.json     # Processed Excel data
│   │   │   ├── similarity_analysis.json  # Similarity matrices
│   │   │   └── manuscript_metadata.json  # PDF metadata
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Main application
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── backend/                          # (Future: Python API)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for data processing)

### Installation

1. **Install frontend dependencies**:
   ```bash
   cd czech-psalter-app/frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Data Processing

The raw Excel and PDF files are processed using Python scripts:

```bash
# Install Python dependencies
pip install pandas openpyxl scipy scikit-learn

# Process data (already done - results in frontend/src/data/)
python process_data.py
```

## Usage Guide

### Cluster Analysis
1. Select visualization type (Heatmap/Dendrogram/Network)
2. Hover over elements to see similarity percentages
3. Identify manuscript clusters and relationships

### Text Comparison
1. Choose a psalm from the dropdown
2. Select 1-5 manuscripts to compare
3. Use search to find specific words
4. Observe color-coded variations

### Statistics
1. View overall distribution pie chart
2. Examine top innovative/conservative manuscripts
3. Browse detailed manuscript profiles with metadata
4. Sort by variation rate or other metrics

## Key Findings

Based on the analysis of 630 word positions across 33 manuscripts:

- **Similarity Range**: 50-100% (most pairs above 90%)
- **Most Similar Pairs**:
  - LitSZ - StenSZ: 99.84%
  - Kruml - Talm: 99.52%

- **Most Divergent Manuscript**: ŽaltHor (50-55% similarity with others)
- **Average Variation Rate**: ~9% across all manuscripts

## Future Enhancements

- [ ] Export functionality (CSV, PDF reports)
- [ ] Advanced filtering by date ranges
- [ ] Translation family visualization
- [ ] Full-text search across all psalms
- [ ] Collaborative annotation features
- [ ] REST API for programmatic access

## Credits

**Data compiled by**: [Your name]
**Application developed by**: Claude (Anthropic)

## License

[Specify license - e.g., MIT, CC BY-NC-SA 4.0]

## Contact

For questions or collaboration inquiries, please contact: [Your email]
