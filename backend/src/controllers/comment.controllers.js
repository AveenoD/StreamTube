import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import  asyncHandler from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const videoComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        owner: {               // ✅ nested owner object
          _id: "$owner._id",
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        }
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, videoComments, "Comments fetched successfully")
  );
});

// ─────────────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const newComment = await Comment.create({
    video: videoId,
    owner: req.user._id,
    content: content.trim()
  });

  // ✅ Populate so frontend gets username + avatar immediately
  const populatedComment = await Comment.findById(newComment._id)
    .populate("owner", "_id username fullName avatar");

  return res.status(201).json(
    new ApiResponse(201, populatedComment, "Comment added successfully")
  );
});

// ─────────────────────────────────────────────────
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;  // ✅ Bug 3 fixed — was req.prarams
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  ).populate("owner", "_id username fullName avatar");

  return res.status(200).json(
    new ApiResponse(200, updatedComment, "Comment updated successfully")
  );
});

// ─────────────────────────────────────────────────
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Comment deleted successfully")
  );
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}