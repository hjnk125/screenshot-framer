import { useState } from "react";
import type { AppStoreTextState } from "../types/frame";

export type UseAppStoreTextReturn = AppStoreTextState & {
  setTitle: (v: string) => void;
  setTitleColor: (v: string) => void;
  setDescription: (v: string) => void;
  setDescriptionColor: (v: string) => void;
};

export function useAppStoreText(): UseAppStoreTextReturn {
  const [title, setTitle] = useState("");
  const [titleColor, setTitleColor] = useState("#000000");
  const [description, setDescription] = useState("");
  const [descriptionColor, setDescriptionColor] = useState("#000000");

  return {
    title,
    setTitle,
    titleColor,
    setTitleColor,
    description,
    setDescription,
    descriptionColor,
    setDescriptionColor,
  };
}
