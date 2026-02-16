import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.models.js"
import { Video } from "../models/video.models.js"
import { Comment } from "../models/comment.models.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    let isLiked;
    let actionMessage;

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })
        isLiked = false,
            actionMessage = "Video unliked successfully"
    }
    else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        isLiked = true
        actionMessage = "Video liked successfully"
    }
   const totalLikes = await Like.countDocuments({ video: videoId })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {
                liked: isLiked,
                totalLikes,
                videoId
            }, actionMessage)
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    let isLiked;
    let actionMessage;

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })
        isLiked = false
        actionMessage = "Comment unliked successfully"
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        isLiked = true
        actionMessage = "Comment liked successfully"
    }

    const totalLikes = await Like.countDocument({ comment: commentId })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    liked: isLiked,
                    totalLikes,
                    commentId
                }, actionMessage
            )
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    let isLiked;
    let actionMessage;

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        isLiked = false;
        actionMessage = "Tweet unliked successfully"
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });
        isLiked = true;
        actionMessage = "Tweet liked successfully"
    }

    const totalLikes = await Like.countDocument({ tweet: tweetId });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {
                liked: isLiked,
                totalLikes,
                tweetId
            }, actionMessage)
        )


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10), 50));
    const skip = (pageNum - 1) * limitNum;

    // ✅ Use authenticated user's ID from JWT token
    const userId = req.user._id;

    const aggregationResult = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },
        {
            $match: {
                "videoDetails.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                _id: "$videoDetails._id",
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                videoFile: "$videoDetails.videoFile",
                thumbnail: "$videoDetails.thumbnail",
                duration: "$videoDetails.duration",
                viewsCount: "$videoDetails.viewsCount",
                isPublished: "$videoDetails.isPublished",
                createdAt: "$videoDetails.createdAt",
                updatedAt: "$videoDetails.updatedAt",
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            }
        },
        {
            $facet: {
                videos: [
                    { $skip: skip },
                    { $limit: limitNum }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const videos = aggregationResult[0].videos;
    const total = aggregationResult[0].totalCount.length > 0
        ? aggregationResult[0].totalCount[0].count
        : 0;

    const totalPages = Math.ceil(total / limitNum);
    const hasMore = pageNum < totalPages;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                totalLiked: total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasMore
            },
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}