import React, { useState } from 'react';

const UpdateCoverForm = ({ onCoverUpdated }) => {
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coverFile) {
      setError('Please select a cover image');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('coverImage', coverFile);
      
      const response = await fetch('http://localhost:5000/api/v1/users/profile/coverImage', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cover image');
      }

      const data = await response.json();
      onCoverUpdated();
      setSuccess('Cover image updated successfully!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess('');
        setCoverFile(null);
        setCoverPreview(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Cover Image</h3>
      
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
            Choose New Cover Image
          </label>
          <div className="flex items-center gap-6">
            <div className="relative">
              {coverPreview ? (
                <div className="w-32 h-16 rounded-lg overflow-hidden border-2 border-red-500">
                  <img 
                    src={coverPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
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
                id="coverInput"
                disabled={isLoading}
              />
              <label
                htmlFor="coverInput"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Choose File
              </label>
              {coverFile && (
                <p className="mt-2 text-sm text-gray-600">{coverFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !coverFile}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Uploading...' : 'Update Cover Image'}
        </button>
      </form>
    </div>
  );
};

export default UpdateCoverForm;