import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../toaster/UseToast.js';
import VideoCard, { VideoCardSkeleton } from '../components/VideoCard';
import { 
  ListVideo, ArrowLeft, Trash2, PlaySquare
} from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api/v1';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // ── Your logic (unchanged) ────────────────────────────
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    async function fetchPlaylist() {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const headers = { Authorization: `Bearer ${token}` };
      setLoading(true);

      try {
        const response = await axios.get(
          `${BASE_URL}/playlists/${playlistId}`,
          { headers }
        );
        setPlaylist(response.data.data || null);

      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch playlist"
        );
        navigate("/playlists");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylist();
  }, [playlistId]);

  async function handleRemoveVideo(videoId) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    setLoading(true);
    try {
      await axios.patch(
        `${BASE_URL}/playlists/${playlistId}/remove`,
        { videoId },
        { headers }
      );

      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v._id !== videoId)
      }));

      toast.success("Removed from Playlist");

    } catch (error) {
      toast.error("Failed to remove video");
    } finally {
      setLoading(false);
    }
  }

  // ── UI ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Loading ───────────────────────────────── */}
        {loading && !playlist && (
          <div>
            <div className="flex items-center gap-4 mb-7">
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Playlist content ──────────────────────── */}
        {!loading && playlist && (
          <div>
            {/* Header */}
            <div className="flex items-start gap-4 mb-7">
              <button
                onClick={() => navigate("/playlists")}
                className="w-9 h-9 flex items-center justify-center rounded-xl
                           bg-white border border-gray-200 text-gray-500
                           hover:text-gray-800 hover:bg-gray-100
                           shadow-sm transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft size={18} strokeWidth={2} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100
                                  flex items-center justify-center flex-shrink-0">
                    <ListVideo size={20} className="text-purple-500" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black text-gray-900 tracking-tight truncate">
                      {playlist.name}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {playlist.videos?.length || 0} video{playlist.videos?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {playlist.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {playlist.description}
                  </p>
                )}
              </div>
            </div>

            {/* Empty state */}
            {playlist.videos?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-full bg-gray-100
                                flex items-center justify-center mb-4">
                  <PlaySquare size={32} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-gray-600 mb-1">
                  No videos in this playlist
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Add videos from any video page
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-full
                             text-sm font-bold hover:bg-gray-700
                             transition-colors duration-200"
                >
                  Browse Videos
                </button>
              </div>
            )}

            {/* Video grid with remove buttons */}
            {playlist.videos?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2
                              lg:grid-cols-3 xl:grid-cols-4
                              gap-x-4 gap-y-8">
                {playlist.videos.map(video => (
                  <div key={video._id} className="relative group">
                    <VideoCard video={video} />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveVideo(video._id)}
                      className="absolute top-2 right-2 w-8 h-8
                                 bg-red-500 hover:bg-red-600 text-white
                                 rounded-full shadow-lg opacity-0
                                 group-hover:opacity-100
                                 transition-all duration-200
                                 flex items-center justify-center z-10"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}