import React from 'react';

/**
 * High Fashion Editorial Markdown Renderer
 * Parses bold (**text**), italic (*text*), inline code (`code`), headers (### Header),
 * bullet lists (- item / * item), and dividers (---) into rich styled React components.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');
  const elements = [];

  let currentList = null;
  let listType = null; // 'ul' | 'ol'

  const parseInlineFormatting = (text) => {
    if (!text) return null;

    // Tokenize text into parts for bold, italic, code, and underline
    // Regex matches:
    // 1. **bold** or __bold__
    // 2. *italic* or _italic_
    // 3. `code`
    // 4. [VP_XXX] Code Badges
    const tokens = [];
    const regex = /(\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|`[^`]+`|\[VP_\d+\])/g;
    
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];

      // Bold: **text** or __text__
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        const inner = matchText.slice(2, -2);
        tokens.push(
          <strong key={`b-${match.index}`} className="font-bold text-matcha-950">
            {parseInlineFormatting(inner)}
          </strong>
        );
      } else if (matchText.startsWith('__') && matchText.endsWith('__')) {
        const inner = matchText.slice(2, -2);
        tokens.push(
          <strong key={`b2-${match.index}`} className="font-bold text-matcha-950">
            {parseInlineFormatting(inner)}
          </strong>
        );
      }
      // Italic: *text* or _text_
      else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        const inner = matchText.slice(1, -1);
        tokens.push(
          <em key={`i-${match.index}`} className="italic text-matcha-800">
            {parseInlineFormatting(inner)}
          </em>
        );
      } else if (matchText.startsWith('_') && matchText.endsWith('_')) {
        const inner = matchText.slice(1, -1);
        tokens.push(
          <em key={`i2-${match.index}`} className="italic text-matcha-800">
            {parseInlineFormatting(inner)}
          </em>
        );
      }
      // Inline Code: `code`
      else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        const inner = matchText.slice(1, -1);
        tokens.push(
          <code
            key={`c-${match.index}`}
            className="font-mono text-[11px] bg-matcha-100/90 text-matcha-900 px-1.5 py-0.5 rounded border border-matcha-200 font-semibold"
          >
            {inner}
          </code>
        );
      }
      // Dataset Code Badge: [VP_001]
      else if (matchText.startsWith('[VP_') && matchText.endsWith(']')) {
        tokens.push(
          <span
            key={`vp-${match.index}`}
            className="font-fashion font-bold text-xs bg-matcha-900 text-cream-50 px-2 py-0.5 rounded-full inline-flex items-center shadow-xs mx-0.5"
          >
            {matchText}
          </span>
        );
      }

      lastIndex = match.index + matchText.length;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens.length === 0 ? text : tokens;
  };

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`list-${elements.length}`} className="space-y-1.5 my-2 list-decimal list-inside text-matcha-900 pl-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 text-matcha-900 pl-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-matcha-600 mt-1.5 flex-shrink-0" />
                <span className="flex-1">{parseInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Horizontal Divider: --- or ***
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="border-matcha-200/80 my-3.5" />
      );
      continue;
    }

    // 2. Headings: ### Heading or ## Heading or # Heading
    if (trimmed.startsWith('### ')) {
      flushList();
      const text = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h4 key={`h3-${i}`} className="font-fashion text-base font-bold text-matcha-950 mt-3.5 mb-1.5 flex items-center gap-1.5 border-b border-matcha-100 pb-1">
          {parseInlineFormatting(text)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      const text = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3 key={`h2-${i}`} className="font-fashion text-lg font-bold text-matcha-950 mt-4 mb-2 flex items-center gap-2 border-b border-matcha-200 pb-1">
          {parseInlineFormatting(text)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      const text = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h2 key={`h1-${i}`} className="font-fashion text-xl font-bold text-matcha-950 mt-4 mb-2">
          {parseInlineFormatting(text)}
        </h2>
      );
      continue;
    }

    // 3. Blockquote: > Quote
    if (trimmed.startsWith('> ')) {
      flushList();
      const text = trimmed.replace(/^>\s+/, '');
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-matcha-500 pl-3 my-2 text-matcha-800 italic bg-matcha-100/40 py-1 rounded-r-lg">
          {parseInlineFormatting(text)}
        </blockquote>
      );
      continue;
    }

    // 4. Bullet list item: - item or * item or • item
    if (/^[-*•]\s+/.test(trimmed)) {
      if (listType !== 'ul') {
        flushList();
        currentList = [];
        listType = 'ul';
      }
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      currentList.push(itemText);
      continue;
    }

    // 5. Numbered list item: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList();
        currentList = [];
        listType = 'ol';
      }
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      currentList.push(itemText);
      continue;
    }

    // 6. Normal text / paragraph or empty line
    flushList();

    if (trimmed.length > 0) {
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed my-1">
          {parseInlineFormatting(rawLine)}
        </p>
      );
    } else {
      // Empty line -> add small vertical gap
      elements.push(<div key={`gap-${i}`} className="h-1.5" />);
    }
  }

  flushList();

  return <div className={`markdown-body ${className}`}>{elements}</div>;
}
