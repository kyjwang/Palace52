import { ArrowRight, Brain, CheckCircle2, Clock3, Layers3, Map, Play, Route, Sparkles, Trophy } from "lucide-react";
import { PublicShell } from "@/components/app/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/product";
import { getCurrentUser } from "@/lib/auth";

const lessons = [
  {
    number: 1,
    title: "What is a memory palace?",
    focus: "Understand why locations help memories stick.",
    exercise: "Pick one familiar room and list five objects you can see without looking.",
    icon: Map,
    group: "Foundation"
  },
  {
    number: 2,
    title: "How to create a route",
    focus: "Turn a real place into a fixed sequence.",
    exercise: "Create a 10-location route from your front door to your bed.",
    icon: Route,
    group: "Foundation"
  },
  {
    number: 3,
    title: "How PAO works",
    focus: "Learn Person, Action, Object as one vivid image.",
    exercise: "Make three PAO images for three cards and say them out loud twice.",
    icon: Brain,
    group: "PAO system"
  },
  {
    number: 4,
    title: "How to build your 52-card system",
    focus: "Use suit themes, rank patterns, and personal associations.",
    exercise: "Build one complete suit with 13 PAO entries before making all 52.",
    icon: Layers3,
    group: "PAO system"
  },
  {
    number: 5,
    title: "How to memorize 5 cards",
    focus: "Practice placing images slowly and clearly.",
    exercise: "Place five cards into five route locations, then recall them forward.",
    icon: Play,
    group: "Practice ladder"
  },
  {
    number: 6,
    title: "How to memorize 13 cards",
    focus: "Train one suit-sized run without rushing.",
    exercise: "Use 13 locations and mark which images felt weak or unclear.",
    icon: Clock3,
    group: "Practice ladder"
  },
  {
    number: 7,
    title: "How to memorize 32 cards",
    focus: "Increase endurance and recover from blanks.",
    exercise: "Split 32 cards into two chunks of 16, then connect both chunks in order.",
    icon: Sparkles,
    group: "Practice ladder"
  },
  {
    number: 8,
    title: "How to memorize a full deck",
    focus: "Combine route automaticity, PAO fluency, and review.",
    exercise: "Run a full deck, review mistakes, then repeat only the weakest 10 cards.",
    icon: Trophy,
    group: "Practice ladder"
  }
];

const groups = [
  {
    name: "Foundation",
    description: "First make the route automatic. A clear path makes every later drill easier.",
    lessonNumbers: [1, 2],
    icon: Route
  },
  {
    name: "PAO system",
    description: "Then connect each card to a person, action, and object you can picture fast.",
    lessonNumbers: [3, 4],
    icon: Brain
  },
  {
    name: "Practice ladder",
    description: "Scale the deck in steps so mistakes stay visible and useful.",
    lessonNumbers: [5, 6, 7, 8],
    icon: Trophy
  }
];

const practiceBlocks = [
  { time: "5 min", title: "Walk the route", detail: "Name each location forward, then backward." },
  { time: "5 min", title: "Refresh PAO", detail: "Say one suit out loud until it feels instant." },
  { time: "5 min", title: "Recall small", detail: "Memorize 5 cards and mark the weak image." }
];

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
          title="Learn the system before racing the deck"
          description="Build the route, learn PAO, then scale practice from 5 cards to 52."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#lesson-path" className="h-11">
                View lessons
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/build-palace/how-to-create-your-pao-and-routes" variant="secondary" className="h-11">
                Read guide
              </ButtonLink>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <Panel className="bg-[var(--accent-soft)] p-5 md:p-6">
            <Clock3 className="size-6 text-[var(--accent)]" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">A 15 minute start</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use this when you do not know what to practice today.
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

        <section id="lesson-path" className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-[#dfe3d7] bg-white p-5 shadow-sm lg:self-start">
            <h2 className="text-2xl font-semibold tracking-tight text-[#161713]">Course path</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f665b]">
              Each lesson is short on purpose. Learn one skill, do one exercise, then move on.
            </p>
            <div className="mt-5 space-y-3">
              {groups.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.name} className="rounded-md bg-[#f6f7f3] p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-[#0f7a5f]" />
                      <p className="font-semibold text-[#161713]">{group.name}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#5f665b]">{group.description}</p>
                    <p className="mt-3 font-mono text-xs font-semibold text-[#0f7a5f]">
                      Lessons {group.lessonNumbers.join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="space-y-3">
            {lessons.map((lesson) => {
              const Icon = lesson.icon;
              return (
                <article
                  key={lesson.number}
                  className="grid gap-4 rounded-lg border border-[#dfe3d7] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bfcabc] hover:shadow-md md:grid-cols-[80px_1fr_0.9fr] md:items-center md:p-5"
                >
                  <div className="flex items-center gap-3 md:block">
                    <div className="flex size-12 items-center justify-center rounded-md bg-[#eef8f3] text-[#0f7a5f]">
                      <Icon className="size-6" />
                    </div>
                    <p className="font-mono text-sm font-semibold text-[#0f7a5f] md:mt-3">Lesson {lesson.number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5f665b]">{lesson.group}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#161713]">{lesson.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f665b]">{lesson.focus}</p>
                  </div>
                  <div className="rounded-md border border-[#edf0e8] bg-[#fbfcf8] p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#161713]">
                      <CheckCircle2 className="size-4 text-[#0f7a5f]" />
                      Mini exercise
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5f665b]">{lesson.exercise}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-[#cfd8cd] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#161713]">Ready for a small run?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f665b]">
                Five different modes to play and practice.
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
