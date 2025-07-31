import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

function SignUp() {
  const [formData, setFormData] = useState({
    // User details
    email: '',
    password: '',
    // Company details
    company_name: '',
    company_description: '',
    company_target_market: '',
    company_website: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  // Focus states for form fields
  const [focusedFields, setFocusedFields] = useState({
    email: false,
    password: false,
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

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
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

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setLoading(true);
      setErrors({});
      
      try {
        // Single API call to create both user and company
        const response = await fetch(API_ENDPOINTS.createUserAndCompany, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            company_name: formData.company_name,
            company_description: formData.company_description,
            company_target_market: formData.company_target_market,
            company_website: formData.company_website,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrors({ general: errorData.detail || 'Failed to create account' });
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        // Store user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.user_id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            initials: data.initials,
            display_name: data.display_name,
          })
        );
        
        // Redirect to dashboard
        navigate('/dashboard');
        
      } catch (error) {
        setErrors({ general: error.message || 'Something went wrong' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
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

  const renderPasswordField = (name, label, required = true) => (
    <div>
      <div className="flex justify-between">
        <label htmlFor={name} className="text-sm font-medium text-black">
          {label} {required}
        </label>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          onClick={() => {
            if (name === 'password') setShowPassword(!showPassword);
          }}
        >
          {name === 'password' ? (showPassword ? 'hide' : 'show') : 'show'}
        </button>
      </div>
      <div
        className={`mt-1 block w-full max-w-sm px-3 py-2 rounded-lg transition-colors bg-white ${
          focusedFields[name] ? 'border-black' : 'border-gray-400'
        } border`}
        onClick={() => handleFocus(name)}
      >
        <input
          id={name}
          name={name}
          type={name === 'password' ? (showPassword ? 'text' : 'password') : 'password'}
          placeholder={name === 'password' ? 'Enter your password' : 'Enter your password'}
          className="w-full bg-transparent border-none outline-none shadow-none text-sm text-gray-700"
          value={formData[name]}
          onChange={handleInputChange}
          onFocus={() => handleFocus(name)}
          onBlur={() => handleBlur(name)}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  const renderStepIndicator = () => {
    // No longer needed since we only have one step
    return null;
  };

  return (
    <div className="min-h-screen pr-60 pl-60 bg-white flex flex-col font-sans">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-bold text-2xl">CASSIUS</p>
        </div>
        <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-center text-xl font-semibold text-black mb-6">
            {step === 1 ? 'Personal Details' : 'Company Details'}
          </h2>
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className={`h-2 w-8 rounded-full mr-2 ${step === 1 ? 'bg-black' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-black' : 'bg-gray-300'}`}></div>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {step === 1 && (
                <>
                  {renderInputField('email', 'Email', 'email', true, 'Enter your email address')}
                  {renderPasswordField('password', 'Password', true)}
                </>
              )}
              {step === 2 && (
                <>
                  {renderInputField('company_name', 'Company Name', 'text', true, 'Enter your company name')}
                  {renderTextareaField('company_description', 'Description', true, 'Describe your company')}
                  {renderInputField('company_target_market', 'Target Market', 'text', true, 'Who is your target market?')}
                  {renderInputField('company_website', 'Website URL (optional)', 'url', false, 'https://example.com')}
                </>
              )}
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
              <div className="pt-4 flex justify-between gap-4">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-200 text-black text-sm font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-150"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white text-sm cursor-pointer font-medium rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none transition duration-150"
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
                      {loading ? 'Creating account...' : (step === 2 ? 'Sign Up' : 'Next')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <p className="text-center text-sm text-gray-500">
                Already have an account?
                <button
                  type="button"
                  className="text-black hover:text-gray-800 underline ml-2 cursor-pointer font-medium"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 