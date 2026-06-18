import { ArrowRight, Brain, Castle, Clock3, Spade, Trophy } from "lucide-react";
import { PublicShell } from "@/components/app/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { MetricCard, Panel } from "@/components/ui/product";

const pillars = [
  {
    title: "Build a route",
    body: "Create 18 familiar locations that can hold a full PAO deck.",
    icon: Castle
  },
  {
    title: "Lock your PAO",
    body: "Give every card a person, action, and object you can picture instantly.",
    icon: Brain
  },
  {
    title: "Train under time",
    body: "Study, recall, score, and turn misses into focused review.",
    icon: Clock3
  }
];

export default function HomePage() {
  return (
    <PublicShell>
      <div className="space-y-8 md:space-y-10">
        <section className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-stretch">
          <Panel className="p-6 md:p-8">
            <p className="text-sm font-semibold text-[var(--accent)]">Palace52</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Master 52 Cards
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
              Practice memory palace routes, PAO images, timed recall, and weak-card review in one focused system.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/play" className="h-11">
                Start training
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/training-academy" variant="secondary" className="h-11">
                Learn method
              </ButtonLink>
            </div>
          </Panel>

          <Panel className="bg-[var(--ink)] p-5 text-white">
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Challenge format</p>
                  <Spade className="size-5 text-[var(--accent)]" />
                </div>
                <p className="mt-4 font-mono text-5xl font-semibold">52</p>
                <p className="mt-2 text-lg font-semibold">cards, 18 route locations</p>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Three cards per location. One final card. Clean enough to practice, strict enough to improve.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["PAO", "Route", "Recall"].map((item) => (
                  <div key={item} className="rounded-md border border-white/10 bg-white/[0.06] p-3">
                    <p className="font-mono text-xs text-white/50">mode</p>
                    <p className="mt-1 text-sm font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Panel key={pillar.title} className="p-5">
                <Icon className="size-5 text-[var(--accent)]" />
                <h2 className="mt-4 text-xl font-semibold tracking-tight">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{pillar.body}</p>
              </Panel>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Route target" value="18" helper="locations for a full PAO deck" icon={<Castle className="size-5" />} />
          <MetricCard label="Deck system" value="52" helper="PAO entries to build" icon={<Brain className="size-5" />} />
          <MetricCard label="Training loop" value="4" helper="study, recall, score, review" icon={<Trophy className="size-5" />} tone="accent" />
        </section>
      </div>
    </PublicShell>
  );
}
