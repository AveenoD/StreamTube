import { Router } from "express"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getUserSubscribers  // ✅ Import new function
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/subscribe/:channelId", verifyJWT, toggleSubscription)
router.get("/channel/:channelId/subscribers", getUserChannelSubscribers)
router.get("/user/:subscriberId/subscribed-channels", getSubscribedChannels)
router.get("/user/:userId", verifyJWT, getUserSubscribers)  // ✅ Add this

export default router