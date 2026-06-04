<p align="center">
  <img src="logo.webp" alt="Nested logo" width="120" />
</p>

<h1 align="center">Nested 🪺</h1>
<p align="center"><em>Move like a local.</em></p>

<p align="center">
  An AI-powered mobile app that helps people moving to a new city discover places that match their lifestyle, powered entirely by <strong>Nimble live web intelligence</strong>.
</p>

---

## The Problem

Moving to a new city is disorienting. You don't know where the good coffee shops are, which gym fits your routine, or where locals actually hang out. You spend weeks Googling, asking strangers, and making costly mistakes, wasting time finding places that don't suit you at all.

Generic "top 10" lists don't know how you live. They rank by popularity, not by fit.

---

## The Solution

Nested acts like a local friend who already knows you. It learns your lifestyle (habits, interests, budget) and uses **Nimble** to search the live web for real places, then tells you *why* each one is right for you specifically.

> Your lifestyle + Your new city = Your personal nest

The app works in two phases:

- **Learn** - Understand how you live through Google Maps history or manual lifestyle tag selection
- **Match** - Surface real nearby places ranked by lifestyle fit, not generic popularity

---

## How Nimble Powers Nested

Nimble is the core engine of Nested. Every piece of real-world place data in the app comes from Nimble's live web APIs. There is no static database, no stale cache. Everything is fetched live from the web.

### 1. Place Discovery via Nimble Search

When you open the Home feed, Nested builds a lifestyle-aware query from your profile tags, budget, and city, then fires it at Nimble Search (`/v1/search`):

```
"best affordable coffee explorer chill places in Austin"
```

Nimble returns live, ranked web results with titles, snippets, and URLs. The server infers a category (food / fitness / chill / culture) from the text and generates a personal match reason for each result based on your lifestyle tags.

```
GET /api/places/discover?city=Austin&tags=coffee-explorer,night-owl&budget=$&lat=30.26&lng=-97.74
```

The response includes real place names, URLs, snippets, inferred category, match reason, and distance calculated from your GPS coordinates using the Haversine formula. When Nimble returns coordinates in its result metadata, those are used directly for map pins and precise distance. When coordinates are not available, distance falls back to an estimate.

### 2. Live Venue Details via Nimble Extract

When you open a place detail screen, the app calls Nimble Extract (`/v1/extract`) on the venue's own website to scrape live opening hours and phone number. Not cached data from a third-party aggregator, but actual content from the venue's real website, fetched at the moment you open the screen.

```
GET /api/places/extract?url=https://somecafe.com
```

The markdown response is parsed for hours patterns and phone numbers, which appear as tappable links (call, open in browser) directly in the place detail UI.

### 3. City Intelligence via Nimble Crawl

During onboarding, when a user enters a new city, Nested uses Nimble Crawl (`/v1/crawl`) to scan timeout.com city guides, bootstrapping local knowledge before the user has explored anything. This seeds the app with real editorial content about the city written by locals.

```
GET /api/places/neighborhood?city=austin
```

Up to 4 pages are crawled and their markdown content is returned to the client, giving the user an immediate feel for the city before they open the map.

### 4. Agentic Day Planner via Parallel Nimble Searches

The "Plan My Day" feature is fully agentic. You pick a vibe or describe your day in natural language. The server fires **three parallel Nimble Search queries** (morning, afternoon, evening) and assembles a complete itinerary from the live results.

```
POST /api/plan
{ "vibe": "date-night", "city": "Austin", "tags": ["food-adventurer"] }
```

The three queries run concurrently with `Promise.all`:

```
Morning   --> "romantic morning cafe Austin food-adventurer"   --> Nimble Search
Afternoon --> "art gallery scenic walk Austin"                 --> Nimble Search  (in parallel)
Evening   --> "romantic restaurant date night Austin"          --> Nimble Search  (in parallel)
```

Each slot in the returned itinerary includes a real place name, snippet, URL, and a "why Nested picked this for you" reason drawn from Nimble's answer field.

