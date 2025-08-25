import React from 'react';
import ReactMarkdown from 'react-markdown';

const Preview = ({ content }) => {
  return (
    <div className="flex-1">
      {/* Preview Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Preview</h3>
      </div>
      
      {/* Preview Content */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
          {content ? (
            <ReactMarkdown 
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-gray-900" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 text-gray-900" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 text-gray-900" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">No content to preview</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
