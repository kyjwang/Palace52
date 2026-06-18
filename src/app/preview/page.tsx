import { BarChart3, Brain, Castle, CheckCircle2, Clock3, Images, Play, Trophy } from "lucide-react";
import { CardBadge } from "@/components/app/card-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Best score", value: "47/52", icon: Trophy },
  { label: "Average accuracy", value: "82%", icon: CheckCircle2 },
  { label: "Completed sessions", value: "18", icon: BarChart3 },
  { label: "Due reviews", value: "9", icon: Brain }
];

const route = ["Front door", "Kitchen sink", "Sofa", "Bookshelf", "Bedroom door", "Balcony"];

const studyCards = [
  { label: "A♠", color: "black" as const, image: "Detective unlocking a silver compass", place: "Front door" },
  { label: "7♥", color: "red" as const, image: "Singer juggling a lantern", place: "Kitchen sink" },
  { label: "K♣", color: "black" as const, image: "Astronaut climbing a rope", place: "Sofa" },
  { label: "3♦", color: "red" as const, image: "Chef slicing a giant mirror", place: "Bookshelf" }
];

const mistakes = [
  "Queen of Hearts appeared two positions late.",
  "Five of Clubs was missing from the hallway image.",
  "Nine of Diamonds replaced Jack of Spades at position 31."
];

export default function PreviewPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f6f7f3]">
      <header className="border-b border-[#dfe3d7] bg-[#101411] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#0f7a5f] font-mono font-bold">52</div>
            <div>
              <p className="text-sm font-semibold">Palace52 Preview</p>
              <p className="text-xs text-white/55">Frontend-only product snapshot</p>
            </div>
          </div>
          <ButtonLink href="/" variant="secondary">Back home</ButtonLink>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#dfe3d7] bg-white p-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-[#0f7a5f]">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Train a full deck through familiar places</h1>
              <p className="mt-2 max-w-2xl text-[#6f7468]">
                This preview shows the intended interface before connecting Auth.js and PostgreSQL.
              </p>
            </div>
            <ButtonLink href="/preview">
              <Play className="size-4" />
              Preview session
            </ButtonLink>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6f7468]">{metric.label}</p>
                      <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                    </div>
                    <Icon className="size-5 text-[#0f7a5f]" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Castle className="size-5 text-[#0f7a5f]" />
                Home Palace route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {route.map((location, index) => (
                  <div key={location} className="rounded-md border border-[#edf0e8] bg-[#fbfcf8] p-3">
                    <p className="font-mono text-sm text-[#0f7a5f]">#{index + 1}</p>
                    <p className="mt-1 font-medium">{location}</p>
                    <p className="mt-1 text-sm text-[#6f7468]">Bright, exaggerated, and easy to revisit.</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="size-5 text-[#0f7a5f]" />
                Study mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {studyCards.map((card, index) => (
                  <div key={card.label} className="rounded-lg border border-[#edf0e8] bg-[#fbfcf8] p-4">
                    <div className="flex items-center justify-between">
                      <CardBadge label={card.label} color={card.color} />
                      <span className="font-mono text-sm text-[#6f7468]">#{index + 1}</span>
                    </div>
                    <p className="mt-4 text-sm font-medium">{card.place}</p>
                    <p className="mt-1 text-sm leading-6 text-[#6f7468]">{card.image}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-5 text-[#0f7a5f]" />
                Current session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-[#101411] p-4 text-white">
                <p className="text-sm text-white/55">Score</p>
                <p className="mt-1 text-4xl font-semibold">43/52</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[82%] rounded-full bg-[#28b88d]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-[#f6f7f3] p-3">
                  <p className="text-[#6f7468]">Study</p>
                  <p className="font-mono font-semibold">4:18</p>
                </div>
                <div className="rounded-md bg-[#f6f7f3] p-3">
                  <p className="text-[#6f7468]">Recall</p>
                  <p className="font-mono font-semibold">6:44</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mistake analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mistakes.map((mistake) => (
                <div key={mistake} className="rounded-md bg-[#fbfcf8] p-3 text-sm leading-6 text-[#394037]">
                  {mistake}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Q♥", "5♣", "9♦"].map((card) => (
                <div key={card} className="flex items-center justify-between rounded-md bg-[#eef8f3] px-3 py-2">
                  <span className="font-mono font-semibold text-[#0f7a5f]">{card}</span>
                  <span className="text-sm text-[#6f7468]">Due now</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
