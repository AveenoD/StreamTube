import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Playlist name is required"],
      trim: true,
      minlength: [3, "Playlist name must be at least 3 characters"],
      maxlength: [50, "Playlist name cannot exceed 50 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"]
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    isPublic: {
      type: Boolean,
      default: true
    },
    thumbnail: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
playlistSchema.index({ owner: 1, createdAt: -1 });
playlistSchema.index({ name: "text", description: "text" });

// Virtual for video count
playlistSchema.virtual("videoCount").get(function() {
  return this.videos?.length || 0;
});

// Ensure virtuals are included in JSON responses
playlistSchema.set("toJSON", { virtuals: true });
playlistSchema.set("toObject", { virtuals: true });

// Static method to get playlist with populated videos
playlistSchema.statics.getPlaylistWithVideos = async function(playlistId) {
  return this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          { $match: { isPublished: true } },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                { $project: { username: 1, fullName: 1, avatar: 1 } }
              ]
            }
          },
          { $unwind: "$owner" },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              duration: 1,
              viewsCount: 1,
              createdAt: 1,
              owner: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          { $project: { username: 1, fullName: 1, avatar: 1 } }
        ]
      }
    },
    { $unwind: "$owner" },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        isPublic: 1,
        thumbnail: 1,
        videoCount: { $size: "$videos" },
        videos: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]).exec();
};

export const Playlist = mongoose.model("Playlist", playlistSchema);