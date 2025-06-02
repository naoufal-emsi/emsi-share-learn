import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PDFViewerSafe from './PDFViewerSafe';
import { Highlight, themes } from 'prism-react-renderer';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useTheme } from '@/contexts/ThemeContext';

interface ResourceViewerProps {
  resourceType: string;
  fileUrl: string;
  fileName: string;
  content?: string;
}

// Format JSON for better readability
const formatJSON = (jsonString: string): string => {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return jsonString;
  }
};

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

// Check if content is LaTeX
const isLatexContent = (content: string): boolean => {
  // Look for common LaTeX patterns
  return (
    content.includes('\\documentclass') ||
    content.includes('\\begin{document}') ||
    (content.includes('\\begin{') && content.includes('\\end{')) ||
    content.includes('\\section{') ||
    content.includes('\\subsection{')
  );
};

// Extract math expressions from LaTeX content
const extractMathExpressions = (content: string): string[] => {
  const mathExpressions: string[] = [];
  const mathRegex = /\$\$(.*?)\$\$|\$(.*?)\$|\\begin\{equation\}(.*?)\\end\{equation\}/gs;
  
  let match;
  while ((match = mathRegex.exec(content)) !== null) {
    const expr = match[1] || match[2] || match[3];
    if (expr) mathExpressions.push(expr.trim());
  }
  
  return mathExpressions;
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

  if (loading && resourceType !== 'pdf' && resourceType !== 'json') {
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
    return <PDFViewerSafe fileUrl={fileUrl} />;
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

  // Handle JSON files
  if (resourceType === 'json' || fileName.toLowerCase().endsWith('.json')) {
    // Show a simple loading state if content is still loading
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Use a try-catch block to handle JSON parsing immediately
    let formattedJSON = '';
    try {
      if (fileContent) {
        const obj = JSON.parse(fileContent);
        formattedJSON = JSON.stringify(obj, null, 2);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      formattedJSON = fileContent || '';
    }
    
    return (
      <div className="border rounded-md overflow-auto max-h-[500px] w-full">
        <Highlight
          theme={isDarkTheme ? themes.vsDark : themes.vsLight}
          code={formattedJSON}
          language="json"
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

  // Handle LaTeX files
  if (fileName.endsWith('.tex') || (fileContent && isLatexContent(fileContent))) {
    // For LaTeX files, we'll show syntax highlighting and try to render math expressions
    const mathExpressions = fileContent ? extractMathExpressions(fileContent) : [];
    
    return (
      <div className="space-y-4 w-full">
        {/* Syntax highlighted LaTeX code */}
        <div className="border rounded-md overflow-auto max-h-[300px] w-full">
          <Highlight
            theme={isDarkTheme ? themes.vsDark : themes.vsLight}
            code={fileContent || ''}
            language="latex"
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
        
        {/* Math expressions preview */}
        {mathExpressions.length > 0 && (
          <div className="border rounded-md p-4 bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Math Expressions Preview</h3>
            <div className="space-y-2">
              {mathExpressions.slice(0, 5).map((expr, index) => (
                <div key={index} className="py-2">
                  <BlockMath math={expr} />
                </div>
              ))}
              {mathExpressions.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  {mathExpressions.length - 5} more expressions not shown...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle CSV files
  if (fileName.endsWith('.csv')) {
    // Simple CSV renderer
    const rows = fileContent?.split('\n').map(row => row.split(',')) || [];
    
    if (rows.length > 0) {
      return (
        <div className="overflow-auto max-h-[500px] w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-muted">
                {rows[0].map((cell, i) => (
                  <th key={i} className="border px-2 py-1 text-left overflow-hidden text-ellipsis">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                  {row.map((cell, j) => (
                    <td key={j} className="border px-2 py-1 overflow-hidden text-ellipsis">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
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