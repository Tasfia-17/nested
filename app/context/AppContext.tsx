import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_URL } from "@/constants/api";

// ── Types ─────────────────────────────────────────────────────────

export interface Place {
  id: string;
  name: string;
  category: "food" | "fitness" | "chill" | "culture";
  address: string;
  rating: number;
  matchReason: string;
  url: string;
  snippet: string;
  photos: string[];
  distance: number;
  lat?: number;
  lng?: number;
  userRating?: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  city: string;
  tags: string[];
  budget: "$" | "$$" | "$$$";
  maxDistance: number;
  googleConnected: boolean;
}

interface AppState {
  onboardingComplete: boolean;
  profile: UserProfile;
  places: Place[];
  savedIds: string[];
  visitedIds: string[];
  loading: boolean;
  // actions
  completeOnboarding: () => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  fetchPlaces: (category?: string, coords?: { lat: number; lng: number }) => Promise<void>;
  toggleSaved: (id: string) => void;
  toggleVisited: (id: string) => void;
  updatePlaceNote: (id: string, note: string) => void;
  updatePlaceRating: (id: string, rating: number) => void;
}

const defaultProfile: UserProfile = {
  name: "",
  city: "New York",
  tags: [],
  budget: "$$",
  maxDistance: 5,
  googleConnected: false,
};

const AppContext = createContext<AppState>({} as AppState);

const STORAGE_KEYS = {
  onboarding: "@nested/onboarding",
  profile: "@nested/profile",
  saved: "@nested/saved",
  visited: "@nested/visited",
  placeNotes: "@nested/placeNotes",
  placeRatings: "@nested/placeRatings",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [placeNotes, setPlaceNotes] = useState<Record<string, string>>({});
  const [placeRatings, setPlaceRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // ── Hydrate from storage ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [ob, pr, sv, vi, pn, pr2] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.onboarding),
        AsyncStorage.getItem(STORAGE_KEYS.profile),
        AsyncStorage.getItem(STORAGE_KEYS.saved),
        AsyncStorage.getItem(STORAGE_KEYS.visited),
        AsyncStorage.getItem(STORAGE_KEYS.placeNotes),
        AsyncStorage.getItem(STORAGE_KEYS.placeRatings),
      ]);
      if (ob) setOnboardingComplete(JSON.parse(ob));
      if (pr) setProfile(JSON.parse(pr));
      if (sv) setSavedIds(JSON.parse(sv));
      if (vi) setVisitedIds(JSON.parse(vi));
      if (pn) setPlaceNotes(JSON.parse(pn));
      if (pr2) setPlaceRatings(JSON.parse(pr2));
    })();
  }, []);

  // ── Actions ───────────────────────────────────────────────────

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    AsyncStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(true));
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchPlaces = useCallback(
    async (category = "all", coords?: { lat: number; lng: number }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          city: profile.city,
          tags: profile.tags.join(","),
          budget: profile.budget,
          category: category === "all" ? "" : category,
          ...(coords ? { lat: String(coords.lat), lng: String(coords.lng) } : {}),
        });
        const res = await fetch(`${API_URL}/api/places/discover?${params}`);
        const data = await res.json();
        const enriched: Place[] = (data.places ?? []).map((p: Place) => ({
          ...p,
          notes: placeNotes[p.id] ?? "",
          userRating: placeRatings[p.id],
        }));
        setPlaces(enriched);
      } catch (e) {
        console.warn("fetchPlaces error:", e);
      } finally {
        setLoading(false);
      }
    },
    [profile, placeNotes, placeRatings]
  );

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleVisited = useCallback((id: string) => {
    setVisitedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEYS.visited, JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePlaceNote = useCallback((id: string, note: string) => {
    setPlaceNotes((prev) => {
      const next = { ...prev, [id]: note };
      AsyncStorage.setItem(STORAGE_KEYS.placeNotes, JSON.stringify(next));
      return next;
    });
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes: note } : p))
    );
  }, []);

  const updatePlaceRating = useCallback((id: string, rating: number) => {
    setPlaceRatings((prev) => {
      const next = { ...prev, [id]: rating };
      AsyncStorage.setItem(STORAGE_KEYS.placeRatings, JSON.stringify(next));
      return next;
    });
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, userRating: rating } : p))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        profile,
        places,
        savedIds,
        visitedIds,
        loading,
        completeOnboarding,
        updateProfile,
        fetchPlaces,
        toggleSaved,
        toggleVisited,
        updatePlaceNote,
        updatePlaceRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
