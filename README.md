<p align="center">
  <img src="logo.webp" alt="Nested logo" width="120" />
</p>

<h1 align="center">Nested</h1>
<p align="center"><em>Move like a local.</em></p>

<p align="center">
  An AI-powered mobile app that helps people moving to a new city discover places that match their lifestyle -- powered entirely by <strong>Nimble live web intelligence</strong>.
</p>

---

## The Problem

Moving to a new city means weeks of bad guesses: wrong cafes, gyms that don't fit your vibe, restaurants that look great online but aren't for you. Generic "top 10" lists don't know how you actually live.

## The Solution

Nested acts like a local friend who already knows you. It learns your lifestyle (habits, interests, budget) and uses Nimble to search the live web for real places -- then tells you *why* each one is right for you specifically.

---

## How Nimble Powers Nested

Nimble is the core engine. Every piece of real-world data in the app comes from Nimble's live web APIs -- there is no static database.

### 1. Place Discovery -- Nimble Search (`/v1/search`)

When you open the Home feed, Nested builds a lifestyle-aware query from your profile and fires it at Nimble Search:

```
"best affordable coffee explorer chill places in Austin"
```

Nimble returns live, ranked results with titles, snippets, and URLs. The app infers categories (food/fitness/chill/culture) from the text and generates a personal match reason for each result.

```
GET /api/places/discover?city=Austin&tags=coffee-explorer&budget=$&category=chill&lat=30.26&lng=-97.74
```

### 2. Live Venue Details -- Nimble Extract (`/v1/extract`)

When you open a place's detail screen, Nested calls Nimble Extract on the venue's own website to scrape real opening hours and phone number -- not cached data, but live info from the source.

```
GET /api/places/extract?url=https://somecafe.com
```

Returns: opening hours, phone (tappable to call), and website link.

### 3. City Intelligence -- Nimble Crawl (`/v1/crawl`)

During onboarding, when a user enters their new city, Nested uses Nimble Crawl to scan timeout.com city guides for that city -- bootstrapping local knowledge before the user has even explored.

```
GET /api/places/neighborhood?city=austin
```

### 4. Agentic Day Planner -- 3x Parallel Nimble Searches

The "Plan My Day" feature is fully agentic. You pick a vibe (Chill Sunday, Date Night, Active Day, etc.) or describe your day in natural language. The server fires **three parallel Nimble Search queries** -- one for morning, one for afternoon, one for evening -- and assembles a full itinerary from the live results.

```
POST /api/plan
{ "vibe": "date-night", "city": "Austin", "tags": ["food-adventurer"] }
```

```
Morning  --> "romantic morning cafe Austin food-adventurer"  --> Nimble Search
Afternoon --> "art gallery scenic walk Austin"               --> Nimble Search  (parallel)
Evening  --> "romantic restaurant date night Austin"         --> Nimble Search  (parallel)
```

Returns a structured morning/afternoon/evening plan with real place names, snippets, and a "why Nested picked this" reason for each slot.

---

## Features

### Personalized Place Discovery
- Lifestyle-matched results from Nimble Search on every load
- Category filters: All / Food / Fitness / Chill / Culture
- Match reason on every card ("You visit coffee shops often -- this looks like your kind of spot")
- Live GPS coordinates passed to Nimble for location-aware results
- Real haversine distance calculated when Nimble returns coordinates

### Interactive Map
- Native Google Maps (react-native-maps) with colour-coded pins per category
- Pins use real lat/lng from Nimble results (no fake offsets)
- Live GPS sets map center to user's actual location
- Web fallback: compact list view (app works on all platforms)

### Plan My Day (Agentic Itinerary)
- 6 vibe presets + free-text natural language input
- Three parallel Nimble searches build a full morning/afternoon/evening itinerary
- Each slot shows: time, place name, snippet, and personalised "why" reason

### My Nest (Collections)
- Save and visit places with one tap
- Stats: saved / visited / rated counts
- Fully persisted via AsyncStorage (no account needed)

