# Smart Garden Control Dashboard (SGMC) - Frontend Demo

A comprehensive frontend prototype for a Smart Garden IoT + AI Dashboard, built with React, TypeScript, Tailwind CSS v4, and Recharts. This is a **standalone demo** with mock data and mock WebSocket — no backend required.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7
- **Fonts:** Inter (body) + Outfit (headings)

## Features (23/23 implemented)

### Core (MVP)
- F-01: Realtime Monitoring Dashboard with sensor cards + sparklines
- F-02: Manual Relay Control with Auto/Manual/Fallback modes
- F-03: AI Disease Detection with bounding box overlays
- F-04: Smart Irrigation Schedule with timeline view
- F-05: Push Notifications with bell dropdown + history page
- F-06: User & Role Management (Login, Register, Profile, Members)
- F-07: Historical Analytics with multi-sensor charts
- F-08: Device & Threshold Configuration with range sliders

### Extended
- F-09: Plant Health Score with radial gauge
- F-10: Weather Forecast (widget + detail page)
- F-11: AI Recommendation Feed
- F-12: Water Usage Analytics
- F-13: Disease Risk Prediction
- F-14: Harvest Prediction with countdown
- F-15: Plant Growth Tracking with timeline slider
- F-16: Smart Rule Engine (IF-THEN builder)
- F-17: Power Consumption Monitoring
- F-18: Device Health Monitoring
- F-19: Multi-Garden Management
- F-20: Camera Live Streaming (mock)
- F-21: Photo History Gallery
- F-22: AI Chatbot Floating Widget
- F-23: Farming Log Timeline

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Test Accounts

See [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) for login credentials and role details.

## Design System

- **Theme:** Dark slate with emerald primary accent
- **CSS Variables:** Uses oklch color space for consistent theming
- **Breakpoints:** Desktop (1200px+), Tablet (768-1199px), Mobile (375-767px)
- **Animation:** Micro-animations including count-up, pulse, shimmer, camera flash

## Project Structure

```
src/
  components/
    layout/        # Sidebar, Header, AppLayout, Chatbot
  contexts/        # AuthContext, AppContext
  mocks/           # Mock data (sensors, gardens, recommendations...)
  pages/           # All 22 route pages
  types/           # TypeScript interfaces
  lib/             # Utilities (cn)
  App.tsx          # Router setup
  main.tsx         # Entry point
  index.css        # Tailwind config + CSS variables
```
