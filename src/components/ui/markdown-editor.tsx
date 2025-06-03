import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write markdown here...',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('edit');

  // Simple markdown renderer (could be replaced with a more robust solution)
  const renderMarkdown = (markdown: string) => {
    // Convert headers
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert lists
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\d+\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>');

    // Convert paragraphs
    html = html.replace(/^\s*\n(?!\n)[^\n]*/gim, '<p>$&</p>');

    // Convert code blocks
    html = html.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Convert line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  return (
    <div className={cn('border rounded-md', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="p-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-none"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 min-h-[200px] prose dark:prose-invert max-w-none">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
          ) : (
            <p className="text-muted-foreground">Nothing to preview</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkdownEditor;