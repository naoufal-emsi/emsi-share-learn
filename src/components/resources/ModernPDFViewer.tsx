import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ModernPDFViewerProps {
  fileUrl: string;
}

const ModernPDFViewer: React.FC<ModernPDFViewerProps> = ({ fileUrl }) => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerInitializedRef = useRef<boolean>(false);
  const viewerInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize once
    if (viewerInitializedRef.current) return;
    
    // Load PDF.js Express Viewer (most modern PDF viewer available)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@8.11.0/webviewer.min.js';
    script.async = true;
    
    script.onload = () => {
      if (!viewerContainerRef.current) return;
      
      // @ts-ignore - WebViewer is loaded from CDN
      window.WebViewer({
        path: 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@8.11.0/public',
        initialDoc: fileUrl,
        licenseKey: 'demo:1684341219952:7c7d3aea03000000006220c7c8ca6183b2d3d9e62c8a1a0e1e8f14cf4',
        css: 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@8.11.0/public/ui/style.css',
        disabledElements: [
          'toolsButton',
          'searchButton',
          'menuButton',
          'rubberStampToolGroupButton',
          'stampToolGroupButton',
          'fileAttachmentToolGroupButton',
          'calloutToolGroupButton',
          'undo',
          'redo',
          'eraserToolButton'
        ],
        fullAPI: false,
      }, viewerContainerRef.current).then((instance: any) => {
        viewerInstanceRef.current = instance;
        viewerInitializedRef.current = true;
        
        // Get UI API
        const { UI } = instance;
        
        // Set theme based on system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          UI.setTheme('dark');
        }
        
        // Add theme change listener
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          UI.setTheme(e.matches ? 'dark' : 'light');
        });
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.dispose();
      }
    };
  }, [fileUrl]);

  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md">
      <div 
        ref={viewerContainerRef} 
        className="w-full h-full"
        style={{ position: 'relative' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );
};

export default ModernPDFViewer;