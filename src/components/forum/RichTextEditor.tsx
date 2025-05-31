import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon,
  List,
  ListOrdered
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  minHeight = "150px"
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = selectedText ? 
          `\`\`\`\n${selectedText}\n\`\`\`` : 
          "```\ncode snippet\n```";
        break;
      case 'ul':
        formattedText = selectedText ? 
          selectedText.split('\n').map(line => `- ${line}`).join('\n') : 
          "- list item";
        break;
      case 'ol':
        formattedText = selectedText ? 
          selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n') : 
          "1. list item";
        break;
      default:
        formattedText = selectedText;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const insertLink = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const linkMarkdown = `[${linkText || 'link text'}](${linkUrl || 'https://example.com'})`;
    
    const newValue = value.substring(0, start) + linkMarkdown + value.substring(start);
    onChange(newValue);
    
    setShowLinkInput(false);
    setLinkText('');
    setLinkUrl('');
    
    // Set cursor position after the inserted link
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    }, 0);
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormat('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormat('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormat('code')}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormat('ul')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormat('ol')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      
      {showLinkInput && (
        <div className="p-2 border-b bg-muted/30 flex gap-2 flex-wrap">
          <Input 
            placeholder="Link text" 
            value={linkText} 
            onChange={(e) => setLinkText(e.target.value)} 
            className="flex-1 min-w-[150px]"
          />
          <Input 
            placeholder="URL" 
            value={linkUrl} 
            onChange={(e) => setLinkUrl(e.target.value)} 
            className="flex-1 min-w-[150px]"
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={insertLink}
          >
            Insert Link
          </Button>
        </div>
      )}
      
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border-0 rounded-t-none min-h-[${minHeight}]`}
      />
      
      {value && (
        <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <p>Supports Markdown: **bold**, *italic*, ```code blocks```, [links](url), and lists</p>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;