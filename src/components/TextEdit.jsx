import React, { useEffect, useLayoutEffect, useRef } from "react";

const TextEdit = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  error,
  isLoading = false,
  // Optional: allow callers to tweak sizing caps without breaking existing usage
  minHeight = 120, // px
  maxHeight,       // px (leave undefined for no cap)
}) => {
  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  const placeholderText = `# Your Blog Post Title
## Introduction
Start your blog post here...

## Main Content
- Use **bold** for emphasis
- Use *italic* for subtle emphasis
- Create [links](https://example.com)
- Add \`code snippets\` inline

### Lists
1. Numbered lists
2. Are easy to create
3. With Markdown

- Bullet points
- Work the same way
- And are very readable

## Conclusion
End your post with a strong conclusion.`;

  // Core auto-grow logic
  const autoGrow = () => {
    const ta = textareaRef.current;
    if (!ta) return;

    // Reset to auto first so scrollHeight reflects reflowed/wrapped lines
    ta.style.height = "auto";

    const target = Math.max(ta.scrollHeight, minHeight);
    const capped =
      typeof maxHeight === "number" ? Math.min(target, maxHeight) : target;

    ta.style.height = `${capped}px`;
    ta.style.overflowY =
      typeof maxHeight === "number" && target > maxHeight ? "auto" : "hidden";
  };

  // Recompute height when content changes
  useLayoutEffect(() => {
    autoGrow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Respond to container/viewport width changes (line wrapping)
  useEffect(() => {
    const ro = new ResizeObserver(() => autoGrow());
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    const onWinResize = () => autoGrow();
    window.addEventListener("resize", onWinResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial paint tweak to avoid flicker
  useEffect(() => {
    requestAnimationFrame(autoGrow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1">
      {/* Text Editor Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Text Editor</h3>
      </div>

      {/* Title Edit Field */}
      {isLoading ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0">
              Title:
            </label>
            <div className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0">
              Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={onTitleChange}
              className={`flex-1 min-w-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter blog post title..."
            />
          </div>
        </div>
      )}

      {/* Content Edit Field */}
      {isLoading ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0">
              Content:
            </label>
          </div>
          <div className="mt-2 border border-gray-300 rounded-lg bg-gray-100 p-3">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0">
              Content:
            </label>
          </div>
          <div className="mt-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={placeholderText}
              style={{ minHeight: `${minHeight}px` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEdit;
