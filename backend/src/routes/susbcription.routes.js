import { Router } from "express"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// Toggle subscription (requires auth)
router.post("/subscribe/:channelId", verifyJWT, toggleSubscription)

// Get channel subscribers (public)
router.get("/channel/:channelId/subscribers", getUserChannelSubscribers)

// Get user's subscribed channels (public)
router.get("/user/:subscriberId/subscribed-channels", getSubscribedChannels)

export default router