import { Router } from "express"
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getChannelVideos,
    getChannelStats
} from "../controllers/video.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Get all videos with search, sort, pagination
router.get(
    "/",
    getAllVideos
)

// Get video by ID
router.get(
    "/:videoId",
    getVideoById
)

// Get channel videos
router.get(
    "/channel/videos/:channelId",
    getChannelVideos
)

// Get channel stats
router.get(
    "/channel/stats/:channelId",
    getChannelStats
)

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// Publish a new video
router.post(
    "/publish",
    authMiddleware,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
)

// Update video details (title, description, thumbnail)
router.patch(
    "/:videoId",
    authMiddleware,
    upload.single("thumbnail"), // Optional thumbnail update
    updateVideo
)

// Delete video
router.delete(
    "/:videoId",
    authMiddleware,
    deleteVideo
)

// Toggle publish status (publish/unpublish)
router.patch(
    "/:videoId/publish-status",
    authMiddleware,
    togglePublishStatus
)

export default router