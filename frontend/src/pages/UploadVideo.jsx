import React, { useState } from 'react';

const UploadVideo = ({ isOpen, onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      } else {
        setError('Please select a valid video file');
      }
    } else {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setError('Please select a valid image file');
      }
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('videoFile', videoFile);
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isPublic', formData.isPublic);

      const response = await fetch('http://localhost:5000/api/v1/videos/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload video');
      }

      const data = await response.json();
      setSuccess('Video uploaded successfully!');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        if (onUploadSuccess) onUploadSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isPublic: true
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                {videoPreview ? (
                  <div className="space-y-4">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-64 rounded-lg"
                    />
                    <p className="text-sm text-gray-600">{videoFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="hidden"
                      id="videoInput"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="videoInput"
                      className="cursor-pointer inline-block"
                    >
                      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📹</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        Click to select video
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        or drag and drop (MP4, MOV, AVI)
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail (Optional)
              </label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-32 h-24 object-cover rounded-lg border-2 border-red-500"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No thumbnail</span>
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="hidden"
                    id="thumbnailInput"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="thumbnailInput"
                    className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors inline-block"
                  >
                    Choose Thumbnail
                  </label>
                  {thumbnailFile && (
                    <p className="mt-2 text-sm text-gray-600">{thumbnailFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter video title"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter video description"
                disabled={isLoading}
              />
            </div>

            {/* Privacy */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-700">
                Make this video public
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !videoFile || !formData.title.trim()}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;