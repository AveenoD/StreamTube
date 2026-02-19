import { Router } from "express"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"

import { verifyJWT as authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

// Create playlist
router.post("/", authMiddleware, createPlaylist)  

// Get user playlists
router.get("/user/:userId", getUserPlaylists)  

// Get playlist by ID
router.get("/:playlistId", authMiddleware, getPlaylistById)  


router.patch("/:playlistId/add", authMiddleware, addVideoToPlaylist)  


router.patch("/:playlistId/remove", authMiddleware, removeVideoFromPlaylist)  

// Delete playlist
router.delete("/:playlistId", authMiddleware, deletePlaylist)  

// Update playlist
router.patch("/:playlistId", authMiddleware, updatePlaylist) 

export default router