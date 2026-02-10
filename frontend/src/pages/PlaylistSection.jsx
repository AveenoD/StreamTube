import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PlaylistSection = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/playlists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      setPlaylists(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!newPlaylist.name.trim()) {
      setError('Playlist name is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newPlaylist)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create playlist');
      }

      const data = await response.json();
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '' });
      fetchPlaylists(); // Refresh playlists
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      fetchPlaylists(); // Refresh playlists
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-lg"></div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Your Playlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          + Create Playlist
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No playlists yet</h2>
          <p className="text-gray-600 mb-6">Create your first playlist to organize your videos</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/playlist/${playlist._id}`)}
            >
              <div className="relative h-40 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <span className="text-white text-6xl">🎵</span>
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {playlist.videos?.length || 0} videos
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                  {playlist.name}
                </h3>
                
                {playlist.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {playlist.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Created: {new Date(playlist.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist._id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Playlist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Playlist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter playlist name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter playlist description"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylist.name.trim()}
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistSection;