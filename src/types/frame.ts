export type FrameCategory = "device" | "browser";

export type TabArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  faviconX: number; // favicon left edge relative to tab x
  faviconY: number; // favicon top edge relative to tab y
  faviconSize: number;
  textOffsetX: number; // text start relative to tab x (after favicon)
  textOffsetY?: number; // vertical nudge from center (positive = down)
};

export type BrowserFrameMeta = {
  contentBg: string;
  contentRadius: number;
  urlBar: {
    x: number;
    y: number;
    width: number;
    height: number;
    bgColor: string;
    textColor: string;
    fontSize: number;
    align: "left" | "center";
  };
  tabArea?: TabArea;
  defaultFaviconPath?: string; // used when no user favicon uploaded
};

export type BrowserState = {
  url: string;
  title: string;
  favicon: HTMLImageElement | null;
};

export type ScreenArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  roundCorners: "TOP" | "BOTTOM" | "ALL";
};

export type Frame = {
  id: string;
  label: string;
  category: FrameCategory;
  assetPath: string;
  assetPath2x?: string; // optional @2x asset for high-res exports
  screenArea: ScreenArea; // browser frames: height=0 (dynamic), y=toolbarHeight
  aspectRatio: number;
  browserMeta?: BrowserFrameMeta;
  // used when screenshot.naturalWidth < 800 (browser frames only)
  shortToolbar?: {
    assetPath: string;
    browserMeta: BrowserFrameMeta;
  };
};

export type ShadowConfig = {
  enabled: boolean;
  opacity: number; // 0-100
};

export type ImageTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ExportScale = number;

export type DeviceBgType = "transparent" | "white" | "black" | "image";

export type DeviceBgConfig = {
  type: DeviceBgType;
  image: HTMLImageElement | null;
};
