"use client";

import { useState, useTransition } from "react";
import { BookOpen, GripVertical, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { saveCardImage } from "@/app/actions/card-images";
import { CardBadge } from "@/components/app/card-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { Panel } from "@/components/ui/product";
import { fullDeck } from "@/lib/cards";

const starterLocations = ["Front door", "Hallway mirror", "Kitchen sink", "Living room sofa", "Bedroom door", "Balcony chair"];
type PaoRow = { cardCode: string; person: string; action: string; object: string };

export function PalaceBuilder() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("My First Palace");
  const [description, setDescription] = useState("A route through familiar rooms at home.");
  const [locations, setLocations] = useState(starterLocations);
  const [newLocation, setNewLocation] = useState("");
  const [selectedCardCode, setSelectedCardCode] = useState("AC");
  const [person, setPerson] = useState("");
  const [action, setAction] = useState("");
  const [object, setObject] = useState("");
  const [paoRows, setPaoRows] = useState<PaoRow[]>([]);
  const [saved, setSaved] = useState(false);
  const [paoSaveState, setPaoSaveState] = useState<"idle" | "saved" | "error">("idle");

  function addLocation() {
    if (!newLocation.trim()) return;
    setLocations([...locations, newLocation.trim()]);
    setNewLocation("");
    setSaved(false);
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, locationIndex) => locationIndex !== index));
    setSaved(false);
  }

  function moveLocation(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= locations.length) return;
    const next = [...locations];
    [next[index], next[target]] = [next[target], next[index]];
    setLocations(next);
    setSaved(false);
  }

  function savePao() {
    if (!person.trim() || !action.trim() || !object.trim()) return;
    const card = fullDeck.find((item) => item.code === selectedCardCode);
    if (!card) return;

    const nextRow = {
      cardCode: selectedCardCode,
      person: person.trim(),
      action: action.trim(),
      object: object.trim()
    };

    setPaoRows((current) => {
      if (current.some((row) => row.cardCode === selectedCardCode)) {
        return current.map((row) => (row.cardCode === selectedCardCode ? nextRow : row));
      }

      return [...current, nextRow].sort((a, b) => a.cardCode.localeCompare(b.cardCode));
    });
    setPerson("");
    setAction("");
    setObject("");
    setPaoSaveState("idle");
    setSaved(false);

    startTransition(async () => {
      try {
        await saveCardImage({
          rank: card.rank,
          suit: card.suit,
          person: nextRow.person,
          action: nextRow.action,
          object: nextRow.object,
          imagePrompt: `${nextRow.person} ${nextRow.action} with ${nextRow.object}`,
          notes: "Custom PAO card image."
        });
        setPaoSaveState("saved");
      } catch {
        setPaoSaveState("error");
      }
    });
  }

  function removePao(cardCode: string) {
    setPaoRows((current) => current.filter((row) => row.cardCode !== cardCode));
    setSaved(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <Panel className="p-5">
        <p className="text-sm font-semibold text-[var(--accent)]">Build a palace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your own route</h1>
        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
          <p className="text-sm text-[var(--muted)]">
            New to routes or PAO? Start with the guide before building your first full deck system.
          </p>
          <ButtonLink href="/build-palace/how-to-create-your-pao-and-routes" variant="secondary" className="mt-3 w-full">
            <BookOpen className="size-4" />
            Learn PAO and routes
          </ButtonLink>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="palace-name">Palace name</Label>
            <Input id="palace-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="palace-description">Description</Label>
            <Textarea id="palace-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-location">New location</Label>
            <div className="flex gap-2">
              <Input
                id="new-location"
                value={newLocation}
                onChange={(event) => setNewLocation(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLocation();
                  }
                }}
                placeholder="Window seat"
              />
              <Button type="button" onClick={addLocation} aria-label="Add location">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <Button type="button" onClick={() => setSaved(true)} className="w-full">
            <Save className="size-4" />
            Save palace
          </Button>
          {saved && <p className="rounded-md bg-[#eef8f3] px-3 py-2 text-sm font-medium text-[#0f7a5f]">Saved locally for preview.</p>}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-[var(--muted)]">Current palace</p>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          </div>
          <div className="rounded-md bg-[#101411] px-4 py-3 text-white">
            <p className="text-xs text-white/55">Capacity</p>
            <p className="font-mono text-lg font-semibold">{locations.length}/18 locations</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {locations.map((location, index) => (
            <div key={`${location}-${index}`} className="rounded-lg border border-[#edf0e8] bg-[#fbfcf8] p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white font-mono text-sm font-semibold text-[#0f7a5f]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{location}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-[#6f7468]">
                    <MapPin className="size-3.5" />
                    Place one vivid card image here.
                  </p>
                </div>
                <GripVertical className="size-4 text-[#899182]" />
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="secondary" onClick={() => moveLocation(index, -1)} disabled={index === 0} className="h-8 px-3">
                  Up
                </Button>
                <Button type="button" variant="secondary" onClick={() => moveLocation(index, 1)} disabled={index === locations.length - 1} className="h-8 px-3">
                  Down
                </Button>
                <Button type="button" variant="ghost" onClick={() => removeLocation(index)} className="h-8 px-3 text-red-600">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      </div>

      <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Panel className="p-5">
          <p className="text-sm font-semibold text-[var(--accent)]">Build your own PAO</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create card images</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pao-card">Card</Label>
              <select
                id="pao-card"
                value={selectedCardCode}
                onChange={(event) => setSelectedCardCode(event.target.value)}
                className="h-10 w-full rounded-md border border-[#dfe3d7] bg-white px-3 text-sm"
              >
                {fullDeck.map((card) => (
                  <option key={card.code} value={card.code}>
                    {card.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="pao-person">Person</Label>
                <Input id="pao-person" value={person} onChange={(event) => setPerson(event.target.value)} placeholder="Famous person" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pao-action">Action</Label>
                <Input id="pao-action" value={action} onChange={(event) => setAction(event.target.value)} placeholder="juggling" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pao-object">Object</Label>
                <Input id="pao-object" value={object} onChange={(event) => setObject(event.target.value)} placeholder="lantern" />
              </div>
            </div>
            <Button type="button" onClick={savePao} disabled={isPending} className="w-full">
              <Save className="size-4" />
              {isPending ? "Saving PAO" : "Save PAO"}
            </Button>
            {paoSaveState === "saved" && (
              <p className="rounded-md bg-[#eef8f3] px-3 py-2 text-sm font-medium text-[#0f7a5f]">
                Saved to your PAO deck.
              </p>
            )}
            {paoSaveState === "error" && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                Could not save this PAO card. Try again.
              </p>
            )}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm text-[#6f7468]">Custom PAO deck</p>
              <h2 className="text-2xl font-semibold">{paoRows.length}/52 cards mapped</h2>
            </div>
            <p className="rounded-md bg-[#f6f7f3] px-3 py-2 text-sm text-[#6f7468]">Saved cards appear in My Palace and Play</p>
          </div>
          {paoRows.length === 0 ? (
            <p className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--card-muted)] px-3 py-4 text-sm text-[var(--muted)]">
              No custom PAO cards saved yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {paoRows.map((row) => {
              const card = fullDeck.find((item) => item.code === row.cardCode) ?? fullDeck[0];
              return (
                <div key={row.cardCode} className="rounded-lg border border-[#edf0e8] bg-[#fbfcf8] p-3">
                  <div className="flex items-start gap-3">
                    <CardBadge label={card.shortLabel} color={card.color} className="h-11 min-w-9 shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{card.label}</p>
                      <div className="mt-1 space-y-0.5 text-xs leading-5 text-[#6f7468]">
                        <p>
                          <strong className="font-semibold text-[#161713]">P:</strong> {row.person}
                        </p>
                        <p>
                          <strong className="font-semibold text-[#161713]">A:</strong> {row.action}
                        </p>
                        <p>
                          <strong className="font-semibold text-[#161713]">O:</strong> {row.object}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePao(row.cardCode)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-red-600 transition hover:bg-white"
                      aria-label={`Delete PAO for ${card.label}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
