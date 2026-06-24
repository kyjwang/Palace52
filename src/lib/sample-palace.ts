import { fullDeck, type PlayingCard } from "@/lib/cards";

export type StarterPao = {
  card: PlayingCard;
  location: string;
  person: string;
  action: string;
  object: string;
  image: string;
};

type PaoSource = {
  name: string;
  description: string;
  people: string[];
  actions: string[];
  objects: string[];
};

export const homeRoute = [
  "Front door",
  "Entry rug",
  "Shoe cabinet",
  "Coat rack",
  "Hallway mirror",
  "Living room sofa",
  "Coffee table",
  "Television",
  "Bookshelf",
  "Dining table",
  "Kitchen island",
  "Kitchen sink",
  "Refrigerator",
  "Laundry basket",
  "Bathroom mirror",
  "Stair landing",
  "Bedroom door",
  "Bedside lamp"
];

export const gymRoute = [
  "Gym entrance",
  "Check-in desk",
  "Shoe cubby",
  "Locker 1",
  "Locker mirror",
  "Towel shelf",
  "Water fountain",
  "Warm-up mat",
  "Stretching rail",
  "Foam roller",
  "Dumbbell rack",
  "Kettlebell corner",
  "Bench press",
  "Incline bench",
  "Squat rack",
  "Deadlift platform",
  "Cable machine",
  "Pull-up bar"
];

export const schoolRoute = [
  "School gate",
  "Flag pole",
  "Main entrance",
  "Reception desk",
  "Principal office",
  "Notice board",
  "Locker hallway",
  "Locker 12",
  "Science lab door",
  "Lab sink",
  "Microscope table",
  "Chemistry shelf",
  "Math classroom",
  "Teacher desk",
  "Whiteboard",
  "Window seat",
  "Library door",
  "Return desk"
];

export const palaceLocations = homeRoute;

const famousPeople = [
  "Albert Einstein",
  "Amelia Earhart",
  "Beyonce",
  "Bruce Lee",
  "Charlie Chaplin",
  "Cleopatra",
  "David Bowie",
  "Frida Kahlo",
  "Harry Houdini",
  "Isaac Newton",
  "Jackie Chan",
  "Jane Austen",
  "Leonardo da Vinci",
  "Marie Curie",
  "Michael Jordan",
  "Mona Lisa",
  "Mozart",
  "Muhammad Ali",
  "Napoleon",
  "Nikola Tesla",
  "Oprah Winfrey",
  "Pablo Picasso",
  "Queen Elizabeth",
  "Rosa Parks",
  "Serena Williams",
  "Sherlock Holmes",
  "Simone Biles",
  "Spider-Man",
  "Taylor Swift",
  "The Rock",
  "Usain Bolt",
  "Wonder Woman",
  "Yoda",
  "Zorro",
  "Adele",
  "Barack Obama",
  "Billie Eilish",
  "Cristiano Ronaldo",
  "Darth Vader",
  "Dolly Parton",
  "Elvis Presley",
  "Gandalf",
  "Homer Simpson",
  "Indiana Jones",
  "James Bond",
  "Katniss Everdeen",
  "Lady Gaga",
  "Lionel Messi",
  "Mickey Mouse",
  "Mr. Bean",
  "Robin Hood",
  "Superman"
];

const simpleActions = [
  "calculating",
  "piloting",
  "performing",
  "kicking",
  "waddling",
  "commanding",
  "singing",
  "painting",
  "escaping",
  "discovering",
  "stunt-fighting",
  "writing",
  "sketching",
  "researching",
  "dunking",
  "smiling",
  "composing",
  "boxing",
  "strategizing",
  "electrifying",
  "interviewing",
  "painting",
  "waving",
  "sitting",
  "serving",
  "deducing",
  "flipping",
  "web-slinging",
  "strumming",
  "lifting",
  "sprinting",
  "deflecting",
  "levitating",
  "slashing",
  "belting",
  "speaking",
  "whisper-singing",
  "bicycle-kicking",
  "force-choking",
  "strumming",
  "hip-swiveling",
  "casting",
  "munching",
  "cracking",
  "aiming",
  "shooting",
  "posing",
  "dribbling",
  "waving",
  "fumbling",
  "shooting",
  "flying"
];

const simpleObjects = [
  "chalkboard",
  "aviator goggles",
  "stage microphone",
  "nunchaku",
  "bamboo cane",
  "golden throne",
  "lightning guitar",
  "flower crown",
  "padlock",
  "falling apple",
  "stunt ladder",
  "quill pen",
  "flying machine",
  "radium vial",
  "basketball",
  "portrait frame",
  "piano",
  "boxing gloves",
  "bicorne hat",
  "tesla coil",
  "talk-show couch",
  "cubist palette",
  "royal crown",
  "bus seat",
  "tennis racket",
  "magnifying glass",
  "balance beam",
  "web shooter",
  "acoustic guitar",
  "championship belt",
  "gold spikes",
  "silver bracelets",
  "green lightsaber",
  "black mask",
  "gold microphone",
  "podium",
  "neon microphone",
  "soccer ball",
  "red lightsaber",
  "rhinestone guitar",
  "blue suede shoes",
  "wizard staff",
  "pink donut",
  "bullwhip",
  "spy watch",
  "longbow",
  "disco stick",
  "soccer ball",
  "white glove",
  "teddy bear",
  "green longbow",
  "red cape"
];

