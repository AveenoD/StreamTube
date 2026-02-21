import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../toaster/UseToast.js";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard";
import {
  PlaySquare, Settings, Upload, Users, Edit3,
  MessageSquare, Clock, Heart, Trash2, Edit2
} from "lucide-react";

const BASE_URL = "http://localhost:5000/api/v1";

function formatCount(num) {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return new Date(date).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function ProfilePage() {
  const toast    = useToast();
  const navigate = useNavigate();

  const [user, setUser]                       = useState(null);
  const [videos, setVideos]                   = useState([]);
  const [tweets, setTweets]                   = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [activeTab, setActiveTab]             = useState("videos");
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    
    async function fetchProfileData() {
      setLoading(true);
      
      try {
        // Get current user first
        const userRes = await axios.get(
          `${BASE_URL}/users/current-user`,
          { headers }
        );
        
        const currentUser = userRes.data.data;
        if (!currentUser || !currentUser._id) return;
        
        setUser(currentUser);
        
        // Fetch subscriber count + videos + tweets in parallel
        const [channelRes, videosRes, tweetsRes] = await Promise.all([
          axios.get(`${BASE_URL}/users/c/${currentUser._id}`, { headers }),
          axios.get(`${BASE_URL}/videos?userId=${currentUser._id}`, { headers }),
          axios.get(`${BASE_URL}/tweets/user/${currentUser._id}`, { headers })
        ]);
        
        setSubscribersCount(channelRes.data.data.subscribersCount || 0);
        setVideos(videosRes.data.data.videos || []);
        setTweets(tweetsRes.data.data.tweets || []);
        
      } catch (error) {
        toast.error("Failed to load profile");
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileData();
  }, []);

  async function handleDeleteTweet(tweetId) {
    if (!confirm("Delete this post?")) return;

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${BASE_URL}/tweets/${tweetId}`, { headers });
      setTweets(prev => prev.filter(t => t._id !== tweetId));
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Loading state */}
      {loading && !user && (
        <div>
          <div className="w-full h-40 sm:h-52 bg-gray-200 animate-pulse" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse ring-4 ring-white" />
              <div className="space-y-2 pb-2">
                <div className="h-5 w-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile content */}
      {user && (
        <div>

          {/* Cover image */}
          <div className="w-full h-40 sm:h-56 overflow-hidden
                          bg-gradient-to-br from-indigo-400 via-purple-500 to-rose-400">
            {user.coverImage && (
              <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Avatar + info + actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-8">

              {/* Left — avatar + name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500
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
                    <button
                      onClick={() => navigate("/subscribers")}
                      className="flex items-center gap-1.5 text-xs text-gray-500 
                                 font-medium hover:text-gray-700 transition-colors"
                    >
                      <Users size={13} strokeWidth={2} />
                      {formatCount(subscribersCount)} subscribers
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <PlaySquare size={13} strokeWidth={2} />
                      {videos.length} videos
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <MessageSquare size={13} strokeWidth={2} />
                      {tweets.length} posts
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — action buttons */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => navigate("/upload")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full
                             bg-rose-500 hover:bg-rose-600 text-white
                             text-sm font-bold shadow-md shadow-rose-200"
                >
                  <Upload size={15} strokeWidth={2.5} />
                  Upload
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full
                             bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold"
                >
                  <Edit3 size={15} strokeWidth={2.5} />
                  Edit Profile
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                             bg-gray-100 hover:bg-gray-200 text-gray-500"
                >
                  <Settings size={16} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors
                              ${activeTab === "videos" 
                                ? "border-gray-900 text-gray-900" 
                                : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  <div className="flex items-center gap-2">
                    <PlaySquare size={16} strokeWidth={2} />
                    Videos
                    {videos.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                        {videos.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("posts")}
                  className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors
                              ${activeTab === "posts" 
                                ? "border-gray-900 text-gray-900" 
                                : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} strokeWidth={2} />
                    Posts
                    {tweets.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                        {tweets.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Videos section */}
            {activeTab === "videos" && (
              <div className="pb-10">
                {loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <VideoCardSkeleton key={i} />
                    ))}
                  </div>
                )}

                {!loading && videos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <PlaySquare size={28} className="text-gray-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">No videos yet</p>
                    <p className="text-xs text-gray-400 mb-5">Upload your first video to get started</p>
                    <button
                      onClick={() => navigate("/upload")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full
                                 bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-md"
                    >
                      <Upload size={15} strokeWidth={2.5} />
                      Upload Video
                    </button>
                  </div>
                )}

                {!loading && videos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts section */}
            {activeTab === "posts" && (
              <div className="pb-10">
                {loading && (
                  <div className="max-w-2xl space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                        <div className="flex gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                            <div className="h-3 bg-gray-100 rounded-full w-1/6" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && tweets.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <MessageSquare size={28} className="text-gray-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">No posts yet</p>
                    <p className="text-xs text-gray-400 mb-5">Share your thoughts with your community</p>
                    <button
                      onClick={() => navigate("/posts")}
                      className="px-5 py-2.5 rounded-full bg-blue-500 text-white
                                 text-sm font-bold hover:bg-blue-600"
                    >
                      Create Post
                    </button>
                  </div>
                )}

                {!loading && tweets.length > 0 && (
                  <div className="max-w-2xl space-y-4">
                    {tweets.map((tweet) => (
                      <div key={tweet._id}
                           className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                              {tweet.owner?.avatar ? (
                                <img src={tweet.owner.avatar} alt={tweet.owner.username}
                                     className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500
                                                flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {tweet.owner?.username?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {tweet.owner?.fullName || tweet.owner?.username}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>@{tweet.owner?.username}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} strokeWidth={2} />
                                  {timeAgo(tweet.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate("/posts")}
                              className="w-8 h-8 rounded-full flex items-center justify-center
                                         text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                            >
                              <Edit2 size={14} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteTweet(tweet._id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center
                                         text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
                          {tweet.content}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Heart size={16} strokeWidth={2} />
                            {tweet.likeCount > 0 && (
                              <span className="font-semibold">{tweet.likeCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}