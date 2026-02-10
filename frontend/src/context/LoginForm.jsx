import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ isLoading, setIsLoading, setError, navigate }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.identifier.trim()) {
      setError('Email or username is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Determine if input is email or username
      const isEmail = formData.identifier.includes('@');
      
      const requestBody = {
        password: formData.password
      };
      
      // Send only email OR username, not both
      if (isEmail) {
        requestBody.email = formData.identifier;
      } else {
        requestBody.username = formData.identifier;
      }

      console.log('Sending login request:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      // Check if response is OK
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If can't parse JSON, get text
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }
      
      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        const text = await response.text();
        console.log('Raw response:', text);
        throw new Error('Invalid response from server');
      }
      
      console.log('Login successful:', data);
      
      // Save tokens to localStorage
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred while logging in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
          Email or Username
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="you@example.com or username"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Signing in...' : 'Login'}
      </button>
      
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className="text-red-600 font-medium hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;