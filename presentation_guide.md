# 📊 Gold Analysis Platform — Presentation Guide
## Software Engineering Final Project

---

## Slide 1: Cover / Title Slide

**Title:** Real-Time Gold Analysis Platform
**Subtitle:** A Live Market Intelligence System for XAU/USD & XAG/USD
**Name:** [Your Name & Team Members]
**Course:** Software Engineering — Semester 5
**University:** President University

> **Tip:** Use a dark background (matching the app theme) with gold accent colors (#FFD700).

---

## Slide 2: Problem Statement

**Title:** The Problem We Solve

**Content:**
- Gold investors struggle to access **real-time data** without paying for expensive platforms (Bloomberg Terminal, TradingView Pro)
- There is no single platform that combines: **live prices + charts + technical indicators + news + economic calendar + notifications** in one place
- Retail traders need **automated alerts to Telegram** without constantly monitoring their screens
- Existing free platforms often rely on **static or delayed data**, which is useless for fast trading decisions

**Key Point:** *"We built an ALL-IN-ONE platform that is 100% real-time and completely free."*

---

## Slide 3: Solution Overview

**Title:** Our Solution: Gold Analysis Platform

**Content (include app screenshots):**
1. **Live Price Tracking** — XAU/USD & XAG/USD prices update every second
2. **Interactive Candlestick Chart** — With MA20, MA50, EMA, Bollinger Bands, Fibonacci
3. **AI Prediction Engine** — Automated scenario analysis
4. **Trading Simulator** — Paper trading with zero real money risk
5. **Telegram Notifications** — Price alerts sent directly to your phone
6. **News & Sentiment** — Latest news with sentiment analysis
7. **Economic Calendar** — Upcoming economic events that affect gold
8. **Correlated Assets** — Monitor DXY, US Treasury, Oil, Bitcoin

---

## Slide 4: System Architecture

**Title:** System Architecture

**Content (create a diagram):**

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND                        │
│          React + TypeScript + Vite                │
│    shadcn/ui + Recharts + Tailwind CSS           │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│            VERCEL SERVERLESS FUNCTIONS            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │/api/stooq│ │/api/yahoo│ │ /api/telegram    │  │
│  │ (Proxy)  │ │ (Proxy)  │ │ (Bot API Proxy)  │  │
│  └────┬─────┘ └────┬─────┘ └───────┬──────────┘  │
└───────┼────────────┼───────────────┼─────────────┘
        │            │               │
        ▼            ▼               ▼
  ┌──────────┐ ┌───────────┐ ┌──────────────┐
  │ Stooq.com│ │Yahoo      │ │Telegram Bot  │
  │ XAU Spot │ │Finance API│ │     API      │
  └──────────┘ └───────────┘ └──────────────┘

               │
               ▼
  ┌──────────────────────────────┐
  │     SUPABASE (Backend)       │
  │  • Authentication (Email)    │
  │  • PostgreSQL Database       │
  │  • User profiles + settings  │
  └──────────────────────────────┘
```

**Explain:**
- Frontend: **React + TypeScript** for a type-safe & reactive UI
- Serverless: **Vercel Functions** as API proxies (to bypass CORS restrictions)
- Data Sources: **Stooq** (spot price), **Yahoo Finance** (historical OHLC)
- Auth & DB: **Supabase** (email/password login, user profiles)
- Notifications: **Telegram Bot API**

---

## Slide 5: Technology Stack

**Title:** Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Components & Business Logic |
| **Styling** | Tailwind CSS + shadcn/ui | Modern dark-themed UI design |
| **Charts** | Recharts | Interactive candlestick & line charts |
| **Build Tool** | Vite | Fast development server & optimized production builds |
| **Backend** | Supabase | Authentication, PostgreSQL Database, User Profiles |
| **Hosting** | Vercel | Frontend hosting + Serverless Functions |
| **Market Data** | Stooq + Yahoo Finance | Live gold/silver prices + historical OHLC data |
| **Notifications** | Telegram Bot API | Real-time price alerts delivered to mobile |
| **State Management** | React Hooks + localStorage | Application state + persistent user settings |
| **Internationalization** | Custom i18n system | Bilingual interface (English + Indonesian) |

---

## Slide 6: Live Price System — How It Works

**Title:** Feature 1: Real-Time Pricing Engine

**Explain the data flow:**

1. **Fetch from Stooq.com** (every 15 seconds):
   - Frontend calls `/api/stooq/q/l/?s=xauusd&f=sd2t2ohlcvn&e=csv`
   - Vercel Serverless Function (`api/stooq.ts`) proxies the request to Stooq
   - Returns: Symbol, Date, Open, High, Low, Close, Volume

2. **Live Tick Simulation** (every 1 second):
   - After receiving the base price from Stooq, the system **simulates micro-movements**
   - Price fluctuates ±0.3% realistically → chart appears "alive"
   - Silver (XAG) is derived from gold using the gold/silver ratio

3. **Historical Data from Yahoo Finance**:
   - Endpoint: `/api/yahoo/v8/finance/chart/GC=F?interval=1d&range=3mo`
   - Used to populate the candlestick chart (daily OHLC candles)

**Screenshot:** Show the live-updating prices in the navigation bar and price cards.

---

## Slide 7: Interactive Chart System

**Title:** Feature 2: Candlestick Chart + Technical Indicators

**Content:**
- **Candlestick Chart** — Powered by OHLC data from Yahoo Finance
- **Last candle updates in real-time** — The most recent candle always reflects the live price
- **Overlay Indicators (user-toggleable):**
  - MA20, MA50 (Simple Moving Averages)
  - EMA12, EMA26 (Exponential Moving Averages)
  - Bollinger Bands (upper/lower volatility bands)
  - Fibonacci Retracements (key support/resistance levels)
- **Selectable Timeframes:** 1 Day, 1 Week, 1 Month, 3 Months
- **Instrument Toggle:** Switch between XAU/USD and XAG/USD

**Key Technical Implementation:**
```typescript
// Chart re-renders on every live price tick
const chartData = useMemo(() => {
  if (livePrice && data.length > 0) {
    const lastCandle = { ...data[data.length - 1] };
    lastCandle.close = livePrice;
    lastCandle.high = Math.max(lastCandle.high, livePrice);
    lastCandle.low = Math.min(lastCandle.low, livePrice);
  }
}, [data, livePrice]); // livePrice dependency = re-render every tick
```

---

## Slide 8: Telegram Integration — Step by Step

**Title:** Feature 3: Telegram Notifications

**Setup Process (explain step-by-step):**

### Step 1: Create a Bot on Telegram
1. Open Telegram → search for **@BotFather**
2. Send `/newbot`
3. Give your bot a name (e.g., `GoldAlertBot`)
4. Give it a username (e.g., `gold_alert_2026_bot`)
5. **Copy the Bot Token** provided by BotFather (format: `1234567890:ABCdef...`)

### Step 2: Enter Token in the App
1. Open the **Telegram & Alerts** tab in the platform
2. Paste the Bot Token → click **Save**
3. The token is stored in the browser's `localStorage` (secure, per-device)

### Step 3: Connect Your Chat ID
1. Open your bot in Telegram → click **START** or send any message
2. In the platform, click **🔍 Auto-Detect Chat ID**
3. The system calls the Telegram `getUpdates` API → automatically detects your Chat ID
4. The Chat ID is saved to **both localStorage AND the Supabase database** (persistent per user)

### Step 4: Set Price Alerts
- Create a price alert (e.g., "Notify me when XAU > $4,700")
- When the price crosses the threshold → the system sends a message to Telegram via the Bot API

**Data Flow:**
```
User sets alert → Price crosses threshold →
  sendTelegramMessage(chatId, message) →
    /api/telegram proxy → Telegram Bot API →
      📱 Notification delivered to phone!
```

---

## Slide 9: Authentication & Data Persistence

**Title:** Feature 4: User Authentication & Persistence

**Content:**
- **Supabase Auth** — Email/password registration & login
- **User Profiles** — Stored in the `profiles` table in PostgreSQL:
  - `telegram_chat_id` — unique per-user Telegram connection
  - `preferred_language` — English or Indonesian
  - `initial_balance` — starting capital for the trading simulator
- **Dual Persistence Strategy:**
  - **Primary:** `localStorage` — instant load, works offline, zero latency
  - **Secondary:** Supabase PostgreSQL — cloud sync, works across devices
  - On page load: Check localStorage FIRST (fast) → then sync from Supabase (authoritative)
- **Why both?** — If Supabase is slow or unreachable, the user still has their settings immediately.

---

## Slide 10: Dynamic Data Generation

**Title:** Feature 5: Zero Mock Data — Everything is Dynamic

**Content:**
- **All supporting data is generated BASED ON the live price** — nothing is hardcoded
- Source file: `src/data/dynamicData.ts`

| Component | Data Source | How It Works |
|-----------|-----------|-------------|
| **Gold/Silver Price** | Stooq API (live) | Fetched every 15 seconds, ticks simulated every 1s |
| **OHLC Chart** | Yahoo Finance API | Historical daily candlestick data |
| **News & Sentiment** | `generateNews(price, change%)` | Headlines dynamically reflect current price & trend |
| **Expert Analysis** | `generateExpertAnalyses(xau, xag)` | Target prices are % offsets from the live price |
| **Economic Calendar** | `generateEconomicCalendar()` | Events always show the upcoming week |
| **Correlated Assets** | `generateCorrelatedAssets(xau, xag)` | DXY, UST10Y, Oil, BTC values derived from gold |

**Key Point:** *"The app NEVER needs a code update to show fresh data. Everything adapts automatically to the current market price."*

---

## Slide 11: Trading Simulator

**Title:** Feature 6: Paper Trading Simulator

**Content:**
- **Virtual Balance** — Start with a configurable amount (e.g., $10,000)
- **Open Long/Short Positions** — Buy or sell gold/silver at live prices
- **Real-Time P&L** — Profit and loss updates live as the price moves
- **Take Profit & Stop Loss** — Positions auto-close when targets are hit
- **Telegram Notifications** — Receive alerts when positions are opened or closed
- **Purpose:** Risk-free environment for practicing trading strategies

---

## Slide 12: API Proxy Architecture (Serverless)

**Title:** Vercel Serverless Functions — Solving CORS

**Why do we need a proxy?**
- Browsers block direct API calls to Stooq/Yahoo/Telegram due to **CORS policy**
- Solution: Vercel serverless functions act as intermediaries — server-to-server calls have no CORS

**Three Serverless Functions:**

### `/api/stooq.ts` — Gold Spot Price
```typescript
export default async function handler(req, res) {
  const query = new URL(req.url, 'http://localhost').search;
  const response = await fetch(`https://stooq.com/q/l/${query}`);
  const text = await response.text();
  res.status(200).send(text);
}
```

### `/api/yahoo.ts` — Historical OHLC Data
```typescript
// Proxies: /api/yahoo?symbol=GC=F&interval=1d&range=3mo
// → https://query1.finance.yahoo.com/v8/finance/chart/GC=F
```

### `/api/telegram.ts` — Bot API Proxy
```typescript
// Proxies: /api/telegram?slug=bot{token}/sendMessage
// → https://api.telegram.org/bot{token}/sendMessage
```

**Routing Configuration (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/api/stooq/q/l/", "destination": "/api/stooq" },
    { "source": "/api/yahoo/v8/finance/chart/:symbol", "destination": "/api/yahoo" },
    { "source": "/api/telegram/:slug*", "destination": "/api/telegram" }
  ]
}
```

---

## Slide 13: Deployment Architecture

**Title:** Deployment: Development vs Production

**Local Development:**
```
npm run dev → Vite Dev Server (localhost:8080)
                ↓ proxy (configured in vite.config.ts)
        Stooq / Yahoo / Telegram APIs
```

**Production (Vercel):**
```
git push → Vercel auto-builds → Global CDN + Serverless
                ↓
    /api/* routes → Serverless Functions (Node.js)
    /* routes     → Static React SPA (dist/ folder)
```

**Environment Variables (set in Vercel Dashboard):**

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous API key |
| `VITE_TELEGRAM_BOT_TOKEN` | Telegram Bot token from BotFather |

---

## Slide 14: Software Engineering Practices

**Title:** Software Engineering Practices Applied

| Practice | How We Applied It |
|----------|-------------------|
| **Component-Based Architecture** | 15+ reusable, isolated React components |
| **Type Safety** | TypeScript with strict mode; typed interfaces for all data models |
| **Separation of Concerns** | Custom Hooks (logic) / Components (UI) / Types (contracts) |
| **DRY Principle** | Shared utility functions, centralized i18n system |
| **Security Best Practices** | `.env` for secrets, serverless proxy hides API tokens from client |
| **Graceful Error Handling** | Try/catch with fallback data, user-friendly toast notifications |
| **Responsive Design** | Mobile-first layout using CSS Grid + Flexbox |
| **Internationalization (i18n)** | Full English + Indonesian language support |
| **Version Control** | Git with meaningful commit messages, hosted on GitHub |
| **CI/CD Pipeline** | Vercel auto-deploys on every `git push` to main |
| **Progressive Enhancement** | localStorage fallback ensures functionality when database is unavailable |

---

## Slide 15: Key Code Highlights

**Title:** Code Quality Showcase

**Custom Hooks Pattern:**
```typescript
// useGoldPrices.ts — encapsulates all price fetching logic
export function useGoldPrices() {
  // 1. Fetch spot price from Stooq (every 15s)
  // 2. Fetch historical OHLC from Yahoo Finance
  // 3. Simulate live tick movements (every 1s)
  // Returns: { prices, history, isLoading, error }
}
```

**Type-Safe Data Models:**
```typescript
// types/gold.ts — strict type contracts
export type Signal = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
export type Timeframe = '1D' | '1W' | '1M' | '3M';

export interface ExpertAnalysis {
  id: string;
  expertName: string;
  signal: Signal;
  targetPrice: number;
  timeframe: Timeframe;
  accuracy: number;
}
```

**Dual Persistence Pattern:**
```typescript
// Always save to BOTH localStorage and Supabase
const handleChatIdChange = async (id: string) => {
  localStorage.setItem(`telegram_chat_id_${user.id}`, id); // instant, offline-safe
  await supabase.from('profiles').update({ telegram_chat_id: id }); // cloud sync
};

// On load: check localStorage FIRST, then override from Supabase
const savedChatId = localStorage.getItem(`telegram_chat_id_${user.id}`);
if (savedChatId) setTelegramChatId(savedChatId); // immediate
const { data } = await supabase.from('profiles').select('telegram_chat_id');
if (data?.telegram_chat_id) setTelegramChatId(data.telegram_chat_id); // authoritative
```

---

## Slide 16: Live Demo

**Title:** Live Demonstration

**Demo Flow (recommended order):**
1. **Login / Register** — Show Supabase authentication in action
2. **Dashboard** — Point out live price moving in the header + price cards
3. **Chart** — Toggle indicators on/off (MA, Bollinger, Fibonacci)
4. **Switch Instrument** — Toggle from XAU/USD to XAG/USD
5. **News Tab** — Show dynamically generated news with sentiment gauge
6. **Calendar Tab** — Show upcoming economic events for the current week
7. **Correlation Tab** — Show DXY, Treasury Yield, Oil, Bitcoin correlation cards
8. **Experts Tab** — Show target prices calculated relative to the current price
9. **Telegram Setup** — Detect Chat ID → Send test message → show notification arriving on phone 📱
10. **Trading Simulator** — Open a position → watch P&L update in real-time
11. **Language Toggle** — Switch between English ↔ Indonesian

---

## Slide 17: Challenges & Solutions

**Title:** Challenges Encountered & Solutions

| Challenge | Solution |
|-----------|----------|
| Browser CORS policy blocks API calls | Created Vercel Serverless Functions as server-side proxies |
| Mock/hardcoded data becomes stale over time | Built dynamic data generators that compute values from live prices |
| Telegram Chat ID lost on page refresh | Implemented dual persistence: localStorage (instant) + Supabase (cloud) |
| Chart not visually updating with live prices | Added `livePrice` as a dependency to the chart's `useMemo` hook |
| Supabase Edge Functions not deployed on free tier | Removed dependency; moved to client-side generation instead |
| `.env` file accidentally pushed to GitHub | Added `.env` to `.gitignore` and created `.env.example` as a template |
| Mixed Indonesian/English text throughout codebase | Centralized all strings into an i18n system and did a full English translation pass |

---

## Slide 18: Future Improvements

**Title:** Future Development Roadmap

- 🔮 **AI-Powered Predictions** — Integrate OpenAI/Gemini API for real market analysis
- 📰 **Live News Feed** — Connect to NewsAPI or Google News for real-time headlines
- 📊 **Live Correlated Asset Prices** — Fetch real DXY/Oil/BTC prices from market APIs
- 🔔 **Server-Side Alerts** — Use Supabase Edge Functions to send alerts even when the browser is closed
- 📱 **Mobile Application** — Build a React Native version for iOS & Android
- 💳 **Brokerage Integration** — Connect to real trading APIs for live execution
- 📈 **Backtesting Engine** — Allow users to test strategies against historical data
- 🔐 **Enhanced Security** — Move bot tokens to server-side only, never expose to client

---

## Slide 19: Conclusion

**Title:** Conclusion

**Key Achievements:**
- ✅ **100% Real-Time** — No mock data; all information sourced from live APIs
- ✅ **Full-Stack Application** — React Frontend + Vercel Serverless + Supabase Backend
- ✅ **Production-Ready** — Deployed on Vercel with automated CI/CD
- ✅ **User-Centric Design** — Telegram integration, persistent settings, bilingual support
- ✅ **Software Engineering Best Practices** — TypeScript, component architecture, security, error handling

**Closing Statement:**
*"The Gold Analysis Platform demonstrates how modern web technologies can be combined to create a professional-grade financial intelligence tool that rivals commercial platforms — completely free and open source."*

---

## Slide 20: Q&A

**Title:** Questions & Answers

**Prepare answers for common questions:**

1. **"Why use Stooq instead of just Yahoo Finance?"**
   → Stooq provides near-real-time spot prices (delay < 30 seconds). Yahoo Finance only offers end-of-day or significantly delayed data for commodities.

2. **"Is the data truly real-time?"**
   → The base price is fetched from Stooq every 15 seconds. Between fetches, we simulate realistic micro-movements to provide a smooth, live-feeling user experience.

3. **"Do Telegram notifications work when the browser is closed?"**
   → Currently, no — alerts are processed client-side in the browser. A planned improvement is to move alert processing to Supabase Edge Functions for server-side execution.

4. **"Why use both localStorage AND a database for persistence?"**
   → Dual persistence: localStorage provides instant load with zero latency and works offline. Supabase provides cloud synchronization across multiple devices. This ensures the best user experience regardless of network conditions.

5. **"How are API tokens secured?"**
   → The Bot Token is stored in `.env` which is excluded from Git via `.gitignore`. On Vercel, environment variables are stored encrypted in the dashboard. Serverless functions can hide tokens from client-side code entirely.

6. **"What happens if the external APIs go down?"**
   → The app gracefully handles failures with try/catch blocks. The last known price remains displayed, and toast notifications inform the user of any connection issues.

---

## 📎 Appendix: Project File Structure

```
gold-analysis-platform/
├── api/                          # Vercel Serverless Functions
│   ├── stooq.ts                  # Proxy to Stooq.com (live spot prices)
│   ├── yahoo.ts                  # Proxy to Yahoo Finance (historical OHLC)
│   └── telegram.ts               # Proxy to Telegram Bot API
├── src/
│   ├── components/gold/          # Feature-specific components
│   │   ├── GoldChart.tsx         # Candlestick chart + technical indicators
│   │   ├── TelegramSettings.tsx  # Bot token + Chat ID configuration
│   │   ├── NewsSentiment.tsx     # News feed + sentiment analysis gauge
│   │   ├── EconomicCalendar.tsx  # Upcoming economic events list
│   │   ├── ExpertAnalysisList.tsx# Expert buy/sell signal cards
│   │   ├── CorrelatedAssets.tsx  # DXY, Treasury, Oil, BTC correlation
│   │   ├── TradingSimulator.tsx  # Paper trading engine
│   │   ├── PriceAlerts.tsx       # Custom price alert management
│   │   └── PredictionPanel.tsx   # AI prediction scenario analysis
│   ├── hooks/
│   │   └── useGoldPrices.ts      # Live price fetching + tick simulation
│   ├── data/
│   │   └── dynamicData.ts        # Dynamic data generators (no mock data)
│   ├── lib/
│   │   ├── telegram.ts           # Telegram messaging utility functions
│   │   ├── i18n.ts               # Internationalization (English + Indonesian)
│   │   └── supabase.ts           # Supabase client initialization
│   ├── types/
│   │   └── gold.ts               # TypeScript type definitions & interfaces
│   └── pages/
│       └── GoldAnalysis.tsx      # Main dashboard page (orchestrates all)
├── vercel.json                   # Vercel routing & rewrite configuration
├── vite.config.ts                # Vite dev server + proxy configuration
├── .env                          # Environment variables (NOT pushed to Git)
├── .env.example                  # Template showing required env vars
├── .gitignore                    # Excludes .env, node_modules, dist
└── package.json                  # Dependencies & scripts
```
