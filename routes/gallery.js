const express = require("express");
const multer = require("multer");

const router = express.Router();

const verifyToken = require("../middleware/verify-token");
const requireAdmin = require("../middleware/require-admin");

const {
  createGalleryItem,
  getGalleryItems,
  toggleGalleryItem,
  getAllGalleryItems,
  deleteGalleryItem
} = require("../controllers/galleryController");

const upload = multer({
  storage: multer.memoryStorage()
});

router.get("/", getGalleryItems);

router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("media"),
  createGalleryItem
);

router.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  toggleGalleryItem
);


router.get(
  "/admin/all",
  verifyToken,
  requireAdmin,
  getAllGalleryItems
);


router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  deleteGalleryItem
);


module.exports = router;