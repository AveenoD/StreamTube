import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../toaster/UseToast.js";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard";
import { ThumbsUp } from "lucide-react";

const BASE_URL = "http://localhost:5000/api/v1";

export default function LikedVideosPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch liked videos ─────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchLikedVideos() {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/likes/videos`,
          { headers }
        );
        
        const fetchedVideos = response.data.data.videos || [];
        
        // ✅ FIX: Normalize views field (API returns 'viewsCount')
        const normalizedVideos = fetchedVideos.map(video => ({
          ...video,
          views: video.viewsCount ?? video.views ?? video.viewCount ?? 0
        }));
        
        setVideos(normalizedVideos);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load liked videos"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLikedVideos();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ── Header - Responsive ───────────────────────── */}
        <div className="flex items-center gap-3 mb-6 sm:mb-7">
          <div className="w-10 h-10 rounded-2xl bg-rose-100
                          flex items-center justify-center flex-shrink-0">
            <ThumbsUp size={20} className="text-rose-500" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Liked Videos
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Videos you've liked
            </p>
          </div>
        </div>

        {/* ── Loading - Responsive grid ────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                          xl:grid-cols-4 2xl:grid-cols-5 
                          gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 
                          lg:gap-x-6 lg:gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state - Mobile optimized ───────────── */}
        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          py-20 sm:py-24 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100
                            flex items-center justify-center mb-4">
              <ThumbsUp size={28} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No liked videos
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md">
              Videos you like will appear here
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-full
                         text-sm font-semibold hover:bg-gray-700
                         transition-colors duration-200"
            >
              Browse Videos
            </button>
          </div>
        )}

        {/* ── Video grid - YouTube responsive ──────────── */}
        {!loading && videos.length > 0 && (
          <>
            <p className="text-sm text-gray-500 font-medium mb-4 sm:mb-5 px-1">
              {videos.length} liked video{videos.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                            xl:grid-cols-4 2xl:grid-cols-5 
                            gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 
                            lg:gap-x-6 lg:gap-y-8">
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