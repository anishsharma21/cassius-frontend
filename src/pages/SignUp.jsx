import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

function SignUp() {
  const [formData, setFormData] = useState({
    // User details
    email: '',
    password: '',
    confirmPassword: '',
    
    // Created user data (for step 2)
    user_id: '',
    user_email: '',
    user_initials: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states for form fields
  const [focusedFields, setFocusedFields] = useState({
    email: false,
    password: false,
    confirmPassword: false,
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

    // User validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    if (!validateStep1()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(API_ENDPOINTS.createUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ general: errorData.detail || 'Failed to create user' });
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Store login data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
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
  };

  const handleBack = () => {
    // No longer needed since we only have one step
  };

  const handleSubmit = async (event) => {
    // No longer needed since we only have one step
    // The signup is handled in handleNext
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
          required={required}
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
          required={required}
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
            if (name === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
          }}
        >
          {name === 'password' ? (showPassword ? 'hide' : 'show') : (showConfirmPassword ? 'hide' : 'show')}
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
          type={name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')}
          required={required}
          placeholder={name === 'password' ? 'Enter your password' : 'Confirm your password'}
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
          <h2 className="text-center text-xl font-semibold text-black mb-6">Create account</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {renderInputField('email', 'Email', 'email', true, 'Enter your email address')}
              {renderPasswordField('password', 'Password', true)}
              {renderPasswordField('confirmPassword', 'Confirm Password', true)}
              
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
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-800 text-white text-sm cursor-pointer font-medium rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-150"
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
                      {loading ? 'Creating your account...' : 'Sign Up'}
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