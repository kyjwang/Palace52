"use client";

import { useState, useTransition, type DragEvent } from "react";
import { ArrowDown, ArrowUp, BookOpen, GripVertical, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { savePaoDeck } from "@/app/actions/card-images";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Panel } from "@/components/ui/product";
import { fullDeck, type PlayingCard } from "@/lib/cards";

const starterLocations = ["Front door", "Hallway mirror", "Kitchen sink", "Living room sofa", "Bedroom door", "Balcony chair"];
type PaoRow = { cardCode: string; person: string; action: string; object: string };

const blankPaoRows: PaoRow[] = fullDeck.map((card) => ({
  cardCode: card.code,
  person: "",
  action: "",
  object: ""
}));

export function PalaceBuilder() {
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState(starterLocations);
  const [paoRows, setPaoRows] = useState<PaoRow[]>(blankPaoRows);
  const [routeEditorOpen, setRouteEditorOpen] = useState(false);
  const [deckEditorOpen, setDeckEditorOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paoSaveState, setPaoSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [draggedLocationIndex, setDraggedLocationIndex] = useState<number | null>(null);
  const completedRouteLocations = locations.filter((location) => location.trim()).length;
  const completedPaoCards = paoRows.filter((row) => row.person.trim() && row.action.trim() && row.object.trim()).length;

  function addLocation() {
    const nextIndex = locations.length;
    setLocations([...locations, ""]);
    setSaved(false);

    requestAnimationFrame(() => {
      document.getElementById(`route-location-${nextIndex}`)?.focus();
    });
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, locationIndex) => locationIndex !== index));
    setSaved(false);
  }

  function updateLocation(index: number, value: string) {
    setLocations(locations.map((location, locationIndex) => (locationIndex === index ? value : location)));
    setSaved(false);
  }

  function moveLocation(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= locations.length) return;
    moveLocationToIndex(index, target);
  }

  function moveLocationToIndex(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= locations.length || toIndex >= locations.length) {
      return;
    }

    const next = [...locations];
    const [movedLocation] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, movedLocation);
    setLocations(next);
    setSaved(false);
  }

  function startLocationDrag(event: DragEvent<HTMLElement>, index: number) {
    setDraggedLocationIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  }

  function dropLocation(event: DragEvent<HTMLElement>, targetIndex: number) {
    event.preventDefault();
    const rawIndex = event.dataTransfer.getData("text/plain");
    const sourceIndex = rawIndex ? Number(rawIndex) : draggedLocationIndex;

    if (typeof sourceIndex === "number" && Number.isInteger(sourceIndex)) {
      moveLocationToIndex(sourceIndex, targetIndex);
    }

    setDraggedLocationIndex(null);
  }

  function updatePaoRow(cardCode: string, field: "person" | "action" | "object", value: string) {
    setPaoRows((current) => {
      return current.map((row) => (row.cardCode === cardCode ? { ...row, [field]: value } : row));
    });
    setPaoSaveState("idle");
  }

  function clearPaoRow(cardCode: string) {
    setPaoRows((current) => current.map((row) => (row.cardCode === cardCode ? { ...row, person: "", action: "", object: "" } : row)));
    setPaoSaveState("idle");
  }

  function saveFullPaoDeck() {
    startTransition(async () => {
      try {
        await savePaoDeck({
          cards: paoRows.map((row) => {
            const card = fullDeck.find((item) => item.code === row.cardCode) ?? fullDeck[0];

            return {
              rank: card.rank,
              suit: card.suit,
              person: row.person,
              action: row.action,
              object: row.object
            };
          })
        });
        setPaoSaveState("saved");
      } catch {
        setPaoSaveState("error");
      }
    });
  }

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <p className="text-sm font-semibold text-[var(--accent)]">Introduction</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Learning</h1>
        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
          <p className="text-sm text-[var(--muted)]">
            New to routes or PAO? Start with the guide before building your first full deck system.
          </p>
          <ButtonLink href="/build-palace/how-to-create-your-pao-and-routes" variant="secondary" className="mt-3 w-full">
            <BookOpen className="size-4" />
            Learn PAO and routes
          </ButtonLink>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Build your own Palace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create a route</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Open the table, name your palace, add route locations, then save the route.
            </p>
          </div>
          <Button type="button" onClick={() => setRouteEditorOpen((open) => !open)} className="h-11 md:shrink-0">
            <Plus className="size-4" />
            {routeEditorOpen ? "Close table" : "Create route"}
          </Button>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-[var(--muted)]">Custom route</p>
            <p className="mt-1 text-2xl font-semibold">{completedRouteLocations}/18 locations mapped</p>
          </div>
          <p className="rounded-md bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]">Saved routes appear in My Palace and Play</p>
        </div>

        {!routeEditorOpen ? (
          <p className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--card-muted)] px-3 py-4 text-sm text-[var(--muted)]">
            Click Create route to fill the spreadsheet-style template.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--card-muted)] text-[var(--muted)]">
                  <tr>
                    <th className="w-24 px-3 py-2 font-medium">Order</th>
                    <th className="px-3 py-2 font-medium">Location</th>
                    <th className="px-3 py-2 font-medium">Memory cue</th>
                    <th className="w-28 px-3 py-2 font-medium">Move</th>
                    <th className="w-16 px-3 py-2 font-medium">Clear</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {locations.map((location, index) => (
                    <tr
                      key={`route-location-${index}`}
                      draggable
                      onDragStart={(event) => startLocationDrag(event, index)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(event) => dropLocation(event, index)}
                      onDragEnd={() => setDraggedLocationIndex(null)}
                      className={`bg-[var(--card)] transition ${
                        draggedLocationIndex === index ? "opacity-60 ring-2 ring-[var(--accent)]/40" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 cursor-grab text-[var(--muted)] active:cursor-grabbing" aria-label={`Drag ${location || "route location"}`} />
                          <span className="font-mono font-semibold">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          id={`route-location-${index}`}
                          value={location}
                          onChange={(event) => updateLocation(index, event.target.value)}
                          placeholder="Route location"
                          className="h-9"
                        />
                      </td>
                      <td className="px-3 py-2 text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          Place one vivid card image here.
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => moveLocation(index, -1)}
                            disabled={index === 0}
                            className="size-8 px-0"
                            aria-label={`Move ${location || "route location"} up`}
                            title="Move up"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => moveLocation(index, 1)}
                            disabled={index === locations.length - 1}
                            className="size-8 px-0"
                            aria-label={`Move ${location || "route location"} down`}
                            title="Move down"
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Button type="button" variant="ghost" onClick={() => removeLocation(index)} className="size-8 px-0 text-red-600" aria-label={`Remove ${location || "route location"}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card-muted)] p-3 md:flex-row md:items-center">
              <div className="text-sm text-[var(--muted)]">
                Drag rows or use the arrow buttons to set the route order.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={addLocation} className="h-11 md:shrink-0">
                  <Plus className="size-4" />
                  Add location
                </Button>
                <Button type="button" onClick={() => setSaved(true)} disabled={completedRouteLocations === 0} variant="secondary" className="h-11 md:shrink-0">
                  <Save className="size-4" />
                  Save route
                </Button>
              </div>
            </div>

            {saved && <p className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-medium text-[var(--accent)]">Route saved locally for preview.</p>}
          </div>
        )}
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Build your own PAO</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create a PAO deck</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Open the table, fill person, action, and object for each card, then save the deck.
            </p>
          </div>
          <Button type="button" onClick={() => setDeckEditorOpen((open) => !open)} className="h-11 md:shrink-0">
            <Plus className="size-4" />
            {deckEditorOpen ? "Close table" : "Create PAO deck"}
          </Button>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-[var(--muted)]">Custom PAO deck</p>
            <p className="mt-1 text-2xl font-semibold">{completedPaoCards}/52 cards mapped</p>
          </div>
          <p className="rounded-md bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]">Saved decks appear in My Palace and Play</p>
        </div>

        {!deckEditorOpen ? (
          <p className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--card-muted)] px-3 py-4 text-sm text-[var(--muted)]">
            Click Create PAO deck to fill the spreadsheet-style template.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--card-muted)] text-[var(--muted)]">
                  <tr>
                    <th className="w-32 px-3 py-2 font-medium">Card</th>
                    <th className="px-3 py-2 font-medium">Suit</th>
                    <th className="px-3 py-2 font-medium">Person</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">Object</th>
                    <th className="w-16 px-3 py-2 font-medium">Clear</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {paoRows.map((row) => {
                    const card = fullDeck.find((item) => item.code === row.cardCode) ?? fullDeck[0];

                    return (
                      <tr key={row.cardCode} className="bg-[var(--card)]">
                        <td className="px-3 py-2">
                          <MiniPlayingCard card={card} />
                        </td>
                        <td className="px-3 py-2 text-[var(--muted)]">{suitLabel(card.suit)}</td>
                        <td className="px-3 py-2">
                          <Input value={row.person} onChange={(event) => updatePaoRow(row.cardCode, "person", event.target.value)} placeholder="Person" className="h-9" />
                        </td>
                        <td className="px-3 py-2">
                          <Input value={row.action} onChange={(event) => updatePaoRow(row.cardCode, "action", event.target.value)} placeholder="Action" className="h-9" />
                        </td>
                        <td className="px-3 py-2">
                          <Input value={row.object} onChange={(event) => updatePaoRow(row.cardCode, "object", event.target.value)} placeholder="Object" className="h-9" />
                        </td>
                        <td className="px-3 py-2">
                          <Button type="button" variant="ghost" onClick={() => clearPaoRow(row.cardCode)} className="size-8 px-0 text-red-600" aria-label={`Clear PAO for ${card.label}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="text-sm text-[var(--muted)]">
                Fill all three fields for each card you want in the deck.
              </div>
              <Button type="button" onClick={saveFullPaoDeck} disabled={isPending || completedPaoCards === 0} className="h-11 md:shrink-0">
                <Save className="size-4" />
                {isPending ? "Saving deck" : "Save PAO deck"}
              </Button>
            </div>

            {paoSaveState === "saved" && (
              <p className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-medium text-[var(--accent)]">
                PAO deck saved. You can choose it in My Palace and Play.
              </p>
            )}
            {paoSaveState === "error" && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                Could not save this PAO deck. Try again.
              </p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function suitLabel(suit: string) {
  return suit.charAt(0) + suit.slice(1).toLowerCase();
}

function MiniPlayingCard({ card }: { card: PlayingCard }) {
  const rank = card.shortLabel.replace(/[^\dA-Z]/g, "");
  const suit = card.shortLabel.replace(/[\dA-Z]/g, "");
  const tone = card.color === "red" ? "text-red-600" : "text-[#17151f]";

  return (
    <div className={`relative h-16 w-11 rounded-md border border-[#d8c38c] bg-[#fffaf1] shadow-sm ${tone}`} aria-label={card.label}>
      <div className="absolute left-1 top-1 flex flex-col items-center font-mono text-[11px] font-bold leading-none">
        <span>{rank}</span>
        <span className="mt-0.5 text-sm">{suit}</span>
      </div>
      <div className="flex h-full items-center justify-center text-2xl leading-none">{suit}</div>
      <div className="absolute bottom-1 right-1 flex rotate-180 flex-col items-center font-mono text-[11px] font-bold leading-none">
        <span>{rank}</span>
        <span className="mt-0.5 text-sm">{suit}</span>
      </div>
    </div>
  );
}
