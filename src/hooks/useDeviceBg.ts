import { useState } from "react";
import type { DeviceBgConfig, DeviceBgType } from "../types/frame";

export type UseDeviceBgReturn = {
  deviceBg: DeviceBgConfig;
  setType: (type: DeviceBgType) => void;
  handleImage: (file: File) => void;
  clearImage: () => void;
};

const DEFAULT: DeviceBgConfig = { type: "transparent", image: null };

export function useDeviceBg(): UseDeviceBgReturn {
  const [deviceBg, setDeviceBg] = useState<DeviceBgConfig>(DEFAULT);

  const setType = (type: DeviceBgType) => {
    setDeviceBg((prev) => ({ ...prev, type, image: type === "image" ? prev.image : null }));
  };

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () =>
        setDeviceBg({ type: "image", image: img });
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => setDeviceBg(DEFAULT);

  return { deviceBg, setType, handleImage, clearImage };
}
