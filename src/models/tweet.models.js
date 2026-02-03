import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({

},{timestamps: true})

const Tweet = mongoose.model("Tweet",tweetSchema)