import DOMPurify from 'dompurify';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// Create a custom marked extension for highlighting
const highlightExtension = {
  renderer: {
    code(code: string, lang: string | undefined) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return `<pre><code class="hljs language-${language}">${hljs.highlight(code, { language }).value}</code></pre>`;
    },
  },
};

// Register the extension with marked
marked.use(highlightExtension);

// Configure marked with highlight.js for code syntax highlighting
marked.setOptions({
  // The 'highlight' option is deprecated/removed in newer versions.
  // Syntax highlighting is now handled via extensions.
  breaks: true,
  gfm: true
});

/**
 * Renders markdown content to sanitized HTML
 */
export function renderMarkdown(content: string): string {
  // Convert markdown to HTML synchronously
  const rawHtml = marked.parse(content);
  
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target'],
    ADD_TAGS: ['iframe']
  });
  
  return sanitizedHtml;
}