import { ArrowLeft, Brain, Castle, Film, MapPinned, Palette, Route, Shapes, Sparkles, UserRound } from "lucide-react";
import { PublicShell } from "@/components/app/public-shell";
import { ButtonLink } from "@/components/ui/button";

const routeExamples = [
  "Front door",
  "Shoe rack",
  "Mirror",
  "Sofa",
  "TV",
  "Dining table",
  "Kitchen sink",
  "Fridge",
  "Bathroom",
  "Bed"
];

const locationFields = [
  { label: "Location name", value: "#7 Kitchen Sink" },
  { label: "Description", value: "Silver sink full of dirty plates" },
  { label: "Image cue", value: "Water overflowing everywhere" },
  { label: "Position number", value: "7" },
  { label: "Room / area", value: "Kitchen" }
];

const suitCategories = [
  { suit: "Spades", meaning: "Powerful / dark / serious people", example: "Ace of Spades = Darth Vader" },
  { suit: "Hearts", meaning: "Emotional / celebrities / loved characters", example: "Ace of Hearts = Cupid" },
  { suit: "Clubs", meaning: "Action / sports / fighters", example: "Ace of Clubs = Mike Tyson" },
  { suit: "Diamonds", meaning: "Rich / luxury / business / tech", example: "Ace of Diamonds = Elon Musk" }
];

const rankPatterns = [
  "Aces = leaders",
  "Kings = male rulers or heroes",
  "Queens = female rulers or heroines",
  "Jacks = young characters",
  "10s = athletes",
  "9s = musicians",
  "8s = movie characters",
  "7s = game characters",
  "6s = animals or monsters",
  "5s = comedians",
  "4s = family or friends",
  "3s = cartoon characters",
  "2s = simple iconic objects"
];

const paoExamples = [
  "Ace of Spades = Albert Einstein / writing / blackboard",
  "King of Hearts = Superman / flying / cape",
  "7 of Clubs = Harry Potter / casting spell / wand",
  "Queen of Hearts = my mother / cooking / red pot"
];

const imageRules = ["Big", "Funny", "Emotional", "Violent", "Absurd", "Colorful", "Moving"];

export default function HowToCreatePaoAndRoutesPage() {
  return (
    <PublicShell>
      <div className="space-y-8">
        <section className="rounded-lg border border-[#dfe3d7] bg-white p-5 md:p-6">
          <ButtonLink href="/build-palace" variant="secondary" className="mb-5">
            <ArrowLeft className="size-4" />
            Back to Build
          </ButtonLink>
          <p className="text-sm font-medium text-[#0f7a5f]">Build guide</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
            How to create your PAO and routes
          </h1>
          <p className="mt-4 max-w-3xl text-[#6f7468] md:text-lg">
            Palace52 teaches two different memory skills: knowing your route automatically, and knowing all 52 PAO
            mappings instantly. Train them separately first, then combine them during deck practice.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#eef8f3] text-[#0f7a5f]">
                <Route className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#0f7a5f]">Skill 1</p>
                <h2 className="text-2xl font-semibold tracking-tight">Remember routes</h2>
              </div>
            </div>
            <p className="mt-4 text-[#6f7468]">
              A route is a fixed sequence of locations. You should know it so well that moving through it feels automatic.
            </p>
          </div>
          <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#eef8f3] text-[#0f7a5f]">
                <Brain className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#0f7a5f]">Skill 2</p>
                <h2 className="text-2xl font-semibold tracking-tight">Remember 52 PAO mappings</h2>
              </div>
            </div>
            <p className="mt-4 text-[#6f7468]">
              The hard part is not using PAO during a deck attempt. The hard part is memorizing the PAO system itself.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#0f7a5f]">Routes</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Build routes from places you already know</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <Castle className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique A: Use real places first</h3>
              </div>
              <p className="mt-3 text-[#6f7468]">
                Beginners should start with a bedroom, apartment, route to school, route to the supermarket, old school
                building, gym, or favorite shopping mall. Real places are easier than fantasy palaces because your brain
                already knows the structure.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {routeExamples.map((location, index) => (
                  <span key={location} className="rounded-md border border-[#dfe3d7] bg-[#fbfcf8] px-3 py-2 text-sm">
                    <span className="font-mono text-[#0f7a5f]">{index + 1}</span> {location}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <MapPinned className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique B: Make every location unique</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-md bg-red-50 p-3 text-red-700">
                  Bad route: Wall, chair, table, chair, table, wall.
                </div>
                <div className="rounded-md bg-[#eef8f3] p-3 text-[#0f7a5f]">
                  Good route: Red front door, broken shoe rack, giant mirror, blue sofa, noisy TV.
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
            <h3 className="text-xl font-semibold">Route fields to add in Palace52</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {locationFields.map((field) => (
                <div key={field.label} className="rounded-md bg-[#f6f7f3] p-3">
                  <p className="text-xs font-semibold uppercase text-[#6f7468]">{field.label}</p>
                  <p className="mt-2 text-sm font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#0f7a5f]">PAO</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Make the 52 cards easier to remember</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <Shapes className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique A: Use card logic</h3>
              </div>
              <p className="mt-3 text-[#6f7468]">
                Do not make all 52 cards random. Give suits and values meaning so every card has a memory hook before you
                choose the person.
              </p>
              <div className="mt-4 grid gap-3">
                {suitCategories.map((item) => (
                  <div key={item.suit} className="rounded-md bg-[#fbfcf8] p-3">
                    <p className="font-semibold">{item.suit}</p>
                    <p className="text-sm text-[#6f7468]">{item.meaning}</p>
                    <p className="mt-1 text-sm font-medium text-[#0f7a5f]">{item.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <Film className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique B: Use rank patterns</h3>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {rankPatterns.map((pattern) => (
                  <div key={pattern} className="rounded-md bg-[#f6f7f3] px-3 py-2 text-sm">
                    {pattern}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#6f7468]">
                Example: King of Spades = Batman, Queen of Hearts = Taylor Swift, 10 of Clubs = Cristiano Ronaldo.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <UserRound className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique C: Make PAO personal</h3>
              </div>
              <p className="mt-3 text-[#6f7468]">
                The best PAO system is personal, not generic. Choose someone you can instantly imagine, an action they are
                known for, and an object strongly connected to them.
              </p>
              <div className="mt-4 space-y-2">
                {paoExamples.map((example) => (
                  <div key={example} className="rounded-md bg-[#fbfcf8] px-3 py-2 text-sm">
                    {example}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#dfe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-[#0f7a5f]" />
                <h3 className="text-xl font-semibold">Technique D: Use exaggeration</h3>
              </div>
              <p className="mt-3 text-[#6f7468]">
                Normal image: Einstein writes on a board. Memorable image: Einstein violently writes glowing equations on a
                giant blackboard while his hair catches fire.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {imageRules.map((rule) => (
                  <span key={rule} className="rounded-md bg-[#101411] px-3 py-2 text-sm font-medium text-white">
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#dfe3d7] bg-white p-5 md:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-[#0f7a5f]">Next step</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Build one route, then build one suit</h2>
              <p className="mt-2 max-w-2xl text-[#6f7468]">
                Start with 10 real locations and 13 cards from one suit. Once those are automatic, expand toward the full
                52-card system.
              </p>
            </div>
            <ButtonLink href="/build-palace">
              <Palette className="size-4" />
              Start building
            </ButtonLink>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
