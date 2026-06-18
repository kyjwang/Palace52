import { fullDeck } from "@/lib/cards";

export const starterLocations = [
  "Front door",
  "Entry table",
  "Hallway mirror",
  "Coat rack",
  "Kitchen sink",
  "Stove",
  "Fridge",
  "Dining table",
  "Sofa",
  "Coffee table",
  "Bookshelf",
  "Television",
  "Desk",
  "Bedroom door",
  "Bed",
  "Nightstand",
  "Wardrobe",
  "Bathroom sink",
  "Shower",
  "Balcony",
  "Mailbox",
  "Garden path",
  "Garage",
  "Car seat",
  "Laundry basket",
  "Window sill"
];

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
