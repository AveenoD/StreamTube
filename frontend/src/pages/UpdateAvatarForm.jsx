import React, { useState } from 'react';

const UpdateAvatarForm = ({ onAvatarUpdated }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!avatarFile) {
      setError('Please select an avatar image');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', avatarFile);
      
      const response = await fetch('http://localhost:5000/api/v1/users/profile/avatar', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update avatar');
      }

      const data = await response.json();
      onAvatarUpdated();
      setSuccess('Avatar updated successfully!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess('');
        setAvatarFile(null);
        setAvatarPreview(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Avatar</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose New Avatar
          </label>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarPreview ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-500">
                  <img 
                    src={avatarPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatarInput"
                disabled={isLoading}
              />
              <label
                htmlFor="avatarInput"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Choose File
              </label>
              {avatarFile && (
                <p className="mt-2 text-sm text-gray-600">{avatarFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !avatarFile}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Uploading...' : 'Update Avatar'}
        </button>
      </form>
    </div>
  );
};

export default UpdateAvatarForm;