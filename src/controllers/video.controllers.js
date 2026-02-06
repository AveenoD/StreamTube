import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Comment } from "../models/comment.models.js"
import { Like } from "../models/like.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: Delete video 
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

   
    await Comment.deleteMany({ video: videoId })
    await Like.deleteMany({ video: videoId })
    // TODO: Delete video file from cloud storage if implemented
    // await deleteFromCloudinary(video.videoFile)
    const deleteResult = await Video.deleteOne({
        _id: videoId,
        owner: req.user._id
    })

   
    if (deleteResult.deletedCount === 0) {
        throw new ApiError(404, "Video not found or unauthorized")
    }

  
    return res.status(200).json(
        new ApiResponse(
            200,
            { videoId },
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}