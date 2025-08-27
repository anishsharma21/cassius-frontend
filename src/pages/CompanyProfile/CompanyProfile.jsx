import React, { useEffect, useState } from 'react';
import { FileTile, FileUploadModal } from './components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../../config/api';



const CompanyProfile = () => {
    console.log('CompanyProfile component is mounting!');
    
    const queryClient = useQueryClient();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Use React Query to get company data - it will use cache if available, fetch if not
    const { data: company, isLoading, error } = useQuery({
      queryKey: ['company'],
      queryFn: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(API_ENDPOINTS.companyProfile, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });

    // Use React Query to get company files from S3
    const { data: companyFiles, isLoading: filesLoading, error: filesError, isFetching: filesFetching } = useQuery({
      queryKey: ['companyFiles'],
      queryFn: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(API_ENDPOINTS.getCompanyFiles, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company files');
        }

        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });

    // Track if this is the very first load (no data exists yet)
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    
    // Track which files are currently being deleted
    const [deletingFiles, setDeletingFiles] = useState(new Set());
    
    useEffect(() => {
        // Only show skeletons on the very first load when no data exists
        if (companyFiles !== undefined) {
            setIsFirstLoad(false);
        }
    }, [companyFiles]);

    // Determine if we should show loading skeletons
    // Only show on the very first page load when no data exists
    const shouldShowLoadingSkeletons = isFirstLoad && filesLoading;
    
    // Debug logging
    console.log('CompanyProfile render - company data:', company);
    console.log('CompanyProfile render - isLoading:', isLoading);
    console.log('CompanyProfile render - error:', error);



    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleUploadSuccess = (uploadedFiles) => {
        if (uploadedFiles && uploadedFiles.length > 0) {
            // Optimistically add the new files to the UI immediately
            const currentFiles = companyFiles || [];
            const newFiles = uploadedFiles.map(file => ({
                ...file,
                // Add any additional properties that might be needed
                fileType: file.filename.split('.').pop()?.toLowerCase() || 'file'
            }));
            
            // Update the cache optimistically by adding new files at the top
            const updatedFiles = [...newFiles, ...currentFiles];
            queryClient.setQueryData(['companyFiles'], updatedFiles);
        }
        
        // Refresh company data (but not files since we already updated them)
        queryClient.invalidateQueries(['company']);
    };

    const handleDeleteFile = async (filename) => {
        try {
            // Set loading state for this file
            setDeletingFiles(prev => new Set(prev).add(filename));
            
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_ENDPOINTS.deleteCompanyFile}/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete file');
            }

            // File deleted successfully, now remove it from the UI
            const currentFiles = companyFiles || [];
            const updatedFiles = currentFiles.filter(file => file.filename !== filename);
            
            // Update the cache after successful API response
            queryClient.setQueryData(['companyFiles'], updatedFiles);
            
            // Return success to indicate completion
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            
            alert(`Failed to delete file: ${error.message}`);
            // Re-throw error so FileTile can handle it
            throw error;
        } finally {
            // Clear loading state for this file
            setDeletingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(filename);
                return newSet;
            });
        }
    };

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        
        // Check if it's today
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) return 'Uploaded today';
        
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) === 1 ? '' : 's'} ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) === 1 ? '' : 's'} ago`;
        return `${Math.ceil(diffDays / 365)} year${Math.ceil(diffDays / 365) === 1 ? '' : 's'} ago`;
    };



    // Simple fallback to ensure component renders something
    if (error) {
        console.error('CompanyProfile error:', error);
        return (
            <div className="p-6">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-1">Company Profile</h1>
                    <p className="text-gray-600">Update your company profile to help Cassius understand your business</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-red-800 mb-4">Error Loading Company Profile</h2>
                    <p className="text-red-600 text-sm">Error: {error.message}</p>
                </div>
            </div>
        );
    }

    // Show skeleton loading while waiting for data
    if (isLoading || !company) {
        return (
            <div classname="p-6">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-1">Company Profile</h1>
                    <p className="text-gray-600">Update your company profile to help Cassius understand your business</p>
                </div>
                <br></br>
                <div style={{ maxWidth: '800px', marginLeft: '1rem', marginRight: '1rem' }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '120px 1fr 80px',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        alignItems: 'center'
                    }}>
                        <div style={{ padding: '0.5rem' }}>Name</div>
                        <div style={{ padding: '0.5rem' }}>
                            <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '200px' }}></div>
                        </div>
                        <div style={{ padding: '0.5rem' }}></div>
                        
                        <div style={{ padding: '0.5rem' }}>Description</div>
                        <div style={{ padding: '0.5rem' }}>
                            <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '300px' }}></div>
                        </div>
                        <div style={{ padding: '0.5rem' }}></div>
                        
                        <div style={{ padding: '0.5rem' }}>Target Market</div>
                        <div style={{ padding: '0.5rem' }}>
                            <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '150px' }}></div>
                        </div>
                        <div style={{ padding: '0.5rem' }}></div>
                        
                        <div style={{ padding: '0.5rem' }}>Website</div>
                        <div style={{ padding: '0.5rem' }}>
                            <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '250px' }}></div>
                        </div>
                        <div style={{ padding: '0.5rem' }}></div>
                    </div>
                </div>

                <br></br>
                <br></br>
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold mb-1">Company Files</h2>
                    <div className="relative group">
                        <button
                            onClick={handleUploadClick}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="26" 
                                height="26" 
                                fill="none" 
                                viewBox="0 0 24 24"
                            >
                                <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.96 13.42a5 5 0 0 0-4.31-4.34A6 6 0 0 0 6 11.02a4 4 0 1 0 0 8h6M18.78 23v-8"/>
                                <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15.58 18.2 3.2-3.2 3.2 3.2"/>
                            </svg>
                        </button>
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Upload files
                        </div>
                    </div>
                </div>

                <br></br>
                
                {/* File List Loading */}
                <div style={{ maxWidth: '800px', marginLeft: '1rem', marginRight: '1rem' }}>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="p-6">
            <div className="mb-12">
                <h1 className="text-3xl font-bold mb-1">Company Profile</h1>
                <p className="text-gray-600">Update your company profile to help Cassius understand your business</p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-1">Company Details</h2>
            <br></br>
            <div style={{ maxWidth: '800px', marginLeft: '1rem', marginRight: '1rem' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '120px 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    alignItems: 'center'
                }}>
                    {/* Company Details Display - Only show fields with values */}
                    {company.name && (
                        <>
                            <div style={{ padding: '0.5rem', fontWeight: '500' }}>
                                Name
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {company.name}
                            </div>
                        </>
                    )}
                    
                    {company.description && (
                        <>
                            <div style={{ padding: '0.5rem', fontWeight: '500' }}>
                                Description
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {company.description}
                            </div>
                        </>
                    )}
                    
                    {company.target_market && (
                        <>
                            <div style={{ padding: '0.5rem', fontWeight: '500' }}>
                                Target Market
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {company.target_market}
                            </div>
                        </>
                    )}
 
                    {company.website_url && (
                        <>
                            <div style={{ padding: '0.5rem', fontWeight: '500' }}>
                                Website
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {company.website_url}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <br></br>
            <br></br>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold mb-1">Company Files</h2>
                <div className="relative group">
                    <button
                        onClick={handleUploadClick}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="26" 
                            height="26" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.96 13.42a5 5 0 0 0-4.31-4.34A6 6 0 0 0 6 11.02a4 4 0 1 0 0 8h6M18.78 23v-8"/>
                            <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15.58 18.2 3.2-3.2 3.2 3.2"/>
                        </svg>
                    </button>
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Upload files
                    </div>
                </div>
            </div>

            <br></br>
            
            {/* File List */}
            <div style={{ maxWidth: '800px', marginLeft: '1rem', marginRight: '1rem' }}>
                {shouldShowLoadingSkeletons ? (
                    // Show loading skeletons only on initial load when no data exists
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                ) : filesError ? (
                    <div className="text-red-600">Error loading files: {filesError.message}</div>
                ) : companyFiles && companyFiles.length > 0 ? (
                    <div className="space-y-3 max-h-110 overflow-y-auto">
                        {companyFiles.map((file, index) => {
                            // Determine file type and colors based on extension
                            const fileExtension = file.filename.split('.').pop()?.toLowerCase();
                            let fileType = 'File';
                            let iconBgColor = 'gray-100';
                            let iconTextColor = 'gray-600';
                            
                            if (['pdf'].includes(fileExtension)) {
                                fileType = 'PDF';
                                iconBgColor = 'red-100';
                                iconTextColor = 'red-600';
                            } else if (['docx', 'doc'].includes(fileExtension)) {
                                fileType = 'Word';
                                iconBgColor = 'blue-100';
                                iconTextColor = 'blue-600';
                            } else if (['xlsx', 'xls'].includes(fileExtension)) {
                                fileType = 'Excel';
                                iconBgColor = 'green-100';
                                iconTextColor = 'green-600';
                            } else if (['txt'].includes(fileExtension)) {
                                fileType = 'Text';
                                iconBgColor = 'purple-100';
                                iconTextColor = 'purple-600';
                            }
                            
                            return (
                                <FileTile
                                    key={index}
                                    fileName={file.filename}
                                    fileType={fileType}
                                    fileSize={formatFileSize(file.size)}
                                    lastUpdated={formatDate(file.last_modified)}
                                    iconBgColor={iconBgColor}
                                    iconTextColor={iconTextColor}
                                    onDelete={() => handleDeleteFile(file.filename)}
                                    isDeleting={deletingFiles.has(file.filename)}
                                />
                            );
                        })}
                        

                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-8">
                        No files uploaded yet. Click the upload button to add your first file.
                    </div>
                )}
            </div>

            {/* File Upload Modal */}
            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default CompanyProfile;
