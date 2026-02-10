import React, { useState, useEffect } from 'react';

const WatchHistorySection = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/watch-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watch history');
      }

      const data = await response.json();
      setVideos(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Watch History</h2>
        <div className="flex overflow-x-auto pb-4 space-x-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-shrink-0 w-64 bg-gray-100 rounded-lg overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <div className="text-gray-400 text-4xl mb-4">📺</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No watch history</h2>
        <p className="text-gray-600">You haven't watched any videos yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Watch History</h2>
      
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {videos.map((video, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">📹</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{video.viewsCount || 0} views</span>
                <span>{new Date(video.watchedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>❤️ {video.likeCount || 0}</span>
                <span>💬 {video.commentCount || 0}</span>
              </div>
              
              <div className="mt-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs">{video.owner?.fullName?.charAt(0) || '?'}</span>
                </div>
                <p className="text-sm text-gray-700">{video.owner?.username || 'Unknown'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistorySection;