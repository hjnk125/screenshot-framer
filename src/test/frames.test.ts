import { FRAMES, getFrameById } from "../data/frames";

describe("FRAMES 메타데이터", () => {
  it("프레임이 하나 이상 정의되어 있다", () => {
    expect(FRAMES.length).toBeGreaterThan(0);
  });

  it("디바이스 프레임에 screenArea가 정의되어 있다", () => {
    FRAMES.filter((f) => f.category === "device").forEach((f) => {
      expect(f.screenArea.width).toBeGreaterThan(0);
      expect(f.screenArea.height).toBeGreaterThan(0);
    });
  });

  it("브라우저 프레임에 browserMeta가 정의되어 있다", () => {
    FRAMES.filter((f) => f.category === "browser").forEach((f) => {
      expect(f.browserMeta).toBeDefined();
      expect(f.browserMeta?.urlBar).toBeDefined();
    });
  });

  it("디바이스 프레임 aspectRatio가 screenArea와 일치한다", () => {
    FRAMES.filter((f) => f.category === "device").forEach((f) => {
      const computed = f.screenArea.width / f.screenArea.height;
      expect(f.aspectRatio).toBeCloseTo(computed, 2);
    });
  });

  it("getFrameById가 올바른 프레임을 반환한다", () => {
    const frame = getFrameById("macbook-pro-16");
    expect(frame?.label).toBe("MacBook Pro 16");
  });

  it("getFrameById가 없는 id에 undefined를 반환한다", () => {
    expect(getFrameById("nonexistent")).toBeUndefined();
  });
});

describe("App Store 프레임", () => {
  const appstoreFrames = FRAMES.filter((f) => f.category === "appstore");

  it("appstore 프레임이 6개 정의되어 있다", () => {
    expect(appstoreFrames).toHaveLength(6);
  });

  it("모든 appstore 프레임에 appstoreMeta가 정의되어 있다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.appstoreMeta).toBeDefined();
      expect(f.appstoreMeta?.canvasWidth).toBe(1290);
      expect(f.appstoreMeta?.canvasHeight).toBe(2796);
    });
  });

  it("모든 appstore 프레임의 aspectRatio가 1290/2796이다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.aspectRatio).toBeCloseTo(1290 / 2796, 4);
    });
  });

  it("appstore 프레임의 screenArea width/height가 양수이다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.screenArea.width).toBeGreaterThan(0);
      expect(f.screenArea.height).toBeGreaterThan(0);
    });
  });

  it("틸트 프레임의 rotation 방향과 각도가 정확하다", () => {
    const expectedRotations: Record<string, number> = {
      "appstore-67-tilt-a1": -30,
      "appstore-67-tilt-a2": -30,
      "appstore-67-tilt-b1": 30,
      "appstore-67-tilt-b2": 30,
    };
    Object.entries(expectedRotations).forEach(([id, rotation]) => {
      const f = FRAMES.find((fr) => fr.id === id);
      expect(f?.screenArea.rotation).toBe(rotation);
    });
  });

  it("정면 프레임(full, offset)은 rotation이 없다", () => {
    ["appstore-67-full", "appstore-67-offset"].forEach((id) => {
      const f = FRAMES.find((fr) => fr.id === id);
      expect(f?.screenArea.rotation ?? 0).toBe(0);
    });
  });

  it("모든 appstore 프레임의 assetPath가 올바른 경로 형식이다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.assetPath).toMatch(/^\/frames\/appstore\//);
    });
  });

  it("모든 appstore 프레임에 textConfig가 정의되어 있다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.appstoreMeta?.textConfig).toBeDefined();
      expect(f.appstoreMeta?.textConfig?.align).toMatch(/^(left|center|right)$/);
      expect(typeof f.appstoreMeta?.textConfig?.y).toBe("number");
    });
  });

  it("appstore 프레임 textConfig 정렬이 올바르다", () => {
    const expected: Record<string, "left" | "center" | "right"> = {
      "appstore-67-full": "center",
      "appstore-67-offset": "center",
      "appstore-67-tilt-a1": "left",
      "appstore-67-tilt-a2": "right",
      "appstore-67-tilt-b1": "left",
      "appstore-67-tilt-b2": "right",
    };
    appstoreFrames.forEach((f) => {
      expect(f.appstoreMeta?.textConfig?.align).toBe(expected[f.id]);
    });
  });
});
