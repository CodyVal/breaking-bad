import React from 'react';
import MarkdownIt from 'markdown-it';

interface MarkdownMessageProps {
  content: string;
}

const md = new MarkdownIt();

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const renderedContent = md.render(content);

  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default MarkdownMessage;

