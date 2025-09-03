import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRedditComments } from '../../../hooks/useRedditComments';
import ReplyButton from './ReplyButton';

const ExpandableContent = ({ isExpanded, postContent, postId, postLink, onCommentReplyUpdate, localCommentReplyStates }) => {
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
  // Auto-load comments when expanded
  React.useEffect(() => {
    if (isExpanded && !commentsLoaded) {
      setCommentsLoaded(true);
    }
  }, [isExpanded, commentsLoaded]);
  
  // Use React Query to fetch comments
  const { 
    data: comments, 
    isLoading: isLoadingComments, 
    error: commentsError,
    refetch: refetchComments 
  } = useRedditComments(postId, commentsLoaded);

  if (!isExpanded) return null;

  const handleLoadComments = async () => {
    // Refetch comments when clicked (if already loaded)
    await refetchComments();
  };



  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="pl-4 pr-4 pb-4">
          {/* Post Content Section */}
          <div>
            <div className="text-sm text-gray-700 max-h-50 overflow-y-scroll pr-2 post-content-scroll">
              <ReactMarkdown 
                components={{
                  h1: ({...props}) => <h1 className="text-xl font-bold mb-2 text-gray-900" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                  h3: ({...props}) => <h3 className="text-base font-bold mb-1 text-gray-900" {...props} />,
                  p: ({...props}) => <p className="mb-2" {...props} />,
                  strong: ({...props}) => <strong className="font-bold" {...props} />,
                  em: ({...props}) => <em className="italic" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  li: ({...props}) => <li className="mb-1" {...props} />,
                }}
              >
                {postContent || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="bg-gray-50">
          <div className="pl-4 pr-3 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Comments</h4>
              {commentsLoaded && !isLoadingComments && (
                <button
                  onClick={handleLoadComments}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                  title="Refresh comments"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              )}
            </div>
            <div className="space-y-3">
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
                    className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors cursor-pointer"
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
                          text="AI Reply"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableContent;