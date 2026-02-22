import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../toaster/UseToast.js';
import { 
  MessageSquare, Plus, X, Edit2, Trash2, 
  Heart, Clock
} from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api/v1';

function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function TweetsPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const charLimit = 280;
  const charsLeft = charLimit - content.length;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchTweets();
  }, []);

  async function fetchTweets() {
    if (!currentUser?._id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/tweets/user/${currentUser._id}`,
        { headers }
      );
      setTweets(response.data.data.tweets || []);
    } catch (error) {
      toast.error("Failed to load tweets");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim()) {
      toast.warning("Tweet cannot be empty");
      return;
    }

    if (content.length > charLimit) {
      toast.warning(`Tweet is too long (max ${charLimit} characters)`);
      return;
    }

    setPosting(true);

    try {
      if (editingTweet) {
        // Update existing tweet
        const response = await axios.patch(
          `${BASE_URL}/tweets/${editingTweet._id}`,
          { content },
          { headers }
        );
        
        setTweets(prev => prev.map(t => 
          t._id === editingTweet._id ? response.data.data : t
        ));
        toast.success("Tweet updated! ✏️");
        
      } else {
        // Create new tweet
        const response = await axios.post(
          `${BASE_URL}/tweets`,
          { content },
          { headers }
        );
        
        setTweets(prev => [response.data.data, ...prev]);
        toast.success("Tweet posted! 🎉");
      }

      setContent("");
      setShowCreateModal(false);
      setEditingTweet(null);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post tweet");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(tweetId) {
    if (!confirm("Delete this tweet?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/tweets/${tweetId}`,
        { headers }
      );
      
      setTweets(prev => prev.filter(t => t._id !== tweetId));
      toast.success("Tweet deleted");

    } catch (error) {
      toast.error("Failed to delete tweet");
    }
  }

  function handleEdit(tweet) {
    setEditingTweet(tweet);
    setContent(tweet.content);
    setShowCreateModal(true);
  }

  async function handleLike(tweetId) {
    try {
      // Optimistic update
      setTweets(prev => prev.map(tweet => {
        if (tweet._id === tweetId) {
          const isLiked = tweet.isLiked || false;
          return {
            ...tweet,
            isLiked: !isLiked,
            likeCount: isLiked ? (tweet.likeCount - 1) : (tweet.likeCount + 1)
          };
        }
        return tweet;
      }));

      await axios.post(
        `${BASE_URL}/likes/toggle/tweet/${tweetId}`,
        {},
        { headers }
      );

    } catch (error) {
      toast.error("Failed to like tweet");
      // Rollback on error
      fetchTweets();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100
                            flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-500" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                My Posts
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Share updates with your subscribers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTweet(null);
              setContent("");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-blue-500 hover:bg-blue-600 text-white
                       text-sm font-bold shadow-md shadow-blue-200
                       transition-all duration-200"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Post
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && tweets.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4
                            flex items-center justify-center">
              <MessageSquare size={32} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-gray-600 mb-1">
              No posts yet
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Share your thoughts with your community
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-full
                         text-sm font-bold hover:bg-blue-600"
            >
              Create Your First Post
            </button>
          </div>
        )}

        {/* Tweets list */}
        {!loading && tweets.length > 0 && (
          <div className="space-y-4">
            {tweets.map(tweet => (
              <div key={tweet._id}
                   className="bg-white rounded-2xl p-5 shadow-sm
                              hover:shadow-md transition-shadow group">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {tweet.owner?.avatar ? (
                        <img src={tweet.owner.avatar} alt={tweet.owner.username}
                             className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br
                                        from-blue-400 to-purple-500
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
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100
                                  transition-opacity">
                    <button
                      onClick={() => handleEdit(tweet)}
                      className="w-8 h-8 rounded-full flex items-center justify-center
                                 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                    >
                      <Edit2 size={14} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(tweet._id)}
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
                  <button
                    onClick={() => handleLike(tweet._id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors
                                ${tweet.isLiked 
                                  ? "text-rose-500" 
                                  : "text-gray-400 hover:text-rose-500"}`}
                  >
                    <Heart 
                      size={16} 
                      strokeWidth={2}
                      className={tweet.isLiked ? "fill-rose-500" : ""} 
                    />
                    {tweet.likeCount > 0 && (
                      <span className="font-semibold">{tweet.likeCount}</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center
                          bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
              
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-base font-bold text-gray-900">
                  {editingTweet ? "Edit Post" : "Create Post"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTweet(null);
                    setContent("");
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             text-gray-400 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl
                             px-4 py-3 text-sm text-gray-800
                             placeholder:text-gray-300 outline-none resize-none
                             focus:border-blue-400 focus:bg-white
                             focus:ring-4 focus:ring-blue-100
                             transition-all duration-200"
                />

                <div className="flex items-center justify-between mt-4">
                  <span className={`text-sm font-semibold
                                    ${charsLeft < 0 ? "text-red-500" : 
                                      charsLeft < 20 ? "text-orange-500" : "text-gray-400"}`}>
                    {charsLeft} characters left
                  </span>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingTweet(null);
                        setContent("");
                      }}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm
                                 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting || !content.trim() || charsLeft < 0}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm
                                 bg-blue-500 hover:bg-blue-600 text-white
                                 shadow-md shadow-blue-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {posting ? "Posting..." : editingTweet ? "Update" : "Post"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}