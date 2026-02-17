import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import axios                   from "axios";
import { useToast }            from "../toaster/UseToast.js";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard";
import { History, Trash2 }     from "lucide-react";

const BASE_URL = "http://localhost:5000/api/v1";

export default function HistoryPage() {
  const toast    = useToast();
  const navigate = useNavigate();

  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(false);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch watch history ────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    async function fetchHistory() {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/users/watch-history`,
          { headers }
        );
        setVideos(response.data.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load watch history"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  // ── Clear history ──────────────────────────────────────
  async function handleClearHistory() {
    try {
      await axios.delete(`${BASE_URL}/users/watch-history`, { headers });
      setVideos([]);
      toast.success("Watch history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100
                            flex items-center justify-center">
              <History size={20} className="text-indigo-500" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Watch History
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Videos you've watched
              </p>
            </div>
          </div>

          {videos.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-full
                         text-sm font-semibold text-red-500 bg-red-50
                         hover:bg-red-100 transition-all duration-200"
            >
              <Trash2 size={14} strokeWidth={2.5} />
              Clear All
            </button>
          )}
        </div>

        {/* ── Loading ───────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────── */}
        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100
                            flex items-center justify-center mb-4">
              <History size={32} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-gray-600 mb-1">
              No watch history
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Videos you watch will appear here
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

        {/* ── Video grid ────────────────────────────── */}
        {!loading && videos.length > 0 && (
          <>
            <p className="text-xs text-gray-400 font-medium mb-5">
              {videos.length} video{videos.length !== 1 ? "s" : ""} watched
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2
                            lg:grid-cols-3 xl:grid-cols-4
                            gap-x-4 gap-y-8">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}