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
          ? "http://localhost:3000/api/gallery/admin/all"
          : "http://localhost:3000/api/gallery";

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
        "http://localhost:3000/api/gallery",
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
        `http://localhost:3000/api/gallery/${itemId}`,
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
        `http://localhost:3000/api/gallery/${itemId}`,
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
    <div>
      <h2>Gallery</h2>

      {isAdminLoggedIn && (
        <div>
          <h3>Admin Gallery Controls</h3>

          <form onSubmit={handleUpload}>
            <label>Title: </label>
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              required
            />

            <label>Description: </label>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />

            <label>Image or Video: </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(event) => {
                setMedia(event.target.files[0]);
              }}
              required
            />

            <button
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Media"}
            </button>
          </form>

          {uploadMessage && <p>{uploadMessage}</p>}
        </div>
      )}

      {error && <p>{error}</p>}

      {galleryItems.length === 0 && !error && (
        <p>No gallery items available.</p>
      )}

      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="gallery-card"
          >
            <h3>{item.title}</h3>

            {item.media_type === "video" ? (
              <video controls>
                <source
                  src={item.media_url}
                  type="video/mp4"
                />
                Your browser does not support video.
              </video>
            ) : (
              <img
                src={item.media_url}
                alt={item.title}
              />
            )}

            {item.description && (
              <p>{item.description}</p>
            )}

            <br />
            {isAdminLoggedIn && (
              <div>
                <p>
                  Visibility: {item.is_active ? "Visible" : "Hidden"}
                </p>

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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;