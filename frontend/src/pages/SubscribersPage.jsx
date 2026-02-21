import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../toaster/UseToast.js';
import { Users, ArrowLeft, UserCheck } from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api/v1';

function formatCount(num) {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export default function SubscribersPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);

    try {
      // Get current user first
      const userRes = await axios.get(
        `${BASE_URL}/users/current-user`,
        { headers }
      );

      const userId = userRes.data.data._id;
      setCurrentUserId(userId);

      // Get subscribers
      const subsRes = await axios.get(
        `${BASE_URL}/subscriptions/user/${userId}`,
        { headers }
      );

      setSubscribers(subsRes.data.data || []);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <button
            onClick={() => navigate("/profile")}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-white border border-gray-200 text-gray-500
                       hover:text-gray-800 hover:bg-gray-100
                       shadow-sm transition-all duration-200"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100
                            flex items-center justify-center">
              <Users size={20} className="text-indigo-500" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Subscribers
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                People who subscribed to your channel
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && subscribers.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4
                            flex items-center justify-center">
              <Users size={32} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-gray-600 mb-1">
              No subscribers yet
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Create great content and people will start subscribing
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-full
                         text-sm font-bold hover:bg-rose-600"
            >
              Upload Video
            </button>
          </div>
        )}

        {/* Subscribers list */}
        {!loading && subscribers.length > 0 && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              {subscribers.map(sub => (
                <Link
                  key={sub._id}
                  to={`/channel/${sub.subscriber?._id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm
                             hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0
                                    ring-2 ring-transparent group-hover:ring-indigo-200
                                    transition-all duration-200">
                      {sub.subscriber?.avatar ? (
                        <img 
                          src={sub.subscriber.avatar} 
                          alt={sub.subscriber.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br
                                        from-indigo-400 to-purple-500
                                        flex items-center justify-center">
                          <span className="text-white font-bold">
                            {sub.subscriber?.username?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate
                                      group-hover:text-indigo-600 transition-colors">
                          {sub.subscriber?.fullName || sub.subscriber?.username}
                        </p>
                        <UserCheck size={14} className="text-gray-400 flex-shrink-0" 
                                   strokeWidth={2} />
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        @{sub.subscriber?.username}
                      </p>
                    </div>

                    {/* View Channel button */}
                    <button
                      className="px-4 py-2 rounded-full text-xs font-bold
                                 bg-gray-100 text-gray-700
                                 group-hover:bg-indigo-100 group-hover:text-indigo-600
                                 transition-all duration-200"
                    >
                      View Channel
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}