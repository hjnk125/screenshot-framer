import { useState } from "react";

const MAX_DIMENSION = 8000;

export type FileInfo = {
  name: string;
  size: number;
};

export type ImageUploadState = {
  image: HTMLImageElement | null;
  dataUrl: string | null;
  fileInfo: FileInfo | null;
  error: string | null;
  handleFile: (file: File) => Promise<void>;
  clearImage: () => void;
};

export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => {
        setError("파일을 읽는 데 실패했습니다.");
        resolve();
      };
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onerror = () => {
          setError("이미지를 불러오는 데 실패했습니다.");
          resolve();
        };
        img.onload = () => {
          if (
            img.naturalWidth > MAX_DIMENSION ||
            img.naturalHeight > MAX_DIMENSION
          ) {
            setError(
              `이미지 크기가 너무 큽니다. 한 변이 8,000px를 초과할 수 없습니다. (현재: ${img.naturalWidth}×${img.naturalHeight}px)`,
            );
            setImage(null);
            setDataUrl(null);
            setFileInfo(null);
          } else {
            setError(null);
            setImage(img);
            setDataUrl(url);
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
    setDataUrl(null);
    setFileInfo(null);
    setError(null);
  };

  return { image, dataUrl, fileInfo, error, handleFile, clearImage };
}
