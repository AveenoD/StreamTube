import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WatchHistorySection from './WatchHistorySection';
import VideoSection from './VideoSection';
import PlaylistSection from './PlaylistSection';
import UploadVideoModal from './UploadVideo';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watch-history');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/current-user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      console.error('Error fetching user ', error);
      localStorage.removeItem('accessToken');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh uploaded videos tab if active
    if (activeTab === 'your-uploads') {
      setActiveTab('your-uploads');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {/* Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900 text-2xl md:hidden"
              >
                ☰
              </button>
              
              {/* Logo */}
              <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Streamify</h1>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  🔍
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors hidden md:flex items-center gap-2"
              >
                <span>📤</span>
                Upload
              </button>

              {/* Mobile Upload Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 text-2xl md:hidden"
              >
                📤
              </button>

              {/* Mobile Search Button */}
              <button
                onClick={() => navigate('/search')}
                className="text-gray-600 hover:text-gray-900 text-2xl md:hidden"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-red-500 to-red-600">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Avatar */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600 mt-1">@{user.username}</p>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
          
          <button
            onClick={() => navigate('/edit-profile')}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('watch-history')}
              className={`${
                activeTab === 'watch-history'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Watch History
            </button>
            <button
              onClick={() => setActiveTab('liked-videos')}
              className={`${
                activeTab === 'liked-videos'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Liked Videos
            </button>
            <button
              onClick={() => setActiveTab('your-uploads')}
              className={`${
                activeTab === 'your-uploads'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Your Uploads
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`${
                activeTab === 'playlists'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Playlists
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'watch-history' && <WatchHistorySection />}
          {activeTab === 'liked-videos' && <VideoSection type="liked" />}
          {activeTab === 'your-uploads' && <VideoSection type="uploads" />}
          {activeTab === 'playlists' && <PlaylistSection />}
        </div>
      </div>

      {/* Upload Video Modal */}
      <UploadVideoModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Dashboard;