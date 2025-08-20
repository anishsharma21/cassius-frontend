import { useState, useEffect } from 'react';

export const useEditableField = (initialValues, onSave) => {
    const [editingField, setEditingField] = useState(null);
    const [editValues, setEditValues] = useState(initialValues);

    const handleEdit = (fieldName) => {
        setEditingField(fieldName);
    };

    const handleCancel = () => {
        setEditingField(null);
        // Reset to original values
        setEditValues(initialValues);
    };

    const handleUpdate = async (fieldName) => {
        try {
            if (onSave) {
                await onSave(fieldName, editValues[fieldName]);
            }
            setEditingField(null);
        } catch (error) {
            console.error('Error saving field:', error);
            // Keep editing state on error so user can retry
        }
    };

    const handleInputChange = (fieldName, value) => {
        setEditValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Auto-adjust textarea height when editing starts
    useEffect(() => {
        if (editingField) {
            const textarea = document.querySelector(`textarea[data-field="${editingField}"]`);
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
                
                // Also set up a continuous height adjustment
                const adjustHeight = () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                };
                
                // Adjust height immediately and then periodically
                adjustHeight();
                const interval = setInterval(adjustHeight, 100);
                
                return () => clearInterval(interval);
            }
        }
    }, [editingField]);

    // Auto-adjust textarea height when window resizes
    useEffect(() => {
        const handleResize = () => {
            if (editingField) {
                // Add a small delay to ensure layout has settled
                setTimeout(() => {
                    const textarea = document.querySelector(`textarea[data-field="${editingField}"]`);
                    if (textarea) {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        
        // Also listen for container resize using ResizeObserver
        if (editingField) {
            const textarea = document.querySelector(`textarea[data-field="${editingField}"]`);
            if (textarea) {
                const resizeObserver = new ResizeObserver(() => {
                    setTimeout(() => {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }, 50);
                });
                
                resizeObserver.observe(textarea.parentElement);
                
                return () => {
                    resizeObserver.disconnect();
                    window.removeEventListener('resize', handleResize);
                };
            }
        }
        
        return () => window.removeEventListener('resize', handleResize);
    }, [editingField]);

    return {
        editingField,
        editValues,
        handleEdit,
        handleCancel,
        handleUpdate,
        handleInputChange
    };
};
