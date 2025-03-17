import React, { useEffect, useState } from "react";
import { api, Photo } from "../services/api";

export const PhotoGrid: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const data = await api.getPhotos();
    setPhotos(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      await api.uploadPhoto(selectedFile, description);
      loadPhotos();
      setSelectedFile(null);
      setDescription("");
    }
  };

  return (
    <div>
      <h2>Photos</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Upload</button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {photos.map((photo) => (
          <div key={photo.id}>
            <img
              src={`${API_BASE_URL}/photos/${photo.id}`}
              alt={photo.description || photo.filename}
              style={{ width: "100%", height: "auto" }}
            />
            <p>{photo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
