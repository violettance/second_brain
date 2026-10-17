import React, { useEffect, useId } from 'react';
import mermaid from 'mermaid';
import { logger } from '../../lib/logger';

interface NoteRendererProps {
  content: string;
}

// Basic markdown parsing logic (bold, italic, code, links)
const parseMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={index} className="bg-surface-muted px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="text-brand-secondary-deep hover:text-brand-secondary-deep underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const NoteRenderer: React.FC<NoteRendererProps> = ({ content }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric chars

  useEffect(() => {
    // Initialize mermaid only once
    if (!window.mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        logLevel: 0,
        themeVariables: {
          background: 'var(--color-brand-dark)',
          primaryColor: 'var(--color-brand-dark)',
          primaryTextColor: 'var(--color-surface-subtle)',
          lineColor: 'var(--color-neutral-strong)',
          textColor: 'var(--color-neutral-strong)',
        },
      });
      window.mermaidInitialized = true;
    }
    
    // Render mermaid diagrams
    const timer = setTimeout(async () => {
        try {
            const elements = document.querySelectorAll(`.mermaid-${id}`);
            if (elements.length > 0) {
                // Process each element individually
                for (const element of elements) {
                  if (element.textContent) {
                    const diagramCode = element.textContent.trim();
                    logger.info('Rendering Mermaid diagram', { diagramCode: diagramCode.substring(0, 100) + '...' });
                    try {
                      const { svg } = await mermaid.render(`diagram-${id}-${Date.now()}`, diagramCode);
                      element.innerHTML = svg;
                    } catch (renderError) {
                      logger.error('Mermaid render error', { error: renderError.message });
                      element.innerHTML = `<div class="text-brand-primary-deep text-sm p-4 border border-red-400/30 rounded bg-red-900/20">
                        <strong>Diagram Error:</strong><br/>
                        <pre class="mt-2 text-xs overflow-auto">${diagramCode}</pre>
                      </div>`;
                    }
                  }
                }
            }
        } catch (e) {
            logger.error("Error processing mermaid diagrams", { error: e.message });
        }
    }, 100);

    return () => clearTimeout(timer);
  }, [content, id]);

  const renderParts = () => {
    if (!content) return null;

    // Split content by mermaid code blocks
    const parts = content.split(/(```mermaid[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```mermaid')) {
        const diagramCode = part.replace(/^```mermaid\n|```$/g, '');
        // Each mermaid div needs a unique class for mermaid.run to target it
        return (
          <div key={index} className={`mermaid mermaid-${id} flex justify-center p-4 my-4 bg-canvas rounded-lg border border-ink`}>
            {diagramCode}
          </div>
        );
      }
      
      // For non-mermaid parts, split by newlines and parse markdown
      return part.split('\n').map((line, lineIndex) => (
        <div key={`${index}-${lineIndex}`}>
          {parseMarkdown(line)}
        </div>
      ));
    });
  };

  return (
    <div className="whitespace-pre-wrap text-ink text-base leading-relaxed">
      {renderParts()}
    </div>
  );
};
