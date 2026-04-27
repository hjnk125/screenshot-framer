# SEO 강화 설계 — Screenshot Framer

## 목표

- 구글 검색 노출 (한/영 키워드)
- SNS 공유 시 링크 미리보기 (OG / Twitter Card)

## 대상 URL

`https://screenshot-framer.vercel.app/`

## 변경 파일 목록

| 파일 | 작업 |
|------|------|
| `index.html` | 메타태그, OG, Twitter Card, JSON-LD 추가 |
| `public/og-image.png` | 이미 추가됨 (1200×630) |
| `public/sitemap.xml` | 신규 생성 |
| `public/robots.txt` | 신규 생성 |

## index.html 메타태그 상세

### 기본

```html
<title>Screenshot Framer — Device & Browser Frame Tool</title>
<meta name="description" content="스크린샷을 iPhone, MacBook, Chrome, Safari 프레임으로 감싸 고품질 PNG로 export. Wrap screenshots in device or browser frames and export as high-quality PNG." />
<link rel="canonical" href="https://screenshot-framer.vercel.app/" />
```

### Open Graph

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://screenshot-framer.vercel.app/" />
<meta property="og:title" content="Screenshot Framer — Device & Browser Frame Tool" />
<meta property="og:description" content="스크린샷을 iPhone, MacBook, Chrome, Safari 프레임으로 감싸 고품질 PNG로 export. Wrap screenshots in device or browser frames and export as high-quality PNG." />
<meta property="og:image" content="https://screenshot-framer.vercel.app/og-image.png" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:locale:alternate" content="en_US" />
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Screenshot Framer — Device & Browser Frame Tool" />
<meta name="twitter:description" content="스크린샷을 iPhone, MacBook, Chrome, Safari 프레임으로 감싸 고품질 PNG로 export." />
<meta name="twitter:image" content="https://screenshot-framer.vercel.app/og-image.png" />
```

### JSON-LD (WebApplication)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Screenshot Framer",
  "url": "https://screenshot-framer.vercel.app/",
  "description": "Wrap screenshots in device or browser frames and export as high-quality PNG.",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

## sitemap.xml

단일 URL, `changefreq: monthly`, `priority: 1.0`.

## robots.txt

전체 허용, sitemap URL 명시.

## 제외 항목

- SSG/SSR 도입 — 원페이지 툴 앱이라 ROI 낮음
- 페이지별 동적 메타태그 — 라우트 없음
