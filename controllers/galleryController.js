const pool = require("../db/database");
const cloudinary = require("../config/cloudinary");

async function createGalleryItem(req, res) {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        err: "Media file is required."
      });
    }

    const cleanedTitle =
      typeof title === "string" ? title.trim() : "";

    const cleanedDescription =
      typeof description === "string" ? description.trim() : "";

    if (!cleanedTitle) {
      return res.status(400).json({
        err: "Title is required."
      });
    }

    const mediaType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "you-party-i-pour/gallery"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const galleryResult = await pool.query(
        `INSERT INTO gallery_items (
            title,
            description,
            media_type,
            media_url,
            thumbnail_url,
            cloudinary_public_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            cleanedTitle,
            cleanedDescription,
            mediaType,
            uploadResult.secure_url,
            null,
            uploadResult.public_id
        ]
    );

    res.status(201).json(galleryResult.rows[0]);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function getGalleryItems(req, res) {
  try {
    const galleryResult = await pool.query(
      `SELECT
        id,
        title,
        description,
        media_type,
        media_url,
        thumbnail_url,
        created_at
      FROM gallery_items
      WHERE is_active = TRUE
      ORDER BY created_at DESC`
    );

    res.status(200).json(galleryResult.rows);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function toggleGalleryItem(req, res) {
  try {
    const galleryResult = await pool.query(
      `UPDATE gallery_items
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    const galleryItem = galleryResult.rows[0];

    if (!galleryItem) {
      return res.status(404).json({
        err: "Gallery item not found."
      });
    }

    res.status(200).json(galleryItem);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function getAllGalleryItems(req, res) {
  try {
    const galleryResult = await pool.query(
      `SELECT *
       FROM gallery_items
       ORDER BY created_at DESC`
    );

    res.status(200).json(galleryResult.rows);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function deleteGalleryItem(req, res) {
  try {
    const galleryResult = await pool.query(
      `SELECT *
       FROM gallery_items
       WHERE id = $1`,
      [req.params.id]
    );

    const galleryItem = galleryResult.rows[0];

    if (!galleryItem) {
      return res.status(404).json({
        err: "Gallery item not found."
      });
    }

    if (galleryItem.cloudinary_public_id) {
      await cloudinary.uploader.destroy(
        galleryItem.cloudinary_public_id,
        {
          resource_type:
            galleryItem.media_type === "video"
              ? "video"
              : "image"
        }
      );
    }

    await pool.query(
      `DELETE FROM gallery_items
       WHERE id = $1`,
      [req.params.id]
    );

    res.status(200).json({
      message: "Gallery item deleted successfully."
    });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


module.exports = {
  createGalleryItem,
  getGalleryItems,
  toggleGalleryItem,
  getAllGalleryItems,
  deleteGalleryItem
};