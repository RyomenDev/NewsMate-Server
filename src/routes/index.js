import express from "express";
import chatRoutes from "./chats.routes.js";

const router = express.Router();

router.use("/", chatRoutes); 

export default router;
