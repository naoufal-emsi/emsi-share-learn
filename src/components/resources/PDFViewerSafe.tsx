import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2 } from 'lucide-react';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerSafeProps {
  fileUrl: string;
}

const PDFViewerSafe: React.FC<PDFViewerSafeProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error): void {
    console.error('Failed to load PDF:', err);
    setError('Failed to load PDF file.');
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
        return newPageNumber;
      }
      return prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
          className="w-full"
        >
          <Page 
            pageNumber={pageNumber} 
            width={Math.min(600, window.innerWidth - 40)}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={null}
          />
        </Document>
        
        {numPages && (
          <div className="flex items-center gap-4 mt-4">
            <button
              disabled={pageNumber <= 1}
              onClick={previousPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <p>
              Page {pageNumber} of {numPages || '--'}
            </p>
            <button
              disabled={numPages !== null && pageNumber >= numPages}
              onClick={nextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewerSafe;