import { fullDeck } from "@/lib/cards";
import { gymRoute, homeRoute, schoolRoute } from "@/lib/sample-palace";

export const starterRoutes = [
  {
    name: "Home Palace",
    description: "A starter 18-loci route through familiar household locations.",
    locations: homeRoute
  },
  {
    name: "Gym Route",
    description: "A starter 18-loci route through a gym training path.",
    locations: gymRoute
  },
  {
    name: "School Route",
    description: "A starter 18-loci route through a school building.",
    locations: schoolRoute
  }
];

export const starterLocations = starterRoutes[0].locations;

const people = [
  "Astronaut",
  "Chef",
  "Detective",
  "Dancer",
  "Doctor",
  "Inventor",
  "Magician",
  "Pilot",
  "Painter",
  "Runner",
  "Singer",
  "Teacher",
  "Explorer"
];

const actions = [
  "juggling",
  "slicing",
  "unlocking",
  "spinning",
  "measuring",
  "welding",
  "vanishing",
  "landing",
  "painting",
  "sprinting",
  "shouting",
  "writing",
  "climbing"
];

const objects = [
  "anchor",
  "ladder",
  "lantern",
  "mirror",
  "clock",
  "compass",
  "key",
  "helmet",
  "brush",
  "medal",
  "microphone",
  "notebook",
  "rope"
];

export function starterCardImages() {
  return fullDeck.map((card, index) => ({
    rank: card.rank,
    suit: card.suit,
    person: people[index % people.length],
    action: actions[index % actions.length],
    object: objects[index % objects.length],
    imagePrompt: `${people[index % people.length]} ${actions[index % actions.length]} a ${objects[index % objects.length]} as a vivid ${card.label} image`,
    notes: "Starter image. Replace this with a personal association when it becomes familiar."
  }));
}
