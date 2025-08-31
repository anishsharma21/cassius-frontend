import React, { useEffect, useState } from 'react';
import { FileTile, FileUploadModal } from './components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../../config/api';



const CompanyProfile = () => {
    console.log('CompanyProfile component is mounting!');
    
    const queryClient = useQueryClient();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        coreBusiness: '',
        valueProposition: '',
        productsServices: '',
        keyDifferentiators: '',
        companyStage: '',
        industry: '',
        businessGoals: '',
        painPointsSolved: '',
        targetMarket: '',
        websiteUrl: ''
    });
    
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
    const { data: companyFiles, isLoading: filesLoading, error: filesError } = useQuery({
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
    
    // Parse structured description into individual fields
    const parseStructuredDescription = (description) => {
        if (!description) return {};
        
        const parsed = {};
        const lines = description.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('Core Business:')) {
                parsed.coreBusiness = line.replace('Core Business:', '').trim();
            } else if (line.startsWith('Value Proposition:')) {
                parsed.valueProposition = line.replace('Value Proposition:', '').trim();
            } else if (line.startsWith('Products/Services:')) {
                parsed.productsServices = line.replace('Products/Services:', '').trim();
            } else if (line.startsWith('Key Differentiators:')) {
                parsed.keyDifferentiators = line.replace('Key Differentiators:', '').trim();
            } else if (line.startsWith('Company Stage:')) {
                parsed.companyStage = line.replace('Company Stage:', '').trim();
            } else if (line.startsWith('Industry:')) {
                parsed.industry = line.replace('Industry:', '').trim();
            } else if (line.startsWith('Business Goals:')) {
                parsed.businessGoals = line.replace('Business Goals:', '').trim();
            } else if (line.startsWith('Pain Points Solved:')) {
                parsed.painPointsSolved = line.replace('Pain Points Solved:', '').trim();
            }
        });
        
        // If no structured format found, put everything in coreBusiness
        if (Object.keys(parsed).length === 0 && description) {
            parsed.coreBusiness = description;
        }
        
        return parsed;
    };
    
    // Populate form data when company data loads
    useEffect(() => {
        if (company) {
            const parsedDescription = parseStructuredDescription(company.description);
            setFormData({
                name: company.name || '',
                coreBusiness: parsedDescription.coreBusiness || '',
                valueProposition: parsedDescription.valueProposition || '',
                productsServices: parsedDescription.productsServices || '',
                keyDifferentiators: parsedDescription.keyDifferentiators || '',
                companyStage: parsedDescription.companyStage || '',
                industry: parsedDescription.industry || '',
                businessGoals: parsedDescription.businessGoals || '',
                painPointsSolved: parsedDescription.painPointsSolved || '',
                targetMarket: company.target_market || '',
                websiteUrl: company.website_url || ''
            });
        }
    }, [company]);
    
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
    
    const handleEditClick = () => {
        setIsEditMode(true);
    };
    
    const handleCancelEdit = () => {
        // Reset form data to current company data
        if (company) {
            const parsedDescription = parseStructuredDescription(company.description);
            setFormData({
                name: company.name || '',
                coreBusiness: parsedDescription.coreBusiness || '',
                valueProposition: parsedDescription.valueProposition || '',
                productsServices: parsedDescription.productsServices || '',
                keyDifferentiators: parsedDescription.keyDifferentiators || '',
                companyStage: parsedDescription.companyStage || '',
                industry: parsedDescription.industry || '',
                businessGoals: parsedDescription.businessGoals || '',
                painPointsSolved: parsedDescription.painPointsSolved || '',
                targetMarket: company.target_market || '',
                websiteUrl: company.website_url || ''
            });
        }
        setIsEditMode(false);
    };
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            // Build structured description from form fields
            const structuredDescription = [
                'BUSINESS PROFILE:',
                formData.coreBusiness && `Core Business: ${formData.coreBusiness}`,
                formData.valueProposition && `Value Proposition: ${formData.valueProposition}`,
                formData.productsServices && `Products/Services: ${formData.productsServices}`,
                formData.keyDifferentiators && `Key Differentiators: ${formData.keyDifferentiators}`,
                formData.companyStage && `Company Stage: ${formData.companyStage}`,
                formData.industry && `Industry: ${formData.industry}`,
                formData.businessGoals && `Business Goals: ${formData.businessGoals}`,
                formData.painPointsSolved && `Pain Points Solved: ${formData.painPointsSolved}`
            ].filter(Boolean).join('\n');
            
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(API_ENDPOINTS.updateCompany, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: structuredDescription,
                    target_market: formData.targetMarket,
                    website_url: formData.websiteUrl
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update company profile');
            }
            
            // Invalidate and refetch company data
            await queryClient.invalidateQueries(['company']);
            
            setIsEditMode(false);
            console.log('Company profile updated successfully');
        } catch (error) {
            console.error('Error updating company profile:', error);
            alert('Failed to update company profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
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
            
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Company Details</h2>
                {!isEditMode && (
                    <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            
            <div style={{ maxWidth: '800px', marginLeft: '1rem', marginRight: '1rem' }}>
                {isEditMode ? (
                    // Edit Mode
                    <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your company name"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Core Business</label>
                            <textarea
                                value={formData.coreBusiness}
                                onChange={(e) => handleInputChange('coreBusiness', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="What does your company do? Describe your core business activities"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value Proposition</label>
                            <textarea
                                value={formData.valueProposition}
                                onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="What unique value do you provide to customers?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Products/Services</label>
                            <textarea
                                value={formData.productsServices}
                                onChange={(e) => handleInputChange('productsServices', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="List your main products or services"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Differentiators</label>
                            <textarea
                                value={formData.keyDifferentiators}
                                onChange={(e) => handleInputChange('keyDifferentiators', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="What sets you apart from competitors?"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Stage</label>
                                <select
                                    value={formData.companyStage}
                                    onChange={(e) => handleInputChange('companyStage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select stage</option>
                                    <option value="Pre-revenue">Pre-revenue</option>
                                    <option value="Startup">Startup</option>
                                    <option value="Growth">Growth</option>
                                    <option value="Scale-up">Scale-up</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry/Vertical</label>
                                <input
                                    type="text"
                                    value={formData.industry}
                                    onChange={(e) => handleInputChange('industry', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., SaaS, E-commerce, FinTech"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Market</label>
                            <input
                                type="text"
                                value={formData.targetMarket}
                                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Who is your ideal customer?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Goals</label>
                            <textarea
                                value={formData.businessGoals}
                                onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="What are your primary business objectives?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pain Points Solved</label>
                            <textarea
                                value={formData.painPointsSolved}
                                onChange={(e) => handleInputChange('painPointsSolved', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="What customer problems do you solve?"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                            <input
                                type="url"
                                value={formData.websiteUrl}
                                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://yourcompany.com"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center cursor-pointer"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    // View Mode
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '160px 1fr',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        {formData.name && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Name</div>
                                <div style={{ padding: '0.5rem' }}>{formData.name}</div>
                            </>
                        )}
                        
                        {formData.coreBusiness && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Core Business</div>
                                <div style={{ padding: '0.5rem' }}>{formData.coreBusiness}</div>
                            </>
                        )}
                        
                        {formData.valueProposition && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Value Proposition</div>
                                <div style={{ padding: '0.5rem' }}>{formData.valueProposition}</div>
                            </>
                        )}
                        
                        {formData.productsServices && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Products/Services</div>
                                <div style={{ padding: '0.5rem' }}>{formData.productsServices}</div>
                            </>
                        )}
                        
                        {formData.keyDifferentiators && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Key Differentiators</div>
                                <div style={{ padding: '0.5rem' }}>{formData.keyDifferentiators}</div>
                            </>
                        )}
                        
                        {formData.companyStage && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Company Stage</div>
                                <div style={{ padding: '0.5rem' }}>{formData.companyStage}</div>
                            </>
                        )}
                        
                        {formData.industry && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Industry</div>
                                <div style={{ padding: '0.5rem' }}>{formData.industry}</div>
                            </>
                        )}
                        
                        {formData.targetMarket && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Target Market</div>
                                <div style={{ padding: '0.5rem' }}>{formData.targetMarket}</div>
                            </>
                        )}
                        
                        {formData.businessGoals && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Business Goals</div>
                                <div style={{ padding: '0.5rem' }}>{formData.businessGoals}</div>
                            </>
                        )}
                        
                        {formData.painPointsSolved && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Pain Points Solved</div>
                                <div style={{ padding: '0.5rem' }}>{formData.painPointsSolved}</div>
                            </>
                        )}
                        
                        {formData.websiteUrl && (
                            <>
                                <div style={{ padding: '0.5rem', fontWeight: '500' }}>Website</div>
                                <div style={{ padding: '0.5rem' }}>
                                    <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {formData.websiteUrl}
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                )}
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
