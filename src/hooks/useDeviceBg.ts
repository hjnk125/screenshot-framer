import { useCallback, useState } from "react";
import type { DeviceBgConfig, DeviceBgType } from "../types/frame";

export type UseDeviceBgReturn = {
  deviceBg: DeviceBgConfig;
  setType: (type: DeviceBgType) => void;
  setColor: (hex: string) => void;
  handleImage: (file: File) => void;
  clearImage: () => void;
};

const DEFAULT: DeviceBgConfig = { type: "transparent", image: null };

export function useDeviceBg(): UseDeviceBgReturn {
  const [deviceBg, setDeviceBg] = useState<DeviceBgConfig>(DEFAULT);

  const setType = useCallback((type: DeviceBgType) => {
    setDeviceBg((prev) => ({ ...prev, type }));
  }, []);

  const setColor = useCallback((hex: string) => {
    setDeviceBg((prev) => ({ ...prev, type: "color", color: hex }));
  }, []);

  const handleImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => setDeviceBg((prev) => ({ ...prev, type: "image", image: img }));
      img.onerror = () => setDeviceBg(DEFAULT);
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(
    () => setDeviceBg((prev) => ({ ...prev, type: "transparent", image: null })),
    []
  );

  return { deviceBg, setType, setColor, handleImage, clearImage };
}