### Live Place Detail
- Nimble Extract scrapes the venue's website for real hours and phone
- Personal 1-5 star rating
- Private notes ("grab the window seat")
- Mark as visited

### Onboarding
- 3-slide welcome carousel
- Google Sign-In via expo-auth-session OAuth
- AI analysis animation ("Powered by Nimble live web intelligence") -> lifestyle tag picker
- Budget, distance, and city preferences

### Profile
- Lifestyle tags: Coffee Explorer, Fitness Regular, Food Adventurer, Night Owl, Culture Seeker, Budget Conscious, Nature Lover, Bookworm, Social Butterfly, Homebody
- Budget: $ / $$ / $$$
- Max search distance: 1 / 2 / 5 / 10 / 20 miles
- Editable city

---

## Screens

| Screen | Route | Description |
|---|---|---|
| Welcome | `/onboarding` | 3-slide animated carousel |
| Google Connect | `/onboarding/connect` | OAuth sign-in via expo-auth-session |
| Profile Setup | `/onboarding/profile` | Nimble analysis animation + lifestyle tag picker |
| Preferences | `/onboarding/preferences` | Budget, distance, city |
| Home Feed | `/(tabs)/` | Live place cards with category filters |
| Map | `/(tabs)/map` | GPS-centered map with real Nimble pins |
| Plan My Day | `/(tabs)/plan` | Agentic itinerary builder |
| My Nest | `/(tabs)/nest` | Saved and visited collections |
| Profile | `/(tabs)/profile` | User settings and lifestyle config |
| Place Detail | `/place/[id]` | Live Nimble Extract details, rating, notes |

---

## Architecture

```
Expo Mobile App  <-->  Express API Server  <-->  Nimble Web APIs
                                            |
                                     Search / Extract / Crawl
```

All Nimble calls go through the Express server -- the API key never touches the client.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo (React Native) |
| Navigation | Expo Router (file-based) |
| Maps | react-native-maps |
| Location | expo-location |
| Auth | expo-auth-session (Google OAuth) |
| State | React Context + AsyncStorage |
| HTTP | @tanstack/react-query |
| Backend | Express.js + TypeScript |
| Live Web Data | Nimble Search, Extract, Crawl |

---

## Project Structure

```
app/                   Expo mobile app (React Native)
  app/
    _layout.tsx        Root layout, font loading, onboarding guard
    onboarding.tsx     Welcome carousel
    onboarding/
      connect.tsx      Google OAuth sign-in
      profile.tsx      Nimble analysis + lifestyle tag picker
      preferences.tsx  Budget, distance, city
    (tabs)/
      index.tsx        Home feed
      map.tsx          Interactive map
      plan.tsx         Plan My Day
      nest.tsx         Collections
      profile.tsx      User profile
    place/[id].tsx     Place detail with live Nimble Extract

api-server/            Express API server (TypeScript)
  src/
    app.ts             Express setup
    routes/
      places.ts        Nimble Search + Extract + Crawl routes
      plan.ts          Agentic day planner (3x parallel Nimble searches)
      health.ts        Health check
```

---

## Setup

### API Server

```bash
cd api-server
npm install
cp .env.example .env
# Add your NIMBLE_API_KEY to .env
npm run dev
```

### Mobile App

```bash
cd app
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://<your-local-ip>:3001
# Optionally set EXPO_PUBLIC_GOOGLE_CLIENT_ID for real Google OAuth
npx expo start
```

For Google OAuth: create an OAuth 2.0 Client ID in Google Cloud Console and set the redirect URI to `nested://`.

---

## Environment Variables

**api-server/.env**
```
NIMBLE_API_KEY=your_nimble_api_key
PORT=3001
```

**app/.env**
```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Hackathon

Built for the [Nimble Agentic App Hackathon 2026](https://devnetwork-ai-ml-hack-2026.devpost.com/).

Nimble APIs used: Search, Extract, Crawl.
