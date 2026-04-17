# 📜 PaperSignals | Stock Market Archives

A high-performance, professional stock market analyzer for the Indian Market (NSE & BSE) built with a unique aesthetic. This project bridges the gap between historical aesthetics and modern technical analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0-ff69b4?style=for-the-badge&logo=framer)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

---

## Key Features

### The Aesthetic
- **Parchment UI:** Custom-themed off-white textures, rough-cut paper edges (`clip-path`), and noise overlays.
- **Ink Typography:** Sophisticated pairing of **EB Garamond** (Serif) for headings and **JetBrains Mono** for financial data.
- **Physical Animations:** Staggered card entries that mimic papers being dealt onto a table, and 3D flipping index cards.

### Professional Analysis
- **Advanced Charting:** Hand-drawn SVG line charts and **Candlestick** views with OHLC data.
- **Technical Indicators:** "Sketched" implementations of **Moving Averages (20-day)**, **Bollinger Bands**, and **RSI (14)**.
- **Live Fuzzy Search:** Debounced, live-updating search that prioritizes Indian exchange shorthands (e.g., "REL" → "Reliance").
- **Deep Specimen Investigation:** A dedicated "Dive Mode" that focuses exclusively on technical price action and indicators.

### Market Coverage
- **NSE/BSE Support:** Real-time quotes and historical data for all major Indian equities.
- **Market Indices:** Interactive NIFTY 50 and SENSEX cards with real-time tracking.
- **Sector & Industry Archives:** Automatic classification of stocks into sectors (Technology, Energy, Finance, etc.) with dedicated archive pages.
- **Recent Dispatches:** Integrated news reports for every stock specimen.

---

## Technical Architecture

### 1. Hybrid Rendering Strategy
- **Dynamic SSR:** Utilizes Next.js `searchParams` to ensure data freshness on every request while maintaining SEO metadata.
- **Streaming with Suspense:** Heavy API calls (Indices, Trending) are wrapped in Suspense boundaries to allow the layout to render instantly while data "streams" in.
- **Client-Side Interactivity:** Framer Motion and chart tooltips are handled via highly optimized Client Components.

### 2. Stateless Architecture (URL as State)
- The entire application state (Current search, Chart timeframe, Active indicators, View mode) is stored in the **URL query string**.
- **Benefits:** Deep-linkable analysis, full browser history support, and simplified state management without Redux/Zustand.

### 3. Data Integrity
- **Yahoo Finance Integration:** Built on `yahoo-finance2` with custom error handling to manage unofficial API volatility.
- **Resilient Fallbacks:** Implemented "Market Leader" fallbacks to ensure the dashboard remains populated even during API downtime.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

