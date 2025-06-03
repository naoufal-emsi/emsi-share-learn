import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '@/contexts/ThemeContext';

interface ResourceViewerProps {
  resourceType: string;
  fileUrl: string;
  fileName: string;
  content?: string;
}

// Map file extensions to language for syntax highlighting
const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const extensionMap: Record<string, string> = {
    // Programming languages
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    rs: 'rust',
    scala: 'scala',
    dart: 'dart',
    
    // Web technologies
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    
    // Data formats
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    
    // Config files
    ini: 'ini',
    conf: 'bash',
    
    // Shell scripts
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    bat: 'batch',
    ps1: 'powershell',
    
    // Documentation
    md: 'markdown',
    tex: 'latex',
    
    // Database
    sql: 'sql',
    
    // Other
    csv: 'csv',
    log: 'text',
    txt: 'text',
  };
  
  return extensionMap[extension] || 'text';
};

const ResourceViewer: React.FC<ResourceViewerProps> = ({ 
  resourceType, 
  fileUrl, 
  fileName,
  content 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // For debugging
  useEffect(() => {
    console.log('ResourceViewer mounted with:', { resourceType, fileName, fileUrl: fileUrl ? 'exists' : 'missing' });
  }, [resourceType, fileName, fileUrl]);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If content is already provided, use it
        if (content) {
          setFileContent(content);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from URL
        if (fileUrl && resourceType !== 'pdf' && resourceType !== 'image' && resourceType !== 'video') {
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error(`Failed to load content: ${response.status}`);
          const text = await response.text();
          setFileContent(text);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading content:', err);
        setError(`Failed to load content: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    loadContent();
  }, [resourceType, fileUrl, fileName, content]);

  if (loading && resourceType !== 'pdf' && resourceType !== 'image' && resourceType !== 'video') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Render based on resource type
  if (resourceType === 'pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    console.log('Rendering PDF viewer with URL:', fileUrl);
    return (
      <div className="w-full h-[500px] bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md">
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title={fileName}
        />
      </div>
    );
  }

  if (resourceType === 'markdown' || fileName.toLowerCase().endsWith('.md')) {
    return (
      <div className="prose dark:prose-invert max-w-none w-full">
        <ReactMarkdown>{fileContent || ''}</ReactMarkdown>
      </div>
    );
  }

  if (resourceType === 'image' || fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
    return (
      <div className="flex justify-center">
        <img 
          src={fileUrl} 
          alt={fileName} 
          className="max-w-full max-h-[500px] object-contain" 
        />
      </div>
    );
  }

  if (resourceType === 'video' || fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
    return (
      <div className="flex justify-center">
        <video 
          src={fileUrl} 
          controls 
          className="max-w-full max-h-[500px]"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Handle code files with syntax highlighting
  if (resourceType === 'code' || fileName.match(/\.(js|ts|py|java|html|css|php|c|cpp|h|rb|go|xml|yaml|yml)$/i)) {
    const language = getLanguageFromFileName(fileName);
    
    return (
      <div className="border rounded-md overflow-auto max-h-[500px] w-full">
        <Highlight
          theme={isDarkTheme ? themes.vsDark : themes.vsLight}
          code={fileContent || ''}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={{ ...style, padding: '1rem', overflowX: 'auto' }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })} style={{ display: 'flex' }}>
                  <span style={{ display: 'inline-block', width: '2em', userSelect: 'none', opacity: 0.5 }}>{i + 1}</span>
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    );
  }

  // Handle plain text files
  if (resourceType === 'text' || fileName.match(/\.(txt|log)$/i)) {
    return (
      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap w-full">
        {fileContent || ''}
      </pre>
    );
  }

  // Default viewer for other file types
  return (
    <div className="text-center p-4">
      <p>Preview not available for this file type.</p>
      <p className="text-sm text-muted-foreground mt-2">Please download the file to view its contents.</p>
    </div>
  );
};

export default ResourceViewer;