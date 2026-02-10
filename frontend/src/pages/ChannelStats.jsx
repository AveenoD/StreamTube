import React, { useState, useEffect } from 'react';

const ChannelStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChannelStats();
  }, [userId]);

  const fetchChannelStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/channel/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Videos',
      value: stats.totalVideos || 0,
      icon: '📹'
    },
    {
      label: 'Subscribers',
      value: stats.subscribersCount || 0,
      icon: '👥'
    },
    {
      label: 'Total Views',
      value: stats.totalViews || 0,
      icon: '👁️'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes || 0,
      icon: '❤️'
    },
    {
      label: 'Published',
      value: stats.publishedVideos || 0,
      icon: '✅'
    },
    {
      label: 'Unpublished',
      value: stats.unpublishedVideos || 0,
      icon: '⏳'
    },
    {
      label: 'Avg Views/Video',
      value: stats.averageViewsPerVideo || 0,
      icon: '📊'
    },
    {
      label: 'Engagement Rate',
      value: `${stats.engagementRate || 0}`,
      icon: '📈'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Channel Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.slice(0, 4).map((stat, index) => (
            <div
              key={index}
              className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.slice(4).map((stat, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Videos Published</p>
            <p className="text-2xl font-bold text-blue-600">{stats.publishedVideos || 0}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Engagement</p>
            <p className="text-2xl font-bold text-green-600">
              {(stats.totalLikes + stats.totalComments).toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Engagement/Video</p>
            <p className="text-2xl font-bold text-purple-600">{stats.engagementRate || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelStats;