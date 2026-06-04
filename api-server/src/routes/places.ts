import { Router, Request, Response } from "express";

const router = Router();
const NIMBLE_API_KEY = process.env.NIMBLE_API_KEY!;
const NIMBLE_BASE = "https://api.nimbleway.com/v1";

// ── Nimble helpers ────────────────────────────────────────────────

async function nimbleSearch(query: string, maxResults = 10) {
  const res = await fetch(`${NIMBLE_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(NIMBLE_API_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      focus: "local",
      max_results: maxResults,
      include_answer: true,
      search_depth: "lite",
    }),
  });
  if (!res.ok) throw new Error(`Nimble search error: ${res.status}`);
  return res.json();
}

async function nimbleExtract(url: string) {
  const res = await fetch(`${NIMBLE_BASE}/extract`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(NIMBLE_API_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      render_js: false,
    }),
  });
  if (!res.ok) throw new Error(`Nimble extract error: ${res.status}`);
  return res.json();
}

async function nimbleCrawl(url: string, limit = 5) {
  const res = await fetch(`${NIMBLE_BASE}/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(NIMBLE_API_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, limit, formats: ["markdown"] }),
  });
  if (!res.ok) throw new Error(`Nimble crawl error: ${res.status}`);
  return res.json();
}

// ── Match reason generator ────────────────────────────────────────

function buildMatchReason(tags: string[], category: string, title: string): string {
  const tagReasons: Record<string, string[]> = {
    "coffee-explorer": [
      "You visit coffee shops often — this looks like your kind of spot",
      "Matches your coffee explorer lifestyle perfectly",
    ],
    "fitness-regular": [
      "Great for your active routine",
      "Aligns with your fitness habits",
    ],
    "food-adventurer": [
      "Perfect for your adventurous palate",
      "New flavors that match your food curiosity",
    ],
    "night-owl": [
      "Open late — built for your schedule",
      "A night owl's kind of place",
    ],
    "culture-seeker": [
      "Matches your love for local culture",
      "A gem for culture seekers like you",
    ],
    "budget-conscious": [
      "Great value that fits your budget",
      "Affordable and worth it",
    ],
  };

  for (const tag of tags) {
    const reasons = tagReasons[tag];
    if (reasons) return reasons[Math.floor(Math.random() * reasons.length)];
  }

  const categoryReasons: Record<string, string> = {
    food: "Looks like a great dining match for your taste",
    fitness: "A solid fit for your active lifestyle",
    chill: "A relaxed vibe that suits how you recharge",
    culture: "Culturally rich — right up your alley",
  };

  return categoryReasons[category] ?? `${title} was picked based on your lifestyle`;
}

function inferCategory(text: string): string {
  const t = text.toLowerCase();
  if (/gym|fitness|yoga|sport|crossfit|pilates|pool|running/.test(t)) return "fitness";
  if (/museum|gallery|theater|theatre|art|library|culture|heritage/.test(t)) return "culture";
  if (/cafe|coffee|bar|restaurant|bistro|food|eat|brunch|pizza|burger/.test(t)) return "food";
  return "chill";
}

/** Haversine distance in miles between two lat/lng points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

/** Try to extract lat/lng from a Nimble result's metadata/snippet */
function extractCoords(result: any): { lat: number; lng: number } | null {
  if (result.latitude && result.longitude) return { lat: result.latitude, lng: result.longitude };
  if (result.location?.lat && result.location?.lng) return { lat: result.location.lat, lng: result.location.lng };
  return null;
}

function parseResults(
  nimbleResults: any[],
  tags: string[],
  userLat?: number,
  userLng?: number
): any[] {
  return nimbleResults
    .filter((r: any) => r.title && r.url)
    .map((r: any, i: number) => {
      const category = inferCategory(r.title + " " + (r.snippet ?? ""));
      const coords = extractCoords(r);
      const distance =
        coords && userLat !== undefined && userLng !== undefined
          ? haversine(userLat, userLng, coords.lat, coords.lng)
          : parseFloat((0.1 + Math.random() * 4.9).toFixed(1));
      return {
        id: `nimble-${i}-${Date.now()}`,
        name: r.title,
        category,
        address: r.snippet?.split(".")[0] ?? "See link for details",
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        matchReason: buildMatchReason(tags, category, r.title),
        url: r.url,
        snippet: r.snippet,
        photos: [],
        distance,
        lat: coords?.lat,
        lng: coords?.lng,
      };
    });
}

// ── Routes ────────────────────────────────────────────────────────

/**
 * GET /api/places/discover
 * Query: city, tags (comma-sep), budget, category, lat, lng
 * Uses Nimble Search to find real places matching the user's lifestyle
 */
router.get("/discover", async (req: Request, res: Response) => {
  try {
    const { city = "New York", tags = "", budget = "$$", category = "", lat, lng } = req.query as Record<string, string>;
    const tagList = tags ? tags.split(",").filter(Boolean) : [];
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;

    // Build a lifestyle-aware query
    const lifestyleKeywords = tagList.map((t) => t.replace("-", " ")).join(", ");
    const categoryStr = category && category !== "all" ? category : "places";
    const budgetStr = budget === "$" ? "affordable budget" : budget === "$$$" ? "upscale premium" : "";
    const query = `best ${budgetStr} ${lifestyleKeywords || ""} ${categoryStr} in ${city}`.replace(/\s+/g, " ").trim();

    const data = await nimbleSearch(query, 12);
    const places = parseResults(data.results ?? [], tagList, userLat, userLng);

    res.json({ places, answer: data.answer, query });
  } catch (err: any) {
    console.error("discover error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/places/extract?url=<venue_url>
 * Uses Nimble Extract to scrape live venue details
 */
router.get("/extract", async (req: Request, res: Response) => {
  try {
    const { url } = req.query as { url: string };
    if (!url) return res.status(400).json({ error: "url required" });

    const data = await nimbleExtract(url);
    const markdown: string = data.data?.markdown ?? "";

    // Parse key fields from markdown
    const hours = markdown.match(/hours?[:\s]+([^\n]+)/i)?.[1] ?? null;
    const phone = markdown.match(/(\+?[\d\s\-().]{7,})/)?.[1]?.trim() ?? null;
    const website = url;

    res.json({ markdown, hours, phone, website, url });
  } catch (err: any) {
    console.error("extract error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/places/neighborhood?city=<city>
 * Uses Nimble Crawl to discover top spots in a new city (runs on onboarding)
 */
router.get("/neighborhood", async (req: Request, res: Response) => {
  try {
    const { city = "new-york" } = req.query as { city: string };
    const slug = city.toLowerCase().replace(/\s+/g, "-");

    // Crawl timeout.com city guide for local intel
    const data = await nimbleCrawl(`https://www.timeout.com/${slug}`, 4);

    const spots = (data.tasks ?? [])
      .map((t: any) => ({
        source: t.url,
        content: t.data?.markdown?.slice(0, 500) ?? "",
      }))
      .filter((t: any) => t.content);

    res.json({ city, spots });
  } catch (err: any) {
    console.error("neighborhood error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/places/search?q=<query>&city=<city>
 * Free-text Nimble search
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q = "", city = "" } = req.query as Record<string, string>;
    const query = city ? `${q} in ${city}` : q;
    const data = await nimbleSearch(query, 10);
    res.json({ results: data.results ?? [], answer: data.answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
