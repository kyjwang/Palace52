import { Castle, MapPin } from "lucide-react";
import { addPalaceLocation, createPalace } from "@/app/actions/palaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function PalacesPage() {
  if (!hasRequiredAppConfig()) return null;

  const user = await requireCurrentUser();
  const palaces = await getPrisma().palace.findMany({
    where: { userId: user.id },
    include: { locations: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        label="Memory palace builder"
        title="Design routes you can walk mentally"
        description="Build 18 distinct loci. Each PAO image gets placed into the next location during study."
      />

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
                    <p className="mt-1 text-sm text-[#6f7468]">{palace.description ?? "No description yet."}</p>
                  </div>
                  <span className="rounded-md bg-[#eef2e8] px-3 py-1 text-sm font-medium">{palace.locations.length} locations</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2 md:grid-cols-2">
                  {palace.locations.map((location) => (
                    <div key={location.id} className="flex gap-3 rounded-md border border-[#edf0e8] bg-[#fbfcf8] p-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white font-mono text-sm text-[#0f7a5f]">{location.order}</div>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-[#6f7468]">{location.cue ?? location.description ?? "Add a vivid sensory cue."}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form action={addPalaceLocation} className="grid gap-3 rounded-md border border-dashed border-[#dfe3d7] p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
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
    </div>
  );
}