For custom natural language prompts like "a solo day, coffee, a museum, good ramen", the server derives three slot queries from the description and runs the same parallel search pattern.

### 5. Free-Text Place Search

The map and search screens support a free-text search that passes directly to Nimble Search, returning live web results for any query in any city.

```
GET /api/places/search?q=rooftop+bar&city=Austin
```

---

## Features

### Personalized Place Discovery
- Lifestyle-matched results from Nimble Search on every load, never stale
- Category filters: All / Food / Fitness / Chill / Culture
- Match reason on every card ("You visit coffee shops often, this looks like your kind of spot")
- Real GPS coordinates from expo-location passed to the API for location-aware results
- Real distance in miles calculated via Haversine from user location to place coordinates returned by Nimble

### Interactive Map
- Native Google Maps (react-native-maps) with colour-coded pins per category
  - Amber = Food, Green = Fitness, Purple = Chill, Red = Culture
- Pins use real lat/lng returned from Nimble result metadata
- Live GPS sets the map center to the user's actual device location
- Web fallback: compact list view so the app works on all platforms without crashing

### Plan My Day (Agentic Itinerary)
- 6 vibe presets: Chill Solo Sunday, Date Night, Productive Day, Active Day, Culture Day, Weekend Adventure
- Free-text natural language input for any custom day description
- Three parallel Nimble searches build a full morning / afternoon / evening itinerary
- Each slot shows: time, place name, snippet, and a personalised "why" reason from Nimble's answer

### My Nest (Collections)
- Save places with the heart button; mark as visited from the detail screen
- Stats dashboard: saved / visited / rated counts
- All data persisted locally via AsyncStorage, no account or internet required to view your nest

### Live Place Detail
- Nimble Extract scrapes the venue's real website for live opening hours and phone number
- Tappable phone number (opens dialler) and website (opens browser)
- Personal 1 to 5 star rating stored locally
- Private notes field ("grab the window seat, great for morning work")
- One-tap Mark as Visited button

### Onboarding Flow
- 3-slide welcome carousel (navy background, animated progress dots, amber CTA)
- Google Sign-In via expo-auth-session OAuth with graceful no-client-ID fallback for demos
- Animated AI analysis screen ("Powered by Nimble live web intelligence") followed by lifestyle tag picker
- Budget, max distance, and city preferences screen

### Profile and Preferences
- Lifestyle tags: Coffee Explorer, Fitness Regular, Food Adventurer, Night Owl, Culture Seeker, Budget Conscious, Nature Lover, Bookworm, Social Butterfly, Homebody
- Budget: $ / $$ / $$$
- Max search distance: 1 / 2 / 5 / 10 / 20 miles
- Editable city field that updates all future Nimble queries
- Google account connection status
- Stats summary (saved, visited, rated)

---

## What Makes It Different

| Generic App | Nested |
|---|---|
| "Best restaurants near you" | "You love Italian, here's one 0.3 mi away perfect for slow mornings" |
| Generic star ratings | Personal match scores based on your lifestyle tags |
| Static lists from a database | Live Nimble web results, fresh on every request |
| One-size-fits-all | Built around your habits, interests, and budget |
| Discover blindly | Understand why a place suits you before you go |

---

## Screens

| Screen | Route | Description |
|---|---|---|
| Welcome Carousel | `/onboarding` | 3-slide animated intro explaining the concept |
| Google Connect | `/onboarding/connect` | OAuth sign-in via expo-auth-session |
| Profile Setup | `/onboarding/profile` | Nimble analysis animation + lifestyle tag picker |
| Preferences | `/onboarding/preferences` | Budget, max distance, city |
| Home Feed | `/(tabs)/` | Live Nimble-powered place cards with category filters |
| Map | `/(tabs)/map` | GPS-centered map with real coordinate pins from Nimble |
| Plan My Day | `/(tabs)/plan` | Agentic itinerary builder via parallel Nimble searches |
| My Nest | `/(tabs)/nest` | Saved and visited collections with stats |
| Profile | `/(tabs)/profile` | Lifestyle tags, preferences, account settings |
| Place Detail | `/place/[id]` | Live Nimble Extract details, personal rating, notes |

