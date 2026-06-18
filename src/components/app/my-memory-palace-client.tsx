"use client";

import { useState } from "react";
import { Castle, ChevronDown, Orbit, Pencil, Trash2, Wand2 } from "lucide-react";
import { PublicShell } from "@/components/app/public-shell";
import { CardBadge } from "@/components/app/card-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/product";
import { paoDeckPresets, sampleUserPalaces, suitOrder } from "@/lib/sample-palace";

const suitLabels: Record<string, string> = {
  CLUBS: "Clubs",
  DIAMONDS: "Diamonds",
  HEARTS: "Hearts",
  SPADES: "Spades"
};

export function MyMemoryPalaceClient({ embedded = false }: { embedded?: boolean }) {
  const [deckIndex, setDeckIndex] = useState(0);
  const [palaces, setPalaces] = useState(sampleUserPalaces);
  const [expandedPalace, setExpandedPalace] = useState<string | null>(null);
  const [editingPalace, setEditingPalace] = useState<string | null>(null);
  const [deckSelectorOpen, setDeckSelectorOpen] = useState(false);
  const activeDeck = paoDeckPresets[deckIndex];

  function chooseDeck(index: number) {
    setDeckIndex(index);
    setDeckSelectorOpen(false);
  }

  function renamePalace(currentName: string, nextName: string) {
    setPalaces((current) =>
      current.map((palace) => (palace.name === currentName ? { ...palace, name: nextName } : palace))
    );
    setExpandedPalace((current) => (current === currentName ? nextName : current));
    setEditingPalace((current) => (current === currentName ? nextName : current));
  }

  function renameLocation(palaceName: string, locationIndex: number, nextName: string) {
    setPalaces((current) =>
      current.map((palace) =>
        palace.name === palaceName
          ? {
              ...palace,
              locations: palace.locations.map((location, index) => (index === locationIndex ? nextName : location))
            }
          : palace
      )
    );
  }

  function removeLocation(palaceName: string, locationIndex: number) {
    setPalaces((current) =>
      current.map((palace) =>
        palace.name === palaceName
          ? {
              ...palace,
              locations: palace.locations.filter((_, index) => index !== locationIndex),
              cards: Math.max(0, palace.cards - 1)
            }
          : palace
      )
    );
  }

  function moveLocation(palaceName: string, locationIndex: number, direction: -1 | 1) {
    setPalaces((current) =>
      current.map((palace) => {
        if (palace.name !== palaceName) return palace;
        const target = locationIndex + direction;
        if (target < 0 || target >= palace.locations.length) return palace;
        const locations = [...palace.locations];
        [locations[locationIndex], locations[target]] = [locations[target], locations[locationIndex]];
        return { ...palace, locations };
      })
    );
  }

  const content = (
    <div className="space-y-6">
        <PageHeader
          label={embedded ? "Standard route and PAO library" : "My memory palace"}
          title={embedded ? "Starter routes and PAO decks" : "My Palace and PAO"}
          description={
            embedded
              ? "Use these three 18-loci routes and three preset PAO decks as the default reference while you build your own saved system."
              : "Keep palace routes separate from your PAO deck. Open a route to see all places, then use the PAO table as your card image reference."
          }
        />

        <section className="space-y-3">
          <div>
            <p className="text-sm font-medium text-[var(--accent)]">Palace routes</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose a route to inspect</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {palaces.map((palace) => (
              <Card key={palace.name} className="cursor-pointer transition hover:border-[var(--accent)]" onClick={() => setExpandedPalace(expandedPalace === palace.name ? null : palace.name)}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    {editingPalace === palace.name ? (
                      <Input
                        value={palace.name}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => renamePalace(palace.name, event.target.value)}
                        className="h-9"
                        aria-label="Route name"
                      />
                    ) : (
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Castle className="size-5 text-[var(--accent)]" />
                        {palace.name}
                      </CardTitle>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedPalace(palace.name);
                        setEditingPalace(editingPalace === palace.name ? null : palace.name);
                      }}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                      aria-label={`Edit ${palace.name}`}
                    >
                      <Pencil className="size-3.5" />
                      {editingPalace === palace.name ? "Done" : "Edit"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-[var(--muted)]">Route locations</p>
                    <p className="mt-1 text-3xl font-semibold">{palace.locations.length}/18</p>
                  </div>
                  <div className={expandedPalace === palace.name ? "mt-4 max-h-80 space-y-1 overflow-y-auto pr-1" : "mt-4 flex flex-wrap gap-2"}>
                    {(expandedPalace === palace.name ? palace.locations : palace.locations.slice(0, 6)).map((location, index) => (
                      <div key={`${palace.name}-${location}-${index}`} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-2 py-1.5 text-[var(--foreground)]">
                        <span className="w-6 shrink-0 font-mono text-xs text-[var(--accent)]">{index + 1}</span>
                        {editingPalace === palace.name && expandedPalace === palace.name ? (
                          <>
                            <Input
                              value={location}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => renameLocation(palace.name, index, event.target.value)}
                              className="h-8 min-w-0 flex-1"
                              aria-label={`Location ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                moveLocation(palace.name, index, -1);
                              }}
                              disabled={index === 0}
                              className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs disabled:opacity-40"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                moveLocation(palace.name, index, 1);
                              }}
                              disabled={index === palace.locations.length - 1}
                              className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs disabled:opacity-40"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeLocation(palace.name, index);
                              }}
                              className="flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--card)]"
                              aria-label={`Remove ${location}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        ) : (
                          <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">{location}</span>
                        )}
                      </div>
                    ))}
                    {expandedPalace !== palace.name && palace.locations.length > 6 && (
                      <div className="rounded-md bg-[var(--ink)] px-2 py-1.5 text-sm font-medium text-[var(--foreground)]">+{palace.locations.length - 6} / click</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Orbit className="size-5 text-[var(--accent)]" />
                PAO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <p className="flex-1 text-sm leading-6 text-[var(--muted)]">
                  PAO means Person, Action, Object. Choose a PAO deck, then scan the card table below as a clean image reference.
                </p>
                <div className="relative w-full lg:max-w-md">
                  <Button
                    type="button"
                    onClick={() => setDeckSelectorOpen((open) => !open)}
                    className="h-11 w-full justify-between"
                    aria-expanded={deckSelectorOpen}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Wand2 className="size-4" />
                      Choose PAO deck
                    </span>
                    <ChevronDown className={`size-4 transition ${deckSelectorOpen ? "rotate-180" : ""}`} />
                  </Button>
                  {deckSelectorOpen && (
                    <div className="absolute left-0 right-0 top-12 z-20 max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow)]">
                      {paoDeckPresets.map((preset, index) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => chooseDeck(index)}
                          className={`w-full rounded-md px-3 py-2 text-left transition hover:bg-[var(--card-muted)] ${
                            index === deckIndex ? "bg-[var(--accent-soft)]" : ""
                          }`}
                        >
                          <span className="block text-sm font-semibold">{preset.name}</span>
                          <span className="mt-1 block text-sm text-[var(--muted)]">{preset.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 text-sm">
                <p className="truncate font-semibold">{activeDeck.name}</p>
                <p className="text-[var(--muted)]">{activeDeck.description}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-2">
          {suitOrder.map((suit) => (
            <Card key={suit}>
              <CardHeader className="p-3">
                <CardTitle className="flex items-center justify-between text-base">
                  {suitLabels[suit]}
                  <span className="font-mono text-xs font-medium text-[var(--muted)]">13</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="hidden grid-cols-[58px_minmax(140px,1fr)_96px_110px] gap-2 border-b border-[var(--border)] px-2 pb-2 text-[11px] font-semibold uppercase tracking-normal text-[var(--muted)] md:grid">
                  <span>Card</span>
                  <span>Person</span>
                  <span>Action</span>
                  <span>Object</span>
                </div>
                <div className="space-y-1.5 md:space-y-0">
                  {activeDeck.deck
                    .filter((entry) => entry.card.suit === suit)
                    .map((entry, index) => (
                      <div
                        key={entry.card.code}
                        className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-2 md:grid md:grid-cols-[58px_minmax(140px,1fr)_96px_110px] md:items-center md:gap-2 md:rounded-none md:border-x-0 md:border-t-0 md:bg-[var(--card)] md:px-2 md:py-1.5"
                      >
                        <div className="flex items-center gap-2 md:block">
                          <CardBadge label={entry.card.shortLabel} color={entry.card.color} className="h-7 min-w-8 rounded px-1 text-[11px] shadow-none" />
                          <div className="min-w-0 md:hidden">
                            <p className="truncate text-sm font-semibold">{entry.card.label}</p>
                          </div>
                        </div>
                        <p className="hidden min-w-0 truncate text-xs font-semibold md:block">{entry.person}</p>
                        <p className="hidden min-w-0 truncate text-xs md:block">{entry.action}</p>
                        <p className="hidden min-w-0 truncate text-xs md:block">{entry.object}</p>

                        <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] md:hidden">
                          <div className="min-w-0 rounded bg-[var(--card)] px-2 py-1">
                            <p className="font-mono text-[10px] text-[var(--muted)]">P</p>
                            <p className="truncate font-semibold">{entry.person}</p>
                          </div>
                          <div className="min-w-0 rounded bg-[var(--card)] px-2 py-1">
                            <p className="font-mono text-[10px] text-[var(--muted)]">A</p>
                            <p className="truncate">{entry.action}</p>
                          </div>
                          <div className="min-w-0 rounded bg-[var(--card)] px-2 py-1">
                            <p className="font-mono text-[10px] text-[var(--muted)]">O</p>
                            <p className="truncate">{entry.object}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </section>
    </div>
  );

  if (embedded) return content;

  return (
    <PublicShell>
      {content}
    </PublicShell>
  );
}
