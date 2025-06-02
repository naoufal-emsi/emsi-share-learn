import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerSafeProps {
  fileUrl: string;
}

const PDFViewerSafe: React.FC<PDFViewerSafeProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
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
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="w-full"
        >
          <Page 
            pageNumber={pageNumber} 
            width={Math.min(600, window.innerWidth - 40)}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
        
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
      </div>
    </div>
  );
};

export default PDFViewerSafe;