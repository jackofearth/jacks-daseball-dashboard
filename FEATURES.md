# Baseball Manager Dashboard - Features

*Last updated: 2025-09-11*

## Core Features

### Player Management
- Import players from GameChanger CSV exports
- Add players manually with full stat entry
- Edit existing player stats
- Delete players
- Auto-calculate OPS from OBP and SLG
- Rate-based statistics (HR/AB, XBH/AB, Two-Out RBI/AB_RISP)

### Batting Order Generation
- **Traditional Baseball Strategy** - Simple, proven approach
- **Situational Analytics Strategy** - Advanced metrics optimization
- Drag-and-drop reordering of generated lineups
- Clear batting order functionality
- Fielding position assignment and management
- Persistent fielding position storage

### Data Management
- Local storage persistence
- Team customization (name, colors, logo)
- CSV export/import
- Clear all data options

### PDF Export System
- **Customizable PDF Generation** - Coach, opponent, date, and fielding position options
- **PDF Preview Modal** - Real-time preview before export
- **High-Resolution Export** - Professional quality PDF output
- **Print Functionality** - Direct printing from preview
- **Baseball Diamond Layout** - Visual fielding position display
- **Team Branding** - Custom colors, logos, and team names
- **Robust Fallback System** - Text-only PDF if image processing fails

### User Interface
- Responsive design
- Dark/light theme support
- Strategy comparison modal
- Comprehensive help page
- Confidence system with visual indicators
- Confirmation dialogs for destructive actions
- Persistent UI state (fielding toggle, positions)

### Advanced Features
- Confidence-based stat penalties (Full: 12+ AB, Medium: 6-11 AB, Low: 1-5 AB)
- Situational analytics with game theory
- Real-time stat calculations
- Tooltip explanations
- Quick navigation help system

## Technical Features
- React-based single page application
- TypeScript for type safety
- Drag-and-drop functionality
- CSV parsing and validation
- Local storage management
- Responsive CSS Grid layouts
- PDF generation with jsPDF and html2canvas
- Image processing and canvas manipulation
- State persistence across page refreshes
- Modal-based user interface components
