import { Castle, MapPin } from "lucide-react";
import { ensureStarterContent } from "@/app/actions/onboarding";
import { addPalaceLocation, createPalace } from "@/app/actions/palaces";
import { MyMemoryPalaceClient } from "@/components/app/my-memory-palace-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getPaoDeckOptions } from "@/lib/pao-decks";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function PalacesPage() {
  if (!hasRequiredAppConfig()) return null;

  await ensureStarterContent();
  const user = await requireCurrentUser();
  const db = getPrisma();
  const [palaces, cardImages] = await Promise.all([
    db.palace.findMany({
      where: { userId: user.id },
      include: { locations: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "asc" }
    }),
    db.cardImage.findMany({
      where: { userId: user.id },
      select: {
        rank: true,
        suit: true,
        person: true,
        action: true,
        object: true,
        imagePrompt: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);
  const paoDeckOptions = getPaoDeckOptions(cardImages);

  return (
    <div className="space-y-8">
      <MyMemoryPalaceClient embedded paoDeckOptions={paoDeckOptions} />

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Saved route builder</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your editable palace routes</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            These routes are stored on your account. Aim for 18 distinct loci when building a full 52-card PAO route.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create palace</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createPalace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Childhood home" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A route from the front gate to the attic." />
              </div>
              <Button type="submit" className="w-full">
                <Castle className="size-4" />
                Create palace
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {palaces.map((palace) => (
            <Card key={palace.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <CardTitle>{palace.name}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--muted)]">{palace.description ?? "No description yet."}</p>
                  </div>
                  <span className="rounded-md bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent)]">{palace.locations.length}/18 loci</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2 md:grid-cols-2">
                  {palace.locations.map((location) => (
                    <div key={location.id} className="flex gap-3 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--card)] font-mono text-sm text-[var(--accent)]">{location.order}</div>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-[var(--muted)]">{location.cue ?? location.description ?? "Add a vivid sensory cue."}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form action={addPalaceLocation} className="grid gap-3 rounded-md border border-dashed border-[var(--border-strong)] p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input type="hidden" name="palaceId" value={palace.id} />
                  <Input name="name" required placeholder="New location" />
                  <Input name="description" placeholder="Description" />
                  <Input name="cue" placeholder="Sensory cue" />
                  <Button type="submit">
                    <MapPin className="size-4" />
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
