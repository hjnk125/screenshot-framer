import { useState } from "react";

const MAX_DIMENSION = 8000;

export type FileInfo = {
  name: string;
  size: number;
};

export type ImageUploadState = {
  image: HTMLImageElement | null;
  previewUrl: string | null;
  fileInfo: FileInfo | null;
  error: string | null;
  handleFile: (file: File) => Promise<void>;
  clearImage: () => void;
};

export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError("Failed to load image.");
        resolve();
      };
      img.onload = () => {
        if (
          img.naturalWidth > MAX_DIMENSION ||
          img.naturalHeight > MAX_DIMENSION
        ) {
          URL.revokeObjectURL(objectUrl);
          setError(
            `Image too large. Maximum dimension is 8,000px. (Current: ${img.naturalWidth}×${img.naturalHeight}px)`,
          );
          setImage(null);
          setPreviewUrl(null);
          setFileInfo(null);
        } else {
          setError(null);
          setImage(img);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
          setFileInfo({ name: file.name, size: file.size });
        }
        resolve();
      };
      img.src = objectUrl;
    });
  };

  const clearImage = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImage(null);
    setFileInfo(null);
    setError(null);
  };

  return { image, previewUrl, fileInfo, error, handleFile, clearImage };
}
