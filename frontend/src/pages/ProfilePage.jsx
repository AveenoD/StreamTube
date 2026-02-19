import { useState, useEffect } from "react";
import { useNavigate, Link }   from "react-router-dom";
import axios                   from "axios";
import { useToast }            from "../toaster/UseToast.js";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard";
import {
  PlaySquare, Settings, Upload,
  Users, Eye, Edit3
} from "lucide-react";

const BASE_URL = "http://localhost:5000/api/v1";

function formatCount(num) {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export default function ProfilePage() {
  const toast    = useToast();
  const navigate = useNavigate();

  const [user, setUser]             = useState(null);
  const [videos, setVideos]         = useState([]);
  const [loading, setLoading]       = useState(false);
  
  // ✅ ADD: Separate state for subscriber count (like ChannelPage)
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    axios
      .get(`${BASE_URL}/users/current-user`, { headers })
      .then((res) => {
        const currentUser = res.data.data;
        if (!currentUser || !currentUser._id) return;
        
        setUser(currentUser);
        
        // ✅ FIX: Set subscribersCount from API (normalize field name)
        const count = 
          currentUser.subscribersCount ?? 
          currentUser.subscriberCount ?? 
          currentUser.totalSubscribers ?? 
          currentUser._count?.subscribers ?? 
          0;
        setSubscribersCount(count);
        
      })
      .catch((err) => {
        toast.error("Failed to load profile");
        if (err.response?.status === 401) navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    async function fetchVideos() {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/videos?userId=${user._id}`
        );
        
        // ✅ Normalize views field for videos
        const fetchedVideos = response.data.data.videos || [];
        const normalizedVideos = fetchedVideos.map(video => ({
          ...video,
          views: video.viewsCount ?? video.views ?? video.viewCount ?? 0
        }));
        
        setVideos(normalizedVideos);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to fetch videos"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [user]);

  // ── UI ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Loading state ──────────────────────────── */}
      {loading && !user && (
        <div>
          <div className="w-full h-40 sm:h-52 bg-gray-200 animate-pulse" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start
                            sm:items-end gap-4 -mt-10 mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-300
                              animate-pulse ring-4 ring-white" />
              <div className="space-y-2 pb-2">
                <div className="h-5 w-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2
                            lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile content ────────────────────────── */}
      {user && (
        <div>

          {/* ── Cover image ──────────────────────── */}
          <div className="w-full h-40 sm:h-56 overflow-hidden
                          bg-gradient-to-br from-indigo-400
                          via-purple-500 to-rose-400">
            {user.coverImage && (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* ── Avatar + info + actions ────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end
                            sm:justify-between gap-4 -mt-12 mb-8">

              {/* Left — avatar + name */}
              <div className="flex flex-col sm:flex-row items-start
                              sm:items-end gap-4">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden
                                ring-4 ring-white shadow-lg flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br
                                    from-indigo-400 to-purple-500
                                    flex items-center justify-center">
                      <span className="text-white text-3xl font-black">
                        {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + username + stats */}
                <div className="pb-1">
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    {user.fullName}
                  </h1>
                  <p className="text-sm text-gray-400 font-medium mt-0.5">
                    @{user.username}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5
                                     text-xs text-gray-500 font-medium">
                      <Users size={13} strokeWidth={2} />
                      {/* ✅ FIX: Use separate subscribersCount state (like ChannelPage) */}
                      {formatCount(subscribersCount || 0)} subscribers
                    </span>
                    <span className="flex items-center gap-1.5
                                     text-xs text-gray-500 font-medium">
                      <PlaySquare size={13} strokeWidth={2} />
                      {videos.length} videos
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — action buttons (your own channel) */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => navigate("/upload")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full
                             bg-rose-500 hover:bg-rose-600 text-white
                             text-sm font-bold shadow-md shadow-rose-200
                             transition-all duration-200"
                >
                  <Upload size={15} strokeWidth={2.5} />
                  Upload
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full
                             bg-gray-100 hover:bg-gray-200 text-gray-700
                             text-sm font-bold transition-all duration-200"
                >
                  <Edit3 size={15} strokeWidth={2.5} />
                  Edit Profile
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-10 h-10 flex items-center justify-center
                             rounded-full bg-gray-100 hover:bg-gray-200
                             text-gray-500 transition-all duration-200"
                >
                  <Settings size={16} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* ── Divider ───────────────────────── */}
            <div className="border-b border-gray-200 mb-6" />

            {/* ── Videos section ───────────────── */}
            <div className="pb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">
                  Your Videos
                </h2>
                {videos.length > 0 && (
                  <span className="text-xs text-gray-400 font-medium">
                    {videos.length} video{videos.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Loading video skeletons */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && videos.length === 0 && (
                <div className="flex flex-col items-center justify-center
                                py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100
                                  flex items-center justify-center mb-3">
                    <PlaySquare size={28} className="text-gray-300"
                      strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    No videos yet
                  </p>
                  <p className="text-xs text-gray-400 mb-5">
                    Upload your first video to get started
                  </p>
                  <button
                    onClick={() => navigate("/upload")}
                    className="flex items-center gap-2 px-5 py-2.5
                               rounded-full bg-rose-500 text-white
                               text-sm font-bold hover:bg-rose-600
                               transition-colors shadow-md shadow-rose-200"
                  >
                    <Upload size={15} strokeWidth={2.5} />
                    Upload Video
                  </button>
                </div>
              )}

              {/* Video grid */}
              {!loading && videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                lg:grid-cols-3 xl:grid-cols-4
                                gap-x-4 gap-y-8">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}