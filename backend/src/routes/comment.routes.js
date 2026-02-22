import { Router } from "express"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js"
import  {verifyJWT}  from "../middlewares/auth.middleware.js"

const router = Router()

// Get all comments for a video (with pagination)
router.get("/video/:videoId", verifyJWT, getVideoComments)


// Add a comment to a video
router.post("/video/:videoId", verifyJWT, addComment)

// Update a comment
router.patch("/:commentId", verifyJWT, updateComment)

// Delete a comment
router.delete("/:commentId", verifyJWT, deleteComment)

export default router