---

## Data Flow

```
User opens app
    |
expo-location --> real GPS coordinates
    |
API Server builds lifestyle-aware query
    |
Nimble Search --> live ranked place results
    |
Home Feed / Map populated with real data
    |
User taps a place
    |
Nimble Extract --> scrapes venue website (hours, phone)
    |
User saves / visits / rates --> AsyncStorage (local persistence)
```

---

## Architecture

```
Expo Mobile App  <-->  Express API Server  <-->  Nimble Web APIs
                                            |
                                     /v1/search  (place discovery, day planner)
                                     /v1/extract (live venue details)
                                     /v1/crawl   (city guide onboarding)
```

All Nimble calls are proxied through the Express server. The Nimble API key never reaches the client.

---

## Project Structure

```
app/                          Expo mobile app (React Native)
  app/
    _layout.tsx               Root layout, font loading, onboarding guard
    onboarding.tsx            3-slide welcome carousel
    onboarding/
      connect.tsx             Google OAuth via expo-auth-session
      profile.tsx             Nimble analysis animation + lifestyle tag picker
      preferences.tsx         Budget, distance, city
    (tabs)/
      index.tsx               Home feed (Nimble Search on every load)
      map.tsx                 Interactive map with live GPS and real Nimble pins
      plan.tsx                Plan My Day (3 parallel Nimble searches)
      nest.tsx                Saved and visited collections
      profile.tsx             User profile and preferences
    place/[id].tsx            Place detail (Nimble Extract for live info)
  components/
    PlaceCard.tsx             Reusable place card (full and compact modes)
    ErrorBoundary.tsx         Global error boundary
  context/
    AppContext.tsx            Global state, AsyncStorage persistence
  constants/
    colors.ts                 Brand palette (navy #1B2B5E, amber #F5A623)
    api.ts                    API base URL constant
  metro.config.js             Shims react-native-maps on web
  shims/
    react-native-maps.web.js  Web stub for the native map library

api-server/                   Express API server (TypeScript)
  src/
    app.ts                    Express setup (CORS, logging, routing)
    routes/
      places.ts               Nimble Search + Extract + Crawl routes
      plan.ts                 Agentic day planner (3 parallel Nimble searches)
      health.ts               Health check endpoint
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo (React Native) |
| Navigation | Expo Router (file-based) |
| Maps | react-native-maps (Google Maps on native) |
| Location | expo-location (device GPS) |
| Auth | expo-auth-session (Google OAuth) |
| State | React Context + AsyncStorage |
| HTTP | @tanstack/react-query |
| Backend | Express.js + TypeScript |
| Live Web Data | Nimble Search, Extract, Crawl |
| Fonts | Inter 400/500/600/700 via expo-google-fonts |
| Icons | Expo Vector Icons (Ionicons) |

---

## Brand

| Element | Value |
|---|---|
| Primary | Navy `#1B2B5E` (trust, depth, home) |
| Accent | Amber `#F5A623` (warmth, discovery) |
| Success | Emerald `#10B981` |
| Mascot | Owl, wise and local |
| Tagline | Move like a local |

---

## Setup

### API Server

```bash
cd api-server
npm install
cp .env.example .env
# Fill in your NIMBLE_API_KEY
npm run dev
```

### Mobile App

```bash
cd app
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your machine's local IP, e.g. http://192.168.1.5:3001
npx expo start
```

For Google OAuth: create an OAuth 2.0 Client ID in Google Cloud Console, set the authorized redirect URI to `nested://`, and add it to `.env` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`. If this variable is not set, the Connect screen falls back to marking the account as connected and proceeding, which is fine for demos.

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
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Hackathon

Built for the [Nimble Agentic App Hackathon 2026](https://devnetwork-ai-ml-hack-2026.devpost.com/).

Nimble APIs used: Search (`/v1/search`), Extract (`/v1/extract`), Crawl (`/v1/crawl`).