const sportsMoviePeople = [
  "Rocky Balboa",
  "Luke Skywalker",
  "LeBron James",
  "Hermione Granger",
  "Black Panther",
  "Lara Croft",
  "Harry Potter",
  "Neo",
  "Captain Marvel",
  "Forrest Gump",
  "Tony Stark",
  "Shrek",
  "Moana",
  "Elsa",
  "Batman",
  "Arya Stark",
  "Dwayne Johnson",
  "Diana Prince",
  "Simba",
  "Mulan"
];

const sportsMovieActions = [
  "boxing",
  "dueling",
  "slam-dunking",
  "casting",
  "clawing",
  "raiding",
  "catching",
  "dodging",
  "blasting",
  "running",
  "assembling",
  "roaring",
  "sailing",
  "freezing",
  "throwing",
  "fencing",
  "eyebrow-raising",
  "blocking",
  "roaring",
  "charging"
];

const sportsMovieObjects = [
  "punching bag",
  "lightsaber",
  "basketball",
  "wand",
  "vibranium suit",
  "twin pistols",
  "golden snitch",
  "falling bullets",
  "photon gauntlets",
  "running shoes",
  "arc reactor",
  "swamp sign",
  "oar",
  "snowflake",
  "batarang",
  "Needle sword",
  "championship belt",
  "shield",
  "Pride Rock",
  "curved sword"
];

const musicHeroPeople = [
  "Freddie Mercury",
  "Rihanna",
  "Prince",
  "Madonna",
  "Bob Marley",
  "Whitney Houston",
  "Stevie Wonder",
  "Elton John",
  "Ariana Grande",
  "Bruno Mars",
  "Tina Turner",
  "Shakira",
  "Ed Sheeran",
  "Kendrick Lamar",
  "Batman",
  "Superman",
  "Wonder Woman",
  "Spider-Man",
  "Iron Man",
  "Captain America"
];

const musicHeroActions = [
  "singing",
  "posing",
  "shredding",
  "voguing",
  "strumming",
  "belting",
  "playing",
  "performing",
  "singing",
  "dancing",
  "whipping",
  "hip-shaking",
  "looping",
  "rapping",
  "grappling",
  "flying",
  "lassoing",
  "swinging",
  "blasting",
  "shield-throwing"
];

const musicHeroObjects = [
  "microphone stand",
  "umbrella",
  "purple guitar",
  "vogue gloves",
  "reggae guitar",
  "spotlight microphone",
  "piano",
  "rhinestone piano",
  "ponytail microphone",
  "fedora",
  "fringed dress",
  "golden scarf",
  "acoustic guitar",
  "lyric notebook",
  "utility belt",
  "red cape",
  "golden lasso",
  "web shooters",
  "arc reactor",
  "star shield"
];

export const suitOrder = ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"];

export const sortedDeck = [...fullDeck].sort((a, b) => {
  const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
  if (suitDiff !== 0) return suitDiff;
  return fullDeck.indexOf(a) - fullDeck.indexOf(b);
});

function buildPaoDeck(source: PaoSource): StarterPao[] {
  return sortedDeck.map((card, index) => {
    const person = source.people[index % source.people.length];
    const action = source.actions[index % source.actions.length];
    const object = source.objects[index % source.objects.length];
    const location = homeRoute[index % homeRoute.length];

    return {
      card,
      location,
      person,
      action,
      object,
      image: `${person} ${action} with ${object} at the ${location.toLowerCase()}`
    };
  });
}

export const paoDeckPresets = [
  {
    name: "Famous beginner PAO",
    description: "Very famous people with simple actions and objects for beginners.",
    people: famousPeople,
    actions: simpleActions,
    objects: simpleObjects
  },
  {
    name: "Sports and movie PAO",
    description: "Athletes and movie characters with high-motion images.",
    people: sportsMoviePeople,
    actions: sportsMovieActions,
    objects: sportsMovieObjects
  },
  {
    name: "Music and hero PAO",
    description: "Musicians and superheroes for loud, colorful images.",
    people: musicHeroPeople,
    actions: musicHeroActions,
    objects: musicHeroObjects
  }
].map((source) => ({
  name: source.name,
  description: source.description,
  deck: buildPaoDeck(source)
}));

export const beginnerPaoDeck = paoDeckPresets[0].deck;

export const sampleUserPalaces = [
  {
    name: "Home",
    locations: homeRoute,
    cards: 52,
    strength: 86
  },
  {
    name: "Gym Route",
    locations: gymRoute,
    cards: 52,
    strength: 74
  },
  {
    name: "School Route",
    locations: schoolRoute,
    cards: 52,
    strength: 69
  }
];
