import { Router } from "express"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js" // Use verifyJWT, not authMiddleware

const router = Router()

// Toggle like on video
router.post("/toggle/video/:videoId", verifyJWT, toggleVideoLike)

// Toggle like on comment
router.post("/toggle/comment/:commentId", verifyJWT, toggleCommentLike)

// Toggle like on tweet
router.post("/toggle/tweet/:tweetId", verifyJWT, toggleTweetLike)

// ✅ FIX: Remove :userId param - use authenticated user from JWT
// This route should be at /api/v1/likes/videos (without :userId)
router.get("/videos", verifyJWT, getLikedVideos) // Removed :userId

export default router