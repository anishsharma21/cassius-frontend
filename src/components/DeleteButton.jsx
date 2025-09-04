import React, { useState } from 'react';
import { useDeleteRedditLead } from '../hooks/useDeleteRedditLead';

const DeleteButton = ({ leadId, onDeleteSuccess }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate: deleteRedditLead, isPending } = useDeleteRedditLead();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deleteRedditLead(leadId, {
      onSuccess: () => {
        setShowConfirmation(false);
        if (onDeleteSuccess) {
          onDeleteSuccess(leadId);
        }
      },
      onError: () => {
        setShowConfirmation(false);
      }
    });
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleConfirmDelete}
          disabled={isPending}
          className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Confirm delete"
        >
          {isPending ? (
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          onClick={handleCancelDelete}
          disabled={isPending}
          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cancel"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeleteClick}
      className="inline-flex items-center p-1 rounded-full text-xs bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
      title="Delete lead"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
};

export default DeleteButton;