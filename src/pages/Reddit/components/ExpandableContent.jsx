import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRedditComments } from '../../../hooks/useRedditComments';
import ReplyButton from './ReplyButton';

const ExpandableContent = ({ columns, showCheckboxes, expandableData, rowIndex, isExpanded, postContent, postId, postLink, postData, onCommentReplyUpdate, localCommentReplyStates }) => {
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
  // Use React Query to fetch comments
  const { 
    data: comments, 
    isLoading: isLoadingComments, 
    error: commentsError,
    refetch: refetchComments 
  } = useRedditComments(postId, commentsLoaded);

  if (!isExpanded) return null;

  const handleLoadComments = async () => {
    if (!commentsLoaded) {
      setCommentsLoaded(true);
    } else {
      // If comments are already loaded, refetch them
      await refetchComments();
    }
  };



  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="pl-12 pr-4 pb-4">
          {/* Post Content Section */}
          <div>
            <div className="text-sm text-gray-700 max-h-50 overflow-y-scroll pr-2 post-content-scroll">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-gray-900" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 text-gray-900" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                }}
              >
                {postContent || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="bg-gray-50">
          <div className="pl-12 pr-3 py-4">
            {!commentsLoaded ? (
              <button
                onClick={handleLoadComments}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer mb-3"
              >
                Load Comments
              </button>
            ) : (
              <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
            )}
            <div className="space-y-3">
              {commentsLoaded && (
                <>
                  {isLoadingComments && (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-600">Loading comments...</div>
                    </div>
                  )}
                  
                  {commentsError && (
                    <div className="text-center py-4">
                      <div className="text-sm text-red-600">Error loading comments: {commentsError.message}</div>
                      <button
                        onClick={handleLoadComments}
                        className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {!isLoadingComments && !commentsError && comments && comments.length > 0 && (
                    comments.map((comment, commentIndex) => (
                      <div key={commentIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-500">• {comment.score || 0} upvotes</span>
                              <span className="text-xs text-gray-500">• {comment.num_comments || 0} comments</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.body}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <ReplyButton 
                              text="Generate"
                              iconID="chat"
                              onClick={() => {}}
                              isReplied={localCommentReplyStates && localCommentReplyStates[comment.id] !== undefined ? localCommentReplyStates[comment.id] : comment.replied_to}
                              content={comment.body}
                              contentType="comment"
                              link={comment.link || `${postLink}#${comment.id}`}
                              postContent={postContent}
                              leadId={comment.id}
                              onReplyUpdate={(newStatus) => {
                                console.log('🔄 Comment reply update:', comment.id, newStatus, 'Current states:', localCommentReplyStates);
                                onCommentReplyUpdate(comment.id, newStatus);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {!isLoadingComments && !commentsError && (!comments || comments.length === 0) && (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-500">No comments found</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableContent;