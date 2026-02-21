import { Router } from "express";
import { 
  createTweet, 
  getUserTweets, 
  updateTweet, 
  deleteTweet 
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createTweet);                    // Create
router.get("/user/:userId", verifyJWT, getUserTweets);       // Get user tweets
router.patch("/:tweetId", verifyJWT, updateTweet);           // Update
router.delete("/:tweetId", verifyJWT, deleteTweet);          // Delete

export default router;