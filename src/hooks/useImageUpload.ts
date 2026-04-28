import { useState } from "react";

const MAX_DIMENSION = 8000;

export type FileInfo = {
  name: string;
  size: number;
};

export type ImageUploadState = {
  image: HTMLImageElement | null;
  fileInfo: FileInfo | null;
  error: string | null;
  handleFile: (file: File) => Promise<void>;
  clearImage: () => void;
};

export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => {
        setError("Failed to read file.");
        resolve();
      };
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onerror = () => {
          setError("Failed to load image.");
          resolve();
        };
        img.onload = () => {
          if (
            img.naturalWidth > MAX_DIMENSION ||
            img.naturalHeight > MAX_DIMENSION
          ) {
            setError(
              `Image too large. Maximum dimension is 8,000px. (Current: ${img.naturalWidth}×${img.naturalHeight}px)`,
            );
            setImage(null);
            setFileInfo(null);
          } else {
            setError(null);
            setImage(img);
            setFileInfo({ name: file.name, size: file.size });
          }
          resolve();
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  };

  const clearImage = () => {
    setImage(null);
    setFileInfo(null);
    setError(null);
  };

  return { image, fileInfo, error, handleFile, clearImage };
}
