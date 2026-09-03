import { useEffect, useState } from "react";

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const isAdminLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        const token = localStorage.getItem("token");

        const url = token
          ? "/api/gallery/admin/all"
          : "/api/gallery";

        const response = await fetch(url, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        });

        if (!response.ok) {
          throw new Error("Unable to load gallery.");
        }

        const data = await response.json();

        setGalleryItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryItems();
  }, []);

  if (loading) {
    return <p>Loading gallery...</p>;
  }


  async function handleUpload(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token || !media) {
      return;
    }

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("media", media);

    try {
      const response = await fetch(
        "/api/gallery",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setUploadMessage("Admin session expired. Please sign in again.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.err || "Unable to upload media.");
      }

      setGalleryItems((currentItems) => [
        data,
        ...currentItems
      ]);

      setTitle("");
      setDescription("");
      setMedia(null);

      setUploadMessage("Gallery item uploaded successfully.");
    } catch (err) {
        setUploadMessage(err.message);
    } finally {
        setUploading(false);
    }
  }


  async function handleToggle(itemId) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/gallery/${itemId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setUploadMessage(
          "Admin session expired. Please sign in again."
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.err || "Unable to update gallery item."
        );
      }

      setGalleryItems((currentItems) =>
        currentItems.map((item) =>
          item.id === data.id ? data : item
        )
      );
    } catch (err) {
      setUploadMessage(err.message);
    }
  }


  async function handleDelete(itemId) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this gallery item?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/gallery/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setUploadMessage(
          "Admin session expired. Please sign in again."
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.err || "Unable to delete gallery item."
        );
      }

      setGalleryItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId)
      );

      setUploadMessage(data.message);
    } catch (err) {
      setUploadMessage(err.message);
    }
  }



  return (
    <div className="gallery-page">
      <section className="gallery-header">
        <h2 className="gallery-title">Gallery</h2>
      </section>

      {isAdminLoggedIn && (
        <section className="gallery-admin-panel">
          <div className="gallery-admin-header">
            <h3>Admin Gallery Controls</h3>
          </div>

          <form
            className="gallery-upload-form"
            onSubmit={handleUpload}
          >
            <div className="gallery-form-group">
              <label htmlFor="gallery-title-input">
                Title
              </label>

              <input
                id="gallery-title-input"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
                required
              />
            </div>

            <div className="gallery-form-group">
              <label htmlFor="gallery-description-input">
                Description
              </label>

              <textarea
                id="gallery-description-input"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </div>

            <div className="gallery-form-group">
              <label htmlFor="gallery-media-input">
                Image or Video
              </label>

              <input
                id="gallery-media-input"
                type="file"
                accept="image/*,video/*"
                onChange={(event) => {
                  setMedia(event.target.files[0]);
                }}
                required
              />
            </div>

            <button
              className="gallery-upload-button"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Media"}
            </button>
          </form>

          {uploadMessage && (
            <p className="gallery-upload-message">
              {uploadMessage}
            </p>
          )}
        </section>
      )}

      {error && (
        <p className="gallery-status gallery-error">
          {error}
        </p>
      )}

      {galleryItems.length === 0 && !error && (
        <p className="gallery-status">
          No gallery items available.
        </p>
      )}

      <section className="gallery-grid">
        {galleryItems.map((item) => (
          <article
            key={item.id}
            className="gallery-card"
          >
            <div className="gallery-card-media">
              {item.media_type === "video" ? (
                <video
                  className="gallery-media gallery-video"
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  preload="metadata"
                >
                  <source
                    src={item.media_url}
                    type="video/mp4"
                  />
                  Your browser does not support video.
                </video>
              ) : (
                <img
                  className="gallery-media gallery-image"
                  src={item.media_url}
                  alt={item.title}
                />
              )}
            </div>

            <div className="gallery-card-content">
              <h3 className="gallery-card-title">
                {item.title}
              </h3>

              {item.description && (
                <p className="gallery-card-description">
                  {item.description}
                </p>
              )}

              {isAdminLoggedIn && (
                <div className="gallery-card-admin">
                  <p className="gallery-visibility">
                    Visibility:{" "}
                    {item.is_active ? "Visible" : "Hidden"}
                  </p>

                  <div className="gallery-card-actions">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                    >
                      {item.is_active ? "Hide" : "Show"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Gallery;