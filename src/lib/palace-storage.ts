export type StoredPalace = {
  id: string;
  name: string;
  locations: string[];
  cards: number;
  strength: number;
  custom: true;
};

const STORAGE_KEY = "palace52.savedPalaces";
const STORAGE_EVENT = "palace52:saved-palaces-changed";

function isStoredPalace(value: unknown): value is StoredPalace {
  if (!value || typeof value !== "object") return false;

  const palace = value as Partial<StoredPalace>;
  return (
    typeof palace.id === "string" &&
    typeof palace.name === "string" &&
    Array.isArray(palace.locations) &&
    palace.locations.every((location) => typeof location === "string")
  );
}

function emitSavedPalacesChanged() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function readSavedPalaces(): StoredPalace[] {
  if (typeof window === "undefined") return [];

  try {
    const rawPalaces = window.localStorage.getItem(STORAGE_KEY);
    if (!rawPalaces) return [];

    const parsed = JSON.parse(rawPalaces);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredPalace).map((palace) => ({
      ...palace,
      locations: palace.locations.map((location) => location.trim()).filter(Boolean),
      cards: Number.isFinite(palace.cards) ? palace.cards : 52,
      strength: Number.isFinite(palace.strength) ? palace.strength : 0,
      custom: true
    }));
  } catch {
    return [];
  }
}

export function upsertSavedPalace(palace: StoredPalace) {
  if (typeof window === "undefined") return;

  const savedPalaces = readSavedPalaces();
  const nextPalace = {
    ...palace,
    locations: palace.locations.map((location) => location.trim()).filter(Boolean),
    custom: true as const
  };
  const existingIndex = savedPalaces.findIndex((savedPalace) => savedPalace.id === nextPalace.id);
  const nextPalaces =
    existingIndex >= 0
      ? savedPalaces.map((savedPalace, index) => (index === existingIndex ? nextPalace : savedPalace))
      : [...savedPalaces, nextPalace];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPalaces));
  emitSavedPalacesChanged();
}

export function removeSavedPalace(palaceId: string) {
  if (typeof window === "undefined") return;

  const nextPalaces = readSavedPalaces().filter((palace) => palace.id !== palaceId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPalaces));
  emitSavedPalacesChanged();
}

export function subscribeToSavedPalaces(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}
