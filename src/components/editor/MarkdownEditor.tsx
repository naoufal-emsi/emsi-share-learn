import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

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
  className = ''
}) => {
  return (
    <div className={`border rounded-md ${className}`}>
      <Tabs defaultValue="write">
        <div className="border-b px-3">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="write" className="p-0 mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-t-none"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 mt-0 prose dark:prose-invert max-w-none">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/50 p-2 text-xs text-muted-foreground border-t">
        <p>
          Supports Markdown: <strong>**bold**</strong>, <em>*italic*</em>, 
          [links](url), `code`, and more.
        </p>
      </div>
    </div>
  );
};

export default MarkdownEditor;