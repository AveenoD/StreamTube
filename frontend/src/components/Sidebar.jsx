import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/dashboard' },
    { id: 'explore', label: 'Explore', icon: '🔍', path: '/explore' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔔', path: '/subscriptions' },
    { id: 'library', label: 'Library', icon: '📚', path: '/library' },
    { id: 'history', label: 'History', icon: '🕒', path: '/history' },
    { id: 'playlist', label: 'Your Playlists', icon: '🎵', path: '/playlists' },
    { id: 'liked', label: 'Liked Videos', icon: '❤️', path: '/liked-videos' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
    { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
  ];

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

  const handleClick = (item) => {
    if (item.action === 'logout') {
      handleLogout();
    } else if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Streamify</h2>
          <p className="text-sm text-gray-500 mt-1">Your video platform</p>
        </div>

        <div className="p-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Home
          </button>
        </div>

        <nav className="mt-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setIsHovered(item.id)}
              onMouseLeave={() => setIsHovered(null)}
              className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                isHovered === item.id || item.id === 'home'
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              } ${item.id === 'logout' ? 'text-red-600 mt-4 border-t border-gray-200 pt-4' : 'text-gray-700'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>© 2026 Streamify</p>
            <p className="mt-1">Made with ❤️</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;