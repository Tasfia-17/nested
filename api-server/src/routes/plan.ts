import { Router, Request, Response } from "express";

const router = Router();
const NIMBLE_API_KEY = process.env.NIMBLE_API_KEY!;
const NIMBLE_BASE = "https://api.nimbleway.com/v1";

async function nimbleSearch(query: string, maxResults = 5) {
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

// Vibe → search query mappings
const VIBE_QUERIES: Record<string, { morning: string; afternoon: string; evening: string }> = {
  "chill-sunday": {
    morning: "best brunch cafe relaxed morning",
    afternoon: "peaceful park or bookstore afternoon",
    evening: "cozy wine bar or lounge",
  },
  "date-night": {
    morning: "coffee and pastry romantic morning cafe",
    afternoon: "art gallery or scenic walk",
    evening: "romantic restaurant date night",
  },
  "productive-day": {
    morning: "best coffee shop work remote laptop friendly",
    afternoon: "quiet library or co-working space",
    evening: "healthy dinner restaurant",
  },
  "active-day": {
    morning: "morning yoga class or gym",
    afternoon: "outdoor trail hike or sports court",
    evening: "healthy smoothie bar or casual dinner",
  },
  "culture-day": {
    morning: "museum open morning",
    afternoon: "local art gallery or cultural center",
    evening: "jazz bar or theater live performance",
  },
  "weekend-adventure": {
    morning: "farmers market or weekend brunch spot",
    afternoon: "local hidden gem attraction",
    evening: "rooftop bar or lively restaurant",
  },
};

function pickResult(results: any[], index: number) {
  return results[index % results.length] ?? results[0];
}

/**
 * POST /api/plan
 * Body: { vibe, city, tags, customPrompt? }
 * Runs 3 parallel Nimble searches (morning / afternoon / evening)
 * Returns a full day itinerary with real places
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { vibe = "chill-sunday", city = "New York", tags = [], customPrompt } = req.body as {
      vibe: string;
      city: string;
      tags: string[];
      customPrompt?: string;
    };

    const tagKeywords = (tags as string[]).map((t) => t.replace("-", " ")).join(" ");

    let slots: { morning: string; afternoon: string; evening: string };

    if (customPrompt) {
      // For custom prompts, derive time slots from the description
      slots = {
        morning: `${customPrompt} morning ${city}`,
        afternoon: `${customPrompt} afternoon ${city}`,
        evening: `${customPrompt} evening ${city}`,
      };
    } else {
      const template = VIBE_QUERIES[vibe] ?? VIBE_QUERIES["chill-sunday"];
      slots = {
        morning: `${template.morning} ${tagKeywords} in ${city}`,
        afternoon: `${template.afternoon} ${tagKeywords} in ${city}`,
        evening: `${template.evening} ${tagKeywords} in ${city}`,
      };
    }

    // Fire all 3 Nimble searches in parallel — fully agentic
    const [morningData, afternoonData, eveningData] = await Promise.all([
      nimbleSearch(slots.morning),
      nimbleSearch(slots.afternoon),
      nimbleSearch(slots.evening),
    ]);

    const morningPlace = pickResult(morningData.results ?? [], 0);
    const afternoonPlace = pickResult(afternoonData.results ?? [], 0);
    const eveningPlace = pickResult(eveningData.results ?? [], 0);

    const plan = {
      vibe,
      city,
      generatedAt: new Date().toISOString(),
      itinerary: [
        {
          slot: "morning",
          time: "9:00 AM",
          place: {
            name: morningPlace?.title ?? "Morning Spot",
            url: morningPlace?.url ?? "",
            snippet: morningPlace?.snippet ?? "",
            why: morningData.answer?.slice(0, 120) ?? "A great way to start your day",
          },
        },
        {
          slot: "afternoon",
          time: "1:00 PM",
          place: {
            name: afternoonPlace?.title ?? "Afternoon Stop",
            url: afternoonPlace?.url ?? "",
            snippet: afternoonPlace?.snippet ?? "",
            why: afternoonData.answer?.slice(0, 120) ?? "Perfect for the middle of your day",
          },
        },
        {
          slot: "evening",
          time: "7:00 PM",
          place: {
            name: eveningPlace?.title ?? "Evening Venue",
            url: eveningPlace?.url ?? "",
            snippet: eveningPlace?.snippet ?? "",
            why: eveningData.answer?.slice(0, 120) ?? "The ideal way to end your day",
          },
        },
      ],
    };

    res.json(plan);
  } catch (err: any) {
    console.error("plan error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
