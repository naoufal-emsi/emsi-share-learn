import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  maxLength?: number;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight, maxLength }) => {
  if (!highlight.trim()) {
    // If no highlight term, return truncated text if maxLength is provided
    if (maxLength && text.length > maxLength) {
      return <span>{text.substring(0, maxLength)}...</span>;
    }
    return <span>{text}</span>;
  }

  // Escape special regex characters in the highlight string
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  
  // Split the text by the highlight term
  const parts = text.split(regex);
  
  // If maxLength is provided, truncate the text around the first match
  if (maxLength && text.length > maxLength) {
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const firstIndex = lowerText.indexOf(lowerHighlight);
    
    if (firstIndex >= 0) {
      // Calculate start and end positions to show text around the match
      let start = Math.max(0, firstIndex - Math.floor(maxLength / 2));
      let end = Math.min(text.length, start + maxLength);
      
      // Adjust start if end is at the text boundary
      if (end === text.length) {
        start = Math.max(0, end - maxLength);
      }
      
      // Extract the relevant portion of text
      const truncatedText = text.substring(start, end);
      
      // Add ellipsis if needed
      const prefix = start > 0 ? '...' : '';
      const suffix = end < text.length ? '...' : '';
      
      // Highlight the term in the truncated text
      const truncatedParts = truncatedText.split(regex);
      
      return (
        <span>
          {prefix}
          {truncatedParts.map((part, i) => 
            regex.test(part) ? 
              <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
              <span key={i}>{part}</span>
          )}
          {suffix}
        </span>
      );
    }
  }
  
  // If no truncation needed or no match found, highlight all occurrences
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? 
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
          <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default HighlightedText;