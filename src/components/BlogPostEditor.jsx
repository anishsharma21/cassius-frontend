import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const BlogPostEditor = ({ blogPost, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (blogPost) {
      setTitle(blogPost.title || '');
      setContent(blogPost.content || '');
      // Auto-resize textarea after content is set
      setTimeout(() => {
        if (textareaRef.current) {
          autoResizeTextarea(textareaRef.current);
        }
      }, 0);
    }
  }, [blogPost]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...blogPost,
        title,
        content,
        lastUpdated: new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  // Auto-resize textarea to fit content
  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  };

  // Handle content change and auto-resize
  const handleContentChange = (e) => {
    setContent(e.target.value);
    autoResizeTextarea(e.target);
  };



  if (!blogPost) return null;

  return (
    <div className="bg-white h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            title="Back to GEO Hub"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {title || 'Untitled Blog Post'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 p-6 gap-6">
        {/* Editor Section */}
        <div className={`flex-1 ${isEditing ? 'block' : 'hidden lg:block'}`}>
          <div className="h-full flex flex-col">
            {/* Body Text Editor Header */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Text Editor</h3>
            </div>

            {/* Title Edit Field */}
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter blog post title..."
              />
            </div>

            {/* Main Text Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
              style={{ 
                minHeight: '200px',
                height: 'auto',
                overflow: 'hidden'
              }}
              placeholder="# Your Blog Post Title

## Introduction
Start your blog post here...

## Main Content
- Use **bold** for emphasis
- Use *italic* for subtle emphasis
- Create [links](https://example.com)
- Add `code snippets` inline

### Lists
1. Numbered lists
2. Are easy to create
3. With Markdown

- Bullet points
- Work the same way
- And are very readable

## Conclusion
End your post with a strong conclusion."
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Preview</h3>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;
