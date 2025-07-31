import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

function GoogleSignUp() {
  const [formData, setFormData] = useState({
    company_name: '',
    company_description: '',
    company_target_market: '',
    company_website: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Focus states for form fields
  const [focusedFields, setFocusedFields] = useState({
    company_name: false,
    company_description: false,
    company_target_market: false,
    company_website: false,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Required';
    }
    if (!formData.company_description.trim()) {
      newErrors.company_description = 'Required';
    }
    if (!formData.company_target_market.trim()) {
      newErrors.company_target_market = 'Required';
    }
    if (formData.company_website && formData.company_website.trim() && !isValidUrl(formData.company_website)) {
      newErrors.company_website = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Get user data from localStorage (set during Google signup)
      const userData = JSON.parse(localStorage.getItem('temp_google_user') || '{}');
      if (!userData.email) {
        console.log('User data not found. Please try signing in again.');
        setErrors({ general: 'User data not found. Please try signing in again.' });
        setLoading(false);
        return;
      }
      
      // Create company
      const response = await fetch(API_ENDPOINTS.createCompany, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.access_token}`
        },
        body: JSON.stringify({
          name: formData.company_name,
          description: formData.company_description,
          target_market: formData.company_target_market,
          website_url: formData.company_website,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ general: errorData.detail || 'Failed to create company' });
        setLoading(false);
        return;
      }

      const companyData = await response.json();
      
      // Store final user data (only token, email, display_name, and initials)
      localStorage.setItem('access_token', userData.access_token);
      localStorage.setItem('token_type', userData.token_type);
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: userData.email,
          display_name: userData.display_name,
          initials: userData.initials,
        })
      );
      
      // Clean up temporary data
      localStorage.removeItem('temp_google_user');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      setErrors({ general: error.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name, label, type = 'text', required = true, placeholder = '') => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-black">
        {label} {required}
      </label>
      <div
        className={`mt-1 block w-full max-w-sm px-3 py-2 rounded-lg transition-colors bg-white ${
          focusedFields[name] ? 'border-black' : 'border-gray-400'
        } border`}
        onClick={() => handleFocus(name)}
      >
        <input
          id={name}
          name={name}
          type={type}
          className="w-full bg-transparent border-none outline-none shadow-none text-sm text-gray-700"
          value={formData[name]}
          onChange={handleInputChange}
          onFocus={() => handleFocus(name)}
          onBlur={() => handleBlur(name)}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  const renderTextareaField = (name, label, required = true, placeholder = '') => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-black">
        {label} {required}
      </label>
      <div
        className={`mt-1 block w-full max-w-sm px-3 py-2 rounded-lg transition-colors bg-white ${
          focusedFields[name] ? 'border-black' : 'border-gray-400'
        } border`}
        onClick={() => handleFocus(name)}
      >
        <textarea
          id={name}
          name={name}
          rows={4}
          className="w-full bg-transparent border-none outline-none shadow-none text-sm text-gray-700 resize-none"
          value={formData[name]}
          onChange={handleInputChange}
          onFocus={() => handleFocus(name)}
          onBlur={() => handleBlur(name)}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pr-60 pl-60 bg-white flex flex-col font-sans">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-bold text-2xl">CASSIUS</p>
        </div>
        <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-center text-xl font-semibold text-black mb-6">Company Details</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {renderInputField('company_name', 'Company Name', 'text', true, 'Enter your company name')}
              {renderTextareaField('company_description', 'Description', true, 'Describe your company')}
              {renderInputField('company_target_market', 'Target Market', 'text', true, 'Who is your target market?')}
              {renderInputField('company_website', 'Website URL (optional)', 'url', false, 'https://example.com')}
              
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-800 text-white text-sm cursor-pointer font-medium rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none transition duration-150"
                >
                  <div className="flex items-center justify-center">
                    {loading && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    <span>
                      {loading ? 'Creating company...' : 'Sign up'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GoogleSignUp; 