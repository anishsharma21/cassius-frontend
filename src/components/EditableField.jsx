import React, { useState } from 'react';

const EditableField = ({ 
    fieldName, 
    value, 
    isEditing, 
    onEdit, 
    onCancel, 
    onUpdate, 
    onChange,
    fieldType = 'text', // 'text' or 'textarea'
    isLoading = false
}) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');
    
    const getPlaceholderText = (field) => {
        switch (field) {
            case 'name':
                return 'Add company name';
            case 'description':
                return 'Add company description';
            case 'targetMarket':
                return 'Add target market';
            case 'website':
                return 'Add website URL (e.g., https://example.com)';
            default:
                return 'Add content';
        }
    };

    const validateWebsite = (url) => {
        if (!url) return true; // Allow empty values
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleInputChange = (fieldName, newValue) => {
        // Clear validation error when user starts typing
        setValidationError('');
        
        // Validate website field
        if (fieldName === 'website' && newValue && !validateWebsite(newValue)) {
            setValidationError('Please enter a valid URL (e.g., https://example.com)');
        }
        
        onChange(fieldName, newValue);
    };

    const handleUpdateClick = async () => {
        // Validate before submitting
        if (fieldName === 'website' && value && !validateWebsite(value)) {
            setValidationError('Please enter a valid URL before saving');
            return;
        }

        try {
            setIsSubmitting(true);
            await onUpdate(fieldName);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000); // Hide success message after 2 seconds
        } catch (error) {
            // Error is handled by the hook
        } finally {
            setIsSubmitting(false);
        }
    };
    const renderEditButtons = () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={onCancel}
            >
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
                            {isSubmitting ? (
                                <div style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    border: '2px solid #e5e7eb',
                                    borderTop: '2px solid #10b981',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            ) : (
                                <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{ cursor: 'pointer', color: showSuccess ? '#059669' : '#10b981' }}
                                    onClick={handleUpdateClick}
                                >
                                    <path d="M20 6L9 17l-5-5"/>
                                </svg>
                            )}
        </div>
    );

    const renderEditIcon = () => {
        if (isLoading) {
            return (
                <div style={{ 
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
            );
        }
        
        return (
            <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ cursor: 'pointer', color: '#6b7280' }}
                onClick={() => onEdit(fieldName)}
            >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        );
    };

    const renderInput = () => {
        const commonProps = {
            value: value,
            onChange: (e) => handleInputChange(fieldName, e.target.value),
            style: { 
                width: '100%', 
                outline: 'none', 
                resize: 'none', 
                overflow: 'hidden',
                borderColor: validationError ? '#ef4444' : '#000000', // Red for errors, black for normal
                borderWidth: '1.5px', // Smaller border
                padding: '0.5rem 0.75rem', // Consistent padding
                lineHeight: '1.25', // Better line height for centering
                minHeight: '2.5rem' // Ensure consistent height
            },
            autoFocus: true,
            rows: 1,
            'data-field': fieldName,
            onInput: (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            },
            onFocus: (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                // Move cursor to end of text
                e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            }
        };

        if (fieldType === 'textarea') {
            return (
                <textarea 
                    className='px-2 py-1.5 border-2 border-black rounded-lg'
                    {...commonProps}
                />
            );
        }

        return (
            <textarea 
                className='px-2 py-1.5 border-2 border-black rounded-lg'
                {...commonProps}
            />
        );
    };

    const renderDisplay = () => {
        if (isLoading) {
            return (
                <div style={{ 
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
            );
        }
        
        return (
            <div style={{ 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                maxWidth: '100%',
                wordBreak: 'keep-all',
                color: value ? 'inherit' : '#9ca3af' // Gray color for placeholder text
            }}>
                {value || getPlaceholderText(fieldName)}
            </div>
        );
    };

    return (
        <>
            <div style={{ padding: '0.5rem' }}>
                {isEditing ? renderInput() : renderDisplay()}
                {/* Show validation error below input */}
                {isEditing && validationError && (
                    <div style={{ 
                        color: '#ef4444', 
                        fontSize: '0.875rem', 
                        marginTop: '0.25rem',
                        fontStyle: 'italic'
                    }}>
                        {validationError}
                    </div>
                )}
            </div>
            <div style={{ padding: '0.5rem' }}>
                {isEditing ? renderEditButtons() : renderEditIcon()}
            </div>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </>
    );
};

export default EditableField;
