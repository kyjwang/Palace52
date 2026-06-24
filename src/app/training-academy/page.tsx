import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Layers3,
  Map,
  Play,
  Route,
  Sparkles,
  Trophy
} from "lucide-react";
import { CardBadge } from "@/components/app/card-badge";
import { PublicShell } from "@/components/app/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/product";
import { getCurrentUser } from "@/lib/auth";

const flowSteps = [
  {
    title: "Build a route",
    detail: "Choose 10-18 real locations you can walk through in order.",
    href: "/build-palace",
    action: "Build route"
  },
  {
    title: "Learn PAO",
    detail: "Understand person, action, and object before memorizing cards.",
    href: "/build-palace/how-to-create-your-pao-and-routes",
    action: "Read guide"
  },
  {
    title: "Create a PAO deck",
    detail: "Fill card images in the spreadsheet-style PAO table.",
    href: "/build-palace",
    action: "Create deck"
  },
  {
    title: "Practice 5 cards",
    detail: "Start with Classic mode and keep the images clear.",
    href: "/play",
    action: "Play 5 cards"
  },
  {
    title: "Scale to 52",
    detail: "Move from 13 to 32 to a full deck only after review feels steady.",
    href: "/play",
    action: "Practice"
  }
];

const lessons = [
  {
    number: 1,
    title: "What is a memory palace?",
    group: "Foundation",
    duration: "8 min",
    goal: "Understand why fixed locations make card images easier to recall.",
    exercise: "Pick one familiar room and list five objects you can see without looking.",
    checkpoint: "Can you name five places in the same order twice?",
    actionHref: "/build-palace/how-to-create-your-pao-and-routes",
    actionLabel: "Learn the method",
    icon: Map
  },
  {
    number: 2,
    title: "Create your first route",
    group: "Foundation",
    duration: "12 min",
    goal: "Turn a real place into a route you can walk forward and backward.",
    exercise: "Create a 10-location route from your front door to your bed.",
    checkpoint: "Can you name 10 locations forward without pausing?",
    actionHref: "/build-palace",
    actionLabel: "Build route",
    icon: Route
  },
  {
    number: 3,
    title: "Learn the PAO image",
    group: "PAO System",
    duration: "10 min",
    goal: "Connect each card to a person, action, and object you can picture fast.",
    exercise: "Make three PAO images for three cards and say them out loud twice.",
    checkpoint: "Can you see the person, action, and object as one scene?",
    actionHref: "/build-palace/how-to-create-your-pao-and-routes",
    actionLabel: "Study PAO",
    icon: Brain
  },
  {
    number: 4,
    title: "Build 13 PAO cards",
    group: "PAO System",
    duration: "20 min",
    goal: "Complete one suit first so the system feels usable before all 52.",
    exercise: "Fill one complete suit with 13 people, actions, and objects.",
    checkpoint: "Do you have at least 13 PAO cards you can picture instantly?",
    actionHref: "/build-palace",
    actionLabel: "Create PAO deck",
    icon: Layers3
  },
  {
    number: 5,
    title: "Memorize 5 cards",
    group: "Practice Ladder",
    duration: "10 min",
    goal: "Practice placing images slowly and clearly before adding speed.",
    exercise: "Place five cards into five route locations, then recall them forward.",
    checkpoint: "Can you recall 5 cards without hints?",
    actionHref: "/play",
    actionLabel: "Play 5 cards",
    icon: Play
  },
  {
    number: 6,
    title: "Memorize 13 cards",
    group: "Practice Ladder",
    duration: "15 min",
    goal: "Train one suit-sized run and mark unclear images immediately.",
    exercise: "Use 13 locations and mark which images felt weak or slow.",
    checkpoint: "Can you finish 13 cards with clear images at every location?",
    actionHref: "/play",
    actionLabel: "Practice 13",
    icon: Clock3
  },
  {
    number: 7,
    title: "Memorize 32 cards",
    group: "Practice Ladder",
    duration: "20 min",
    goal: "Increase endurance while keeping mistakes easy to diagnose.",
    exercise: "Split 32 cards into two chunks of 16, then connect both chunks in order.",
    checkpoint: "Can you recover after a blank without losing the whole route?",
    actionHref: "/play",
    actionLabel: "Practice 32",
    icon: Sparkles
  },
  {
    number: 8,
    title: "Review and full deck",
    group: "Review and Improve",
    duration: "25 min",
    goal: "Use mistakes as a review list, then attempt a full deck when weak cards shrink.",
    exercise: "Run a full deck, review mistakes, then repeat only the weakest 10 cards.",
    checkpoint: "Can you explain exactly which cards are weak and why?",
    actionHref: "/dashboard",
    actionLabel: "Review progress",
    icon: Trophy
  }
];

const groups = [
  {
    name: "Foundation",
    description: "Build the route first. A clear path makes every later drill easier.",
    lessonNumbers: [1, 2],
    icon: Route
  },
  {
    name: "PAO System",
    description: "Give each card a person, action, and object that appears instantly.",
    lessonNumbers: [3, 4],
    icon: Brain
  },
  {
    name: "Practice Ladder",
    description: "Scale from small runs to larger chunks while mistakes are still visible.",
    lessonNumbers: [5, 6, 7],
    icon: Dumbbell
  },
  {
    name: "Review and Improve",
    description: "Turn missed cards into targeted review before racing the full deck.",
    lessonNumbers: [8],
    icon: Trophy
  }
];

