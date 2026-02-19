import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;  // ✅ get from URL

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({
        owner: userId  // ✅ use URL param
    })
    .populate('owner', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    );
});

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || '',
        owner: req.user._id,
        videos: []
    });

    const createdPlaylist = await Playlist.findById(playlist._id)
        .populate('owner', 'username fullName avatar');

    return res.status(201).json(
        new ApiResponse(
            201,
            createdPlaylist,
            "Playlist created successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullName avatar')
        .populate('videos', 'title description thumbnail duration');

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullName avatar')
        .populate('videos', 'title description thumbnail duration');    

    return res.status(200).json(
        new ApiResponse(
            200,    
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in playlist");
    }

    playlist.videos.pull(videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullName avatar')
        .populate('videos', 'title description thumbnail duration');
    return res.status(200).json(
        new ApiResponse(
            200,    
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    await playlist.remove();
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Playlist deleted successfully"
        )
    );
}  
);
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;  // ✅ update these fields

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(req.user._id)) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    // ✅ Update name/description
    if (name?.trim()) {
        playlist.name = name.trim();
    }
    if (description !== undefined) {
        playlist.description = description.trim();
    }

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullName avatar')
        .populate('videos', 'title description thumbnail duration');

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    );
});
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
    
}