import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [formGalleryImages, setFormGalleryImages] = useState([]);
  const [removedGalleryImageIds, setRemovedGalleryImageIds] = useState([]);

  const handleImageChange = useCallback((setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ file, preview: URL.createObjectURL(file), isExisting: false });
    e.target.value = "";
  }, []);

  const handleGalleryAdd = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setFormGalleryImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  }, []);

  const removeGalleryImage = useCallback((idx) => {
    setFormGalleryImages((prev) => {
      const img = prev[idx];
      if (img.isExisting) {
        // Prefer numeric DB id; fallback to full URL (do NOT strip to pathname)
        const idToRemove = img.id ?? img.preview ?? img.url;
        if (idToRemove != null) {
          setRemovedGalleryImageIds((prevIds) => [...prevIds, idToRemove]);
        }
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const resetGallery = useCallback((gallery = []) => {
    setFormGalleryImages(
      gallery.map((img) => ({
        preview: img.url,
        id: img.id,
        isExisting: true,
        alt: img.altText || "Gallery Image",
        file: null,
      }))
    );
    setRemovedGalleryImageIds([]);
  }, []);

  const appendGalleryToFormData = useCallback((formData) => {
    formGalleryImages.forEach((img) => {
      if (img.file) {
        formData.append("gallery", img.file);
      }
    });
    if (removedGalleryImageIds.length > 0) {
      formData.append("removedGalleryImageIds", JSON.stringify(removedGalleryImageIds));
    }
  }, [formGalleryImages, removedGalleryImageIds]);

  return {
    formGalleryImages,
    setFormGalleryImages,
    removedGalleryImageIds,
    setRemovedGalleryImageIds,
    handleImageChange,
    handleGalleryAdd,
    removeGalleryImage,
    resetGallery,
    appendGalleryToFormData
  };
};
