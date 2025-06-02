# Security Updates for EMSI Share Learn Platform

## Frontend Security Issues

The project had several security vulnerabilities in its dependencies that have been addressed:

### 1. React Syntax Highlighter
- **Issue**: Moderate severity vulnerability in `prismjs` used by `react-syntax-highlighter`
- **Fix**: Updated to version 15.6.1

### 2. PDF Viewer Components
- **Issue**: High severity vulnerability in `pdfjs-dist` used by `@react-pdf-viewer/core`
- **Fix**: Added a safer alternative component `PDFViewerSafe.tsx` using `react-pdf` library
- **Action Required**: Replace usage of the old PDFViewer component with the new safer one

### 3. XLSX Library
- **Issue**: High severity vulnerabilities in `xlsx` library
- **Status**: No direct fix available
- **Recommendation**: Consider using alternative spreadsheet libraries if needed

## Backend Dependencies

There were issues installing some Python dependencies:

1. **psycopg2-binary**: Compilation issues on Windows with Python 3.13
   - Solution: Use a pre-compiled wheel or install PostgreSQL development libraries

2. **Pillow**: Installation issues with version 10.1.0
   - Solution: Try installing a newer version or use a pre-compiled wheel

## Recommendations

1. For frontend:
   - Migrate from vulnerable PDF viewer to the new safer component
   - Consider alternatives to xlsx library if spreadsheet functionality is critical

2. For backend:
   - Use Python 3.10 or 3.11 for better compatibility with dependencies
   - Install PostgreSQL development libraries before installing psycopg2-binary

## How to Verify

Run `npm audit` to check for remaining vulnerabilities in the frontend.

## References

- [GHSA-wgrm-67xf-hhpq](https://github.com/advisories/GHSA-wgrm-67xf-hhpq) - PDF.js vulnerability
- [GHSA-x7hr-w5r2-h6wg](https://github.com/advisories/GHSA-x7hr-w5r2-h6wg) - PrismJS DOM Clobbering vulnerability
- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) - Prototype Pollution in sheetJS