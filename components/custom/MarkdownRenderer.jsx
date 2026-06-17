
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export function MarkdownRenderer({ content }) {
  return (
    <div className="prose max-w-none w-full p-0 dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}