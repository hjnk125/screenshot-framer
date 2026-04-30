import { useCallback, useState } from "react";
import type { BackgroundConfig, BackgroundType } from "../types/frame";

export type UseBackgroundReturn = {
  background: BackgroundConfig;
  setType: (type: BackgroundType) => void;
  setColor: (hex: string) => void;
  handleImage: (file: File) => void;
  clearImage: () => void;
};

const DEFAULT: BackgroundConfig = { type: "transparent", image: null };

export function useBackground(): UseBackgroundReturn {
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT);

  const setType = useCallback((type: BackgroundType) => {
    // image 필드를 유지하는 것은 의도적: 다른 타입으로 전환 후 다시 "image"를 누르면
    // 재업로드 없이 이전 이미지를 복원할 수 있어야 한다 (Restore image UX).
    setBackground((prev) => ({ ...prev, type }));
  }, []);

  const setColor = useCallback((hex: string) => {
    setBackground((prev) => ({ ...prev, type: "color", color: hex }));
  }, []);

  const handleImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => setBackground((prev) => ({ ...prev, type: "image", image: img }));
      img.onerror = () => setBackground(DEFAULT);
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(
    () => setBackground((prev) => ({ ...prev, type: "transparent", image: null })),
    []
  );

  return { background, setType, setColor, handleImage, clearImage };
}
