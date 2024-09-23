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
      className="prose prose-base prose-p:leading-normal prose-headings:leading-normal prose-headings:my-0 prose-p:my-0 prose-ul:my-0 prose-ul:flex prose-ul:flex-col prose-ol:my-0 prose-li:my-0 dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default MarkdownMessage;

