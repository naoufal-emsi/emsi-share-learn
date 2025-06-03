import React from 'react';

interface SimplePDFViewerProps {
  fileUrl: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ fileUrl }) => {
  // Create a blob URL from the file URL to avoid cross-origin issues
  const handleViewPDF = () => {
    // Open PDF in a new tab using object tag which is more compatible with privacy browsers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDF Viewer</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              #pdf-container { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <object id="pdf-container" data="${fileUrl}" type="application/pdf" width="100%" height="100%">
              <p>Your browser doesn't support embedded PDFs. <a href="${fileUrl}" download>Click here to download the PDF</a>.</p>
            </object>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md flex flex-col items-center justify-center">
      <div className="text-center p-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium">PDF Preview</h3>
        <p className="mt-1 text-sm text-gray-500">
          Click below to open the PDF in a new tab
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleViewPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View PDF
          </button>
          <a
            href={fileUrl}
            download
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFViewer;