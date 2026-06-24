import {
  ArrowRight,
  Brain,
  Castle,
  CheckCircle2,
  Clock3,
  Layers3,
  Route,
  ShieldCheck,
  Spade,
  Trophy
} from "lucide-react";
import { CardBadge } from "@/components/app/card-badge";
import { PublicShell } from "@/components/app/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { MetricCard, Panel } from "@/components/ui/product";
import { getCurrentUser } from "@/lib/auth";
import { cardFromCode } from "@/lib/cards";

const methodSteps = [
  {
    title: "Create 18 places",
    body: "Use a real route you already know, then make every location distinct.",
    icon: Route
  },
  {
    title: "Build 52 PAO images",
    body: "Assign each card a person, action, and object that belongs together.",
    icon: Brain
  },
  {
    title: "Recall under pressure",
    body: "Run timed sessions, mark mistakes, and review the cards that break.",
    icon: Clock3
  }
];

const previewCards = [
  { card: "AS", person: "Darth Vader", action: "choking", object: "helmet" },
  { card: "KH", person: "Superman", action: "flying", object: "cape" },
  { card: "7C", person: "Harry Potter", action: "casting", object: "wand" }
];

const features = [
  {
    title: "Memory palace builder",
    body: "Turn home, gym, or school routes into ordered loci for full-deck practice.",
    icon: Castle
  },
  {
    title: "Personal PAO system",
    body: "Keep your 52 people, actions, and objects in one editable deck system.",
    icon: Layers3
  },
  {
    title: "Timed play mode",
    body: "Study the shuffled deck, reveal hints when needed, then recall card by card.",
    icon: Spade
  },
  {
    title: "Progress and review",
    body: "Track accuracy, weak cards, previous sessions, and improvement over time.",
    icon: Trophy
  }
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <PublicShell
      user={
        user
          ? {
              username: user.username,
              displayName: user.profile?.displayName,
              avatarColor: user.profile?.avatarColor
            }
          : null
      }
    >
      <div className="space-y-10 md:space-y-12">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_470px] lg:items-stretch">
          <Panel className="flex min-h-[520px] flex-col justify-between p-6 md:p-8 lg:p-10">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Memory palace + PAO training</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
                Memorize a deck with a route.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
                Build your palace, lock in 52 vivid card images, and race your recall until the whole deck sticks.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/register" className="h-11">
                  Create account
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/training-academy" variant="secondary" className="h-11">
                  Learn the method
                </ButtonLink>
              </div>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
              {["18 route locations", "52 PAO mappings", "Timed recall loop"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-[var(--accent)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden bg-[var(--ink)] p-0 text-white">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--accent)]">Live challenge preview</p>
                  <p className="mt-1 text-xs text-white/56">Study phase / card 12 of 52</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-sm">
                  02:18
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[54%] rounded-full bg-[var(--accent)]" />
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/64">Current location</p>
                  <p className="font-mono text-sm text-[var(--accent)]">07 / 18</p>
                </div>
                <p className="mt-3 text-2xl font-semibold">Kitchen sink</p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  Silver sink overflowing while three card images collide in one scene.
                </p>
              </div>

              <div className="grid gap-2">
                {previewCards.map((item) => {
                  const card = cardFromCode(item.card);

                  return (
                    <div key={item.card} className="grid grid-cols-[60px_1fr] gap-3 rounded-md bg-white/[0.06] p-3">
                      <CardBadge
                        label={card?.shortLabel ?? item.card}
                        color={card?.color ?? "black"}
                        className="h-16 min-w-12"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.person}</p>
                        <p className="mt-1 truncate text-xs text-white/58">
                          <span className="font-semibold text-white/82">A:</span> {item.action}
                          <span className="mx-2 text-white/28">/</span>
                          <span className="font-semibold text-white/82">O:</span> {item.object}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  ["Accuracy", "86%"],
                  ["Weak cards", "7"],
                  ["Best time", "4:42"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-white/48">{label}</p>
                    <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Challenge format" value="52" helper="cards in one complete deck" icon={<Spade className="size-5" />} />
          <MetricCard label="Route target" value="18" helper="locations for PAO scenes" icon={<Castle className="size-5" />} />
          <MetricCard
            label="Practice loop"
            value="4"
            helper="study, recall, score, review"
            icon={<Trophy className="size-5" />}
            tone="accent"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-[var(--accent)]">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A simple system, practiced seriously.</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              The app separates the two skills beginners mix together: knowing your route and knowing your card
              images.
            </p>
          </div>

          <div className="grid gap-4">
            {methodSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Panel key={step.title} className="p-5">
                  <div className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/12 text-[var(--accent)]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-[var(--muted)]">0{index + 1}</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight">{step.title}</h3>
                      <p className="mt-2 leading-6 text-[var(--muted)]">{step.body}</p>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Inside the app</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Everything needed for deliberate deck practice.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[var(--muted)]">
              Built for learners who want a repeatable training loop, not scattered notes and random flashcards.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Panel key={feature.title} className="p-5">
                  <Icon className="size-5 text-[var(--accent)]" />
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 leading-6 text-[var(--muted)]">{feature.body}</p>
                </Panel>
              );
            })}
          </div>
        </section>

        <Panel className="grid gap-6 bg-[var(--ink)] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <ShieldCheck className="size-5" />
              <p className="text-sm font-semibold">Your own training system</p>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Start with one route. Build toward the full deck.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/64">
              Create an account, save your PAO deck, and let Palace52 keep the practice loop organized.
            </p>
          </div>
          <ButtonLink href="/register" className="h-11 bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--card-muted)]">
            Start Palace52
            <ArrowRight className="size-4" />
          </ButtonLink>
        </Panel>
      </div>
    </PublicShell>
  );
}
