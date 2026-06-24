import { Save } from "lucide-react";
import { upsertCardImage } from "@/app/actions/card-images";
import { CardBadge } from "@/components/app/card-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/product";
import { fullDeck } from "@/lib/cards";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  if (!hasRequiredAppConfig()) return null;

  const user = await requireCurrentUser();
  const images = await getPrisma().cardImage.findMany({
    where: { userId: user.id }
  });
  const imageByCard = new Map(images.map((image) => [`${image.rank}-${image.suit}`, image]));

  return (
    <div className="space-y-6">
      <PageHeader
        label="Card image system"
        title="Give every card a vivid identity"
        description="Use person-action-object fields or a custom image prompt. Personal, strange, moving images are easiest to recall."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {fullDeck.map((card) => {
          const image = imageByCard.get(`${card.rank}-${card.suit}`);
          return (
            <Card key={card.code}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardBadge label={card.shortLabel} color={card.color} />
                  <div>
                    <CardTitle>{card.label}</CardTitle>
                    <p className="text-sm text-[var(--muted)]">{image?.imagePrompt ?? "Create an image that feels instantly recognizable."}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form action={upsertCardImage} className="grid gap-3 md:grid-cols-3">
                  <input type="hidden" name="rank" value={card.rank} />
                  <input type="hidden" name="suit" value={card.suit} />
                  <div className="space-y-2">
                    <Label htmlFor={`${card.code}-person`}>Person</Label>
                    <Input id={`${card.code}-person`} name="person" defaultValue={image?.person ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${card.code}-action`}>Action</Label>
                    <Input id={`${card.code}-action`} name="action" defaultValue={image?.action ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${card.code}-object`}>Object</Label>
                    <Input id={`${card.code}-object`} name="object" defaultValue={image?.object ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor={`${card.code}-imagePrompt`}>Image description</Label>
                    <Textarea id={`${card.code}-imagePrompt`} name="imagePrompt" defaultValue={image?.imagePrompt ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor={`${card.code}-notes`}>Notes</Label>
                    <Input id={`${card.code}-notes`} name="notes" defaultValue={image?.notes ?? ""} />
                  </div>
                  <div className="md:col-span-3">
                    <Button type="submit" variant="secondary">
                      <Save className="size-4" />
                      Save card image
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
