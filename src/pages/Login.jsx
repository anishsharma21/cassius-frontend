import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Add focus state for email and password
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);

  // Token expiration state from ProtectedRoute
  useEffect(() => {
    if (location.state?.tokenExpired) {
      console.log('Login page: Setting token expired state');
      setTokenExpired(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ---- GOOGLE SIGN IN ----
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google && googleButtonRef.current && !googleLoading) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });

        // Styled Google button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: 300,
        });

        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [googleLoading]);

  const handleGoogleCredential = async (response) => {
    setGoogleLoading(true);
    setError('');
    
    const credential = response.credential; // Google ID token
    try {
      const res = await fetch(API_ENDPOINTS.googleEntry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
      });

      if (!res.ok) {
        setError('Google sign in failed');
        setGoogleLoading(false);
        return;
      }

      const data = await res.json();

      if (data.user_status === 'EXISTING') {
        // User exists and has company, log them in
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

        navigate('/dashboard');
      } else if (data.user_status === 'NEW') {
        // User is new, store their data and redirect to company details
        localStorage.setItem('temp_google_user', JSON.stringify(data));
        navigate('/google-signup');
      } else {
        setError('Invalid user status received');
        setGoogleLoading(false);
      }
      
    } catch (err) {
      console.error(err);
      setError('Google sign in error');
      setGoogleLoading(false);
    }
  };

  // ---- EMAIL/PASSWORD LOGIN ----
  const validateForm = () => {
    setTokenExpired(false);
    if (!username || !password) {
      setError('Please enter your email and password');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append('username', username);
    formDetails.append('password', password);

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDetails,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Store login data from UserLoginResponse
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          initials: data.initials,
          display_name: data.display_name,
        })
      );

      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pr-60 pl-60 bg-white flex flex-col font-sans">
      {/* Token Expired Error Message */}
      {tokenExpired && (
        <div className="w-full flex justify-center mt-4">
          <div className="w-full max-w-sm bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-xl shadow">
            <div className="flex justify-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-orange-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  Your session has expired. Please log back in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-bold text-2xl">CASSIUS</p>
        </div>

        <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-8 min-h-[400px]">
          <h2 className="text-center text-xl font-semibold text-black">Sign in</h2>

          {/* GOOGLE SIGN-IN BUTTON */}
          <div className="mt-6 flex justify-center">
            {googleLoading ? (
              <button
                disabled
                className="w-[300px] h-[40px] bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full shadow-sm flex items-center justify-center cursor-not-allowed"
              >
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500"
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
                <span>Signing in with Google...</span>
              </button>
            ) : (
              <div ref={googleButtonRef}></div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-500 pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="text-sm font-medium text-black">
                    Email
                  </label>
                  <div
                    className={`mt-1 block w-full max-w-sm px-3 py-2 rounded-lg transition-colors bg-white ${emailFocused ? 'border-black' : 'border-gray-400'} border`}
                    onClick={() => setEmailFocused(true)}
                  >
                    <input
                      id="username"
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className="w-full bg-transparent border-none outline-none shadow-none text-sm text-gray-700"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setTokenExpired(false);
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-black">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'hide' : 'show'}
                    </button>
                  </div>
                  <div
                    className={`mt-1 block w-full max-w-sm px-3 py-2 rounded-lg transition-colors bg-white ${passwordFocused ? 'border-black' : 'border-gray-400'} border`}
                    onClick={() => setPasswordFocused(true)}
                  >
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-transparent border-none outline-none shadow-none text-sm text-gray-700"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setTokenExpired(false);
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                  </div>
                </div>
              </div>

              {error && (
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
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
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
                    <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                  </div>
                </button>
              </div>
              <div>
                <p className="text-center text-sm text-gray-500">
                  Don't have an account?
                  <button
                    type="button"
                    className="text-black hover:text-gray-800 underline ml-2 cursor-pointer font-medium"
                    onClick={() => navigate('/signup')}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
