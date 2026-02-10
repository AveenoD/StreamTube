import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    fetchLikedVideos();
  }, [page]);

  const fetchLikedVideos = async () => {
    if (!hasMore && page > 1) return;
    
    try {
        // ✅ Updated endpoint to match backend
        const response = await fetch(
            `http://localhost:5000/api/v1/likes/videos?page=${page}&limit=12`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch liked videos');
      }

      const data = await response.json();
      console.log('Liked videos response:', data);
      
      if (page === 1) {
        setVideos(data.data?.videos || data.data || []);
      } else {
        const newVideos = data.data?.videos || data.data || [];
        setVideos(prev => [...prev, ...newVideos]);
      }
      
      setHasMore(data.data?.hasMore !== undefined ? data.data.hasMore : false);
    } catch (err) {
      console.error('Error fetching liked videos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Streamify</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your liked videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Liked Videos</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No liked videos</h2>
            <p className="text-gray-600 mb-6">You haven't liked any videos yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} liked
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video._id || index}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : video.videoFile ? (
                      <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <span className="text-white text-4xl">🎥</span>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">📹</span>
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {video.title || 'Untitled Video'}
                    </h3>

                    {/* Owner Info */}
                    {video.owner && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                          {video.owner.fullName?.charAt(0) || video.owner.username?.charAt(0) || '?'}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          {video.owner.fullName || video.owner.username || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{(video.viewsCount || 0).toLocaleString()} views</span>
                      <span>
                        {video.createdAt 
                          ? new Date(video.createdAt).toLocaleDateString()
                          : 'Unknown date'}
                      </span>
                    </div>

                    {/* Engagement */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">❤️</span>
                        {(video.likeCount || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        {(video.commentCount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Description */}
                    {video.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                  className="px-8 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}

            {/* No More Videos Message */}
            {!hasMore && videos.length > 0 && (
              <div className="text-center mt-8 py-6">
                <p className="text-gray-600">You've reached the end of your liked videos</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;