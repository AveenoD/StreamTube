import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../toaster/UseToast.js';
import {
    ListVideo, Plus, Trash2, X,
    PlaySquare, Lock, Globe
} from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api/v1';

export default function PlaylistsPage() {
    const toast = useToast();
    const navigate = useNavigate();

    // ── Your logic (unchanged) ────────────────────────────
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // ── UI states ──────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const headers = { Authorization: `Bearer ${token}` };

        async function fetchPlaylists() {
            setLoading(true);
            try {
                const userRes = await axios.get(
                    `${BASE_URL}/users/current-user`,
                    { headers }
                );
                const userId = userRes.data.data._id;

                const playlistRes = await axios.get(
                    `${BASE_URL}/playlists/user/${userId}`,
                    { headers }
                );
               
                setPlaylists(playlistRes.data.data || []);
               

            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to load playlists"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchPlaylists();
    }, []);

    async function handleCreatePlaylist(e) {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Playlist name is required");
            return;
        }

        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const body = {
            name: name.trim(),
            description: description.trim() || ""
        };

        setLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/playlists`,
                body,
                { headers }
            );

            setPlaylists(prev => [response.data.data, ...prev]);
            setName("");
            setDescription("");
            setShowModal(false);  // close modal
            toast.success("Playlist created! 📝");

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create playlist"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDeletePlaylist(playlistId) {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            await axios.delete(
                `${BASE_URL}/playlists/${playlistId}`,
                { headers }
            );

            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
            toast.success("Playlist deleted");

        } catch (error) {
            toast.error("Failed to delete playlist");
        }
    }

    // ── UI ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Header ────────────────────────────────── */}
                <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100
                            flex items-center justify-center">
                            <ListVideo size={20} className="text-purple-500" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">
                                My Playlists
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Organize your favorite videos
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-purple-500 hover:bg-purple-600 text-white
                       text-sm font-bold shadow-md shadow-purple-200
                       transition-all duration-200"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New Playlist
                    </button>
                </div>

                {/* ── Loading ───────────────────────────────── */}
                {loading && playlists.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
                                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty state ───────────────────────────── */}
                {!loading && playlists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-20 h-20 rounded-full bg-gray-100
                            flex items-center justify-center mb-4">
                            <ListVideo size={32} className="text-gray-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-gray-600 mb-1">
                            No playlists yet
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Create your first playlist to organize videos
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-2.5 bg-purple-500 text-white rounded-full
                         text-sm font-bold hover:bg-purple-600
                         transition-colors duration-200 shadow-md"
                        >
                            Create Playlist
                        </button>
                    </div>
                )}

                {/* ── Playlist grid ─────────────────────────── */}
                {!loading && playlists.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {playlists.map(playlist => (
                            <div
                                key={playlist._id}
                                className="bg-white rounded-2xl overflow-hidden
                           shadow-sm hover:shadow-md transition-all
                           duration-200 group"
                            >
                                <Link to={`/playlist/${playlist._id}`}>
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-gradient-to-br
                                  from-purple-400 to-pink-400
                                  relative overflow-hidden">
                                        {playlist.videos?.[0]?.thumbnail ? (
                                            <img
                                                src={playlist.videos[0].thumbnail}
                                                alt={playlist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <PlaySquare size={48} className="text-white/30"
                                                    strokeWidth={1.5} />
                                            </div>
                                        )}

                                        {/* Video count overlay */}
                                        <div className="absolute bottom-2 right-2 px-2 py-1
                                    bg-black/70 rounded-lg text-white text-xs
                                    font-bold flex items-center gap-1">
                                            <PlaySquare size={12} strokeWidth={2} />
                                            {playlist.videos?.length || 0}
                                        </div>
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <Link
                                            to={`/playlist/${playlist._id}`}
                                            className="flex-1 min-w-0"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900
                                     group-hover:text-purple-600
                                     transition-colors truncate">
                                                {playlist.name}
                                            </h3>
                                            {playlist.description && (
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                    {playlist.description}
                                                </p>
                                            )}
                                        </Link>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => handleDeletePlaylist(playlist._id)}
                                            className="w-8 h-8 flex-shrink-0 rounded-full
                                 text-gray-300 hover:text-red-500
                                 hover:bg-red-50 transition-all duration-150
                                 flex items-center justify-center"
                                        >
                                            <Trash2 size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ── Create Modal ──────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md
                          shadow-2xl animate-in fade-in zoom-in-95
                          duration-200">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4
                            border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">
                                Create New Playlist
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-gray-400 hover:text-gray-700 hover:bg-gray-100
                           transition-all duration-150"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2">
                                    Playlist Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Awesome Playlist"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl
                             px-4 py-3 text-sm text-gray-800
                             placeholder:text-gray-300 outline-none
                             focus:border-purple-400 focus:bg-white
                             focus:ring-4 focus:ring-purple-100
                             transition-all duration-200"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this playlist about?"
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl
                             px-4 py-3 text-sm text-gray-800
                             placeholder:text-gray-300 outline-none
                             focus:border-purple-400 focus:bg-white
                             focus:ring-4 focus:ring-purple-100
                             transition-all duration-200 resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm
                             bg-gray-100 hover:bg-gray-200 text-gray-700
                             transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm
                             bg-purple-500 hover:bg-purple-600 text-white
                             shadow-md shadow-purple-200
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-all duration-200"
                                >
                                    {loading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}