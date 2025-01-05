import express from "express";
import {
  authenticateUser,
  createUserAccount,
  signOutUser,
  getCurrentUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

// Auth routes
router.post("/signup", createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);

//Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch(
  "/profile",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

export default router;