const practiceBlocks = [
  { time: "5 min", title: "Walk the route", detail: "Name each location forward, then backward." },
  { time: "5 min", title: "Refresh PAO", detail: "Say one suit out loud until the images feel instant." },
  { time: "5 min", title: "Recall small", detail: "Memorize 5 cards and mark the slow image." }
];

const sampleRoute = ["Front door", "Entry rug", "Shoe cabinet", "Coat rack", "Hallway mirror"];

export default async function TrainingAcademyPage() {
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
      <div className="space-y-8 md:space-y-10">
        <PageHeader
          label="Training Academy"
          title="Learn PAO and memory palace step by step"
          description="Start with a real route, attach card images, then practice in small runs until a full deck feels natural."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#lesson-1" className="h-11">
                Start lesson 1
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/build-palace/how-to-create-your-pao-and-routes" variant="secondary" className="h-11">
                Read guide
              </ButtonLink>
            </div>
          }
        />

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Start here</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your learning path</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Follow this order once. After that, return to the weakest step whenever training feels messy.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
                <p className="font-mono text-sm font-semibold text-[var(--accent)]">{index + 1}</p>
                <h3 className="mt-2 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--muted)]">{step.detail}</p>
                <ButtonLink href={step.href} variant="ghost" className="mt-3 h-9 w-full justify-between px-2.5">
                  {step.action}
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <Panel className="bg-[var(--accent-soft)] p-5 md:p-6">
            <Clock3 className="size-6 text-[var(--accent)]" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">A 15 minute start</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use this when you open the app and want a focused practice block.
            </p>
          </Panel>
          <div className="grid gap-3 sm:grid-cols-3">
            {practiceBlocks.map((block) => (
              <Panel key={block.title} className="p-4">
                <p className="font-mono text-sm font-semibold text-[var(--accent)]">{block.time}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{block.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{block.detail}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm md:p-6">
          <p className="text-sm font-semibold text-[var(--accent)]">Example</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">How the pieces connect</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-4">
              <h3 className="text-sm font-semibold">Card image</h3>
              <div className="mt-3 flex items-center gap-3">
                <CardBadge label="A♣" color="black" />
                <CardBadge label="7♦" color="red" />
                <CardBadge label="K♠" color="black" />
              </div>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-4">
              <h3 className="text-sm font-semibold">Route locations</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {sampleRoute.map((location, index) => (
                  <span key={location} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-sm">
                    <span className="font-mono text-[var(--accent)]">{index + 1}</span> {location}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-4">
              <h3 className="text-sm font-semibold">PAO scene</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-md bg-[var(--card)] px-3 py-2"><span className="font-semibold">Person:</span> Einstein</div>
                <div className="rounded-md bg-[var(--card)] px-3 py-2"><span className="font-semibold">Action:</span> calculating</div>
                <div className="rounded-md bg-[var(--card)] px-3 py-2"><span className="font-semibold">Object:</span> chalkboard</div>
              </div>
            </div>
          </div>
        </section>

        <section id="lesson-path" className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Course path</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Learn one skill, prove it with a checkpoint, then move to the next step.
            </p>
            <div className="mt-5 space-y-3">
              {groups.map((group) => {
                const Icon = group.icon;
                return (
                  <a key={group.name} href={`#${slugify(group.name)}`} className="block rounded-md bg-[var(--card-muted)] p-3 transition hover:bg-[var(--card)]">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-[var(--accent)]" />
                      <p className="font-semibold text-[var(--foreground)]">{group.name}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.description}</p>
                    <p className="mt-3 font-mono text-xs font-semibold text-[var(--accent)]">
                      Lessons {group.lessonNumbers.join(", ")}
                    </p>
                  </a>
                );
              })}
            </div>
            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Beginner checkpoints</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
                <p>Can you name 10 locations forward?</p>
                <p>Do you have at least 13 PAO cards?</p>
                <p>Can you recall 5 cards without hints?</p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.name} id={slugify(group.name)} className="space-y-3 scroll-mt-24">
                <div>
                  <p className="text-sm font-semibold text-[var(--accent)]">{group.name}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{group.description}</h2>
                </div>
                <div className="space-y-3">
                  {lessons
                    .filter((lesson) => lesson.group === group.name)
                    .map((lesson) => {
                      const Icon = lesson.icon;
                      return (
                        <article
                          id={`lesson-${lesson.number}`}
                          key={lesson.number}
                          className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:border-[var(--border-strong)] md:grid-cols-[88px_1fr_0.95fr] md:items-center md:p-5"
                        >
                          <div className="flex items-center gap-3 md:block">
                            <div className="flex size-12 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                              <Icon className="size-6" />
                            </div>
                            <div className="md:mt-3">
                              <p className="font-mono text-sm font-semibold text-[var(--accent)]">Lesson {lesson.number}</p>
                              <p className="mt-1 text-xs text-[var(--muted)]">{lesson.duration}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{lesson.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{lesson.goal}</p>
                            <ButtonLink href={lesson.actionHref} className="mt-4 h-10">
                              {lesson.actionLabel}
                              <ArrowRight className="size-4" />
                            </ButtonLink>
                          </div>
                          <div className="space-y-2">
                            <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
                              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                                <CheckCircle2 className="size-4 text-[var(--accent)]" />
                                Mini exercise
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{lesson.exercise}</p>
                            </div>
                            <div className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
                              {lesson.checkpoint}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Practice now</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">Start with Classic and 5 cards</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Classic mode is the first beginner run: choose your route, choose your PAO deck, set cards to 5, then recall slowly.
              </p>
            </div>
            <ButtonLink href="/play" className="h-11 md:mr-8 md:self-center">
              <Play className="size-4" />
              Play
            </ButtonLink>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}
