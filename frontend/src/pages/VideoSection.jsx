import React, { useState, useEffect } from 'react';

const VideoSection = ({ type }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [type, page]);

  const fetchVideos = async () => {
    if (!hasMore && page > 1) return;
    
    try {
      let endpoint = '';
      if (type === 'liked') {
        endpoint = 'http://localhost:5000/api/v1/users/liked-videos';
      } else if (type === 'uploads') {
        endpoint = 'http://localhost:5000/api/v1/users/uploaded-videos';
      }
      
      if (!endpoint) return;
      
      const response = await fetch(
        `${endpoint}?page=${page}&limit=12`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      
      if (page === 1) {
        setVideos(data.data.videos || []);
      } else {
        setVideos(prev => [...prev, ...(data.data.videos || [])]);
      }
      
      setHasMore(data.data.hasMore || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getTitle = () => {
    if (type === 'liked') return 'Liked Videos';
    if (type === 'uploads') return 'Your Uploads';
    return 'Videos';
  };

  if (isLoading && page === 1) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">
          {type === 'liked' ? '❤️' : '📹'}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">
          {type === 'liked' ? 'You haven\'t liked any videos yet' : 'You haven\'t uploaded any videos yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">📹</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{video.viewsCount || 0} views</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span>❤️ {video.likeCount || 0}</span>
                <span>💬 {video.commentCount || 0}</span>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs">{video.owner?.fullName?.charAt(0) || '?'}</span>
                </div>
                <p className="text-sm text-gray-700">{video.owner?.username || 'Unknown'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoSection;