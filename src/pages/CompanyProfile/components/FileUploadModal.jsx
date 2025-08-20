import React, { useState, useRef } from 'react';
import API_ENDPOINTS from '../../../config/api';

const FileUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef(null);

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.txt'];

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Filter files by type and extension
    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      return isValidType && isValidExtension;
    });

    // Add valid files to selection
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Allow re-selecting the same files by resetting input value
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({});

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Log token for debugging
        console.log('Token found:', token ? 'Yes' : 'No');
        console.log('Token length:', token ? token.length : 0);

        const response = await fetch(API_ENDPOINTS.uploadFile, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (!response.ok) {
          let errorMessage = `Failed to upload ${file.name}`;
          // Try JSON first to extract { detail }
          try {
            const data = await response.json();
            if (data && typeof data === 'object' && data.detail) {
              errorMessage = data.detail;
            } else if (data) {
              errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
            }
          } catch (_) {
            // Fallback to text if JSON parse fails
            try {
              const text = await response.text();
              if (text) errorMessage = text;
            } catch (_) {
              // ignore
            }
          }

          console.error(`Upload failed for ${file.name}:`, response.status, errorMessage);

          // Handle 401 Unauthorized specifically
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        setUploadProgress(prev => ({
          ...prev,
          [index]: { status: 'success', result }
        }));

        return result;
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // Separate successful and failed uploads
      const successfulFiles = [];
      const failedFiles = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulFiles.push(index);
        } else {
          failedFiles.push(index);
          // Set error status for failed uploads
          setUploadProgress(prev => ({
            ...prev,
            [index]: { status: 'error', error: result.reason.message }
          }));
        }
      });
      
      // Set success count for display
      setSuccessCount(successfulFiles.length);
      
      // Remove successful files from selection
      setSelectedFiles(prev => prev.filter((_, index) => !successfulFiles.includes(index)));
      
      // Clear progress for successful files
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        successfulFiles.forEach(index => delete newProgress[index]);
        return newProgress;
      });
      
      // If all files succeeded, close modal and call success callback
      if (failedFiles.length === 0) {
        if (onUploadSuccess) {
          // Pass the successful file information for optimistic updates
          const successfulFileData = successfulFiles.map(index => {
            const file = selectedFiles[index];
            return {
              filename: file.name,
              size: file.size,
              last_modified: new Date().toISOString(),
              uploaded_by: 'Current User', // We could get this from context if needed
              uploaded_at: new Date().toISOString()
            };
          });
          onUploadSuccess(successfulFileData);
        }
        onClose();
      } else {
        // Some files failed, keep modal open to show errors
        if (onUploadSuccess) {
          // Pass the successful file information for optimistic updates
          const successfulFileData = successfulFiles.map(index => {
            const file = selectedFiles[index];
            return {
              filename: file.name,
              size: file.size,
              last_modified: new Date().toISOString(),
              uploaded_by: 'Current User',
              uploaded_at: new Date().toISOString()
            };
          });
          onUploadSuccess(successfulFileData);
        }
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadProgress({});
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Supported formats: pdf, docx, xlsx, txt.
          </p>
          <button
            onClick={openFileDialog}
            disabled={isUploading}
            className="w-full cursor-pointer px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedFiles.length === 0 ? 'Select files' : 'Select files'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Selected:</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {uploadProgress[index] && (
                      <p className={`text-xs ${
                        uploadProgress[index].status === 'success' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {uploadProgress[index].status === 'success' 
                          ? 'Uploaded successfully' 
                          : `${uploadProgress[index].error}`
                        }
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-start items-center mt-4 space-x-4">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 cursor-pointer py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default"
          >
            {isUploading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Uploading
              </span>
            ) : 'Upload'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
