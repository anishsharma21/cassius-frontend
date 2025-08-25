import React from 'react';

const ExpandableContent = ({ columns, showCheckboxes, expandableData, rowIndex, isExpanded, postContent }) => {
  if (!isExpanded || !expandableData || !expandableData[rowIndex]) return null;

  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="pl-12 pr-4 pb-4">
          {/* Post Content Section */}
          <div>
            <div className="text-sm text-gray-700 whitespace-pre-line max-h-50 overflow-y-scroll pr-2 post-content-scroll text-justify">
              {postContent}
            </div>
          </div>
        </div>
        <div className="bg-gray-50">
          <div className="pl-12 pr-3 py-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
            <div className="space-y-3">
              {expandableData[rowIndex].map((comment, commentIndex) => (
                <div key={commentIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{comment.timestamp || ''}</span>
                        <span className="text-xs text-gray-500">• {comment.upvotes || 0} upvotes</span>
                        <span className="text-xs text-gray-500">• {comment.comments || 0} comments</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    {comment.status && (
                      <div className="flex-shrink-0">
                        {comment.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableContent;
