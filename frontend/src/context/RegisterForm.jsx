import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ isLoading, setIsLoading, setError }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email is invalid');
      return;
    }
    
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!avatarFile) {
      setError('Avatar is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('fullName', formData.fullName.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('avatar', avatarFile);
      
      if (coverImageFile) {
        formDataToSend.append('coverImage', coverImageFile);
      }
      
      console.log('Registering with:', {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        avatar: avatarFile?.name,
        coverImage: coverImageFile?.name
      });
      
      const response = await fetch('http://localhost:5000/api/v1/users/register', {
        method: 'POST',
        body: formDataToSend,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Try to parse error
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Raw error:', errorText);
          throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
      }
      
      // Parse success response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        const text = await response.text();
        console.log('Raw response:', text);
        throw new Error('Invalid response from server');
      }
      
      console.log('Registration successful:', data);
      
      // Save tokens if present
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      // Redirect directly to dashboard after registration
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred while registering');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Choose a username"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Your full name"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500">
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
          
          <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
            Choose Avatar
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'avatar')}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image (Optional)
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {coverImagePreview ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                <img 
                  src={coverImagePreview} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
          
          <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
            Choose Cover
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage')}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70 shadow-md hover:shadow-lg"
      >
        {isLoading ? 'Creating account...' : 'Register'}
      </button>
      
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="text-red-600 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;