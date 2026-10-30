export type QuestionTopic = "everyday" | "hypothetical" | "nostalgia" | "personality";

export type Question = {
  id: string;
  text: string;
  options: [string, string, string, string];
  topic: QuestionTopic;
};

export const QUESTIONS: Question[] = [
  // everyday
  {
    id: "ideal-saturday-morning",
    text: "Ideal Saturday morning?",
    options: ["Sleep in", "Farmers market", "Long run", "Pancake project"],
    topic: "everyday",
  },
  {
    id: "go-to-coffee-order",
    text: "Go-to morning drink?",
    options: ["Black coffee", "Fancy latte", "Tea", "Just water"],
    topic: "everyday",
  },
  {
    id: "takeout-night-pick",
    text: "Takeout night, what gets ordered?",
    options: ["Pizza", "Thai", "Sushi", "Burgers"],
    topic: "everyday",
  },
  {
    id: "weeknight-evening",
    text: "Best weeknight evening?",
    options: ["Cook something new", "Couch and a show", "Walk around the block", "Game night"],
    topic: "everyday",
  },
  {
    id: "grocery-store-style",
    text: "Grocery store style?",
    options: ["Strict list", "Wander and vibe", "Online order", "Daily tiny trips"],
    topic: "everyday",
  },
  {
    id: "phone-alarm-reaction",
    text: "When the alarm goes off?",
    options: ["Up immediately", "One snooze", "Five snoozes", "Already awake"],
    topic: "everyday",
  },
  {
    id: "rainy-day-plan",
    text: "Unexpected rainy day plan?",
    options: ["Bake something", "Movie marathon", "Puzzle or book", "Go out anyway"],
    topic: "everyday",
  },
  {
    id: "desk-snack",
    text: "Desk snack of choice?",
    options: ["Chips", "Fruit", "Chocolate", "Nuts"],
    topic: "everyday",
  },
  {
    id: "weekend-chore-first",
    text: "First chore on a free weekend?",
    options: ["Laundry", "Dishes", "Vacuum", "Chores can wait"],
    topic: "everyday",
  },
  {
    id: "commute-soundtrack",
    text: "Commute soundtrack?",
    options: ["Podcast", "Music playlist", "Audiobook", "Silence"],
    topic: "everyday",
  },
  {
    id: "sunday-dinner",
    text: "Sunday dinner vibe?",
    options: ["Big roast", "Pasta night", "Leftovers remix", "Cereal counts"],
    topic: "everyday",
  },
  {
    id: "pre-bed-ritual",
    text: "Last thing before sleep?",
    options: ["Scroll phone", "Read a chapter", "Stretch", "Lights out instantly"],
    topic: "everyday",
  },

  // hypothetical
  {
    id: "superpower-pick",
    text: "Pick one superpower.",
    options: ["Teleportation", "Invisibility", "Time pause", "Talk to animals"],
    topic: "hypothetical",
  },
  {
    id: "free-ticket-anywhere",
    text: "Free ticket anywhere tomorrow. Where?",
    options: ["Tokyo", "Iceland", "New York", "A quiet beach"],
    topic: "hypothetical",
  },
  {
    id: "one-food-forever",
    text: "One food forever. Which?",
    options: ["Tacos", "Pasta", "Rice bowls", "Sandwiches"],
    topic: "hypothetical",
  },
  {
    id: "win-a-week-off",
    text: "You win a surprise week off. First move?",
    options: ["Road trip", "Do absolutely nothing", "Visit friends", "Start a project"],
    topic: "hypothetical",
  },
  {
    id: "dream-pet",
    text: "Any pet, zero upkeep. Pick?",
    options: ["Dog", "Cat", "Tiny pig", "Parrot"],
    topic: "hypothetical",
  },
  {
    id: "time-machine-direction",
    text: "Time machine, one trip.",
    options: ["Dinosaurs", "The 1920s", "Year 2200", "Last Tuesday"],
    topic: "hypothetical",
  },
  {
    id: "instant-skill",
    text: "Instantly master one skill.",
    options: ["Piano", "Every language", "Cooking", "Surfing"],
    topic: "hypothetical",
  },
  {
    id: "stranded-island-item",
    text: "Stranded on an island, one item?",
    options: ["Knife", "Hammock", "Fishing rod", "Giant book"],
    topic: "hypothetical",
  },
  {
    id: "run-a-shop",
    text: "You must open a shop. Which?",
    options: ["Bakery", "Bookstore", "Plant shop", "Board game cafe"],
    topic: "hypothetical",
  },
  {
    id: "movie-role",
    text: "Cast in a movie. Your role?",
    options: ["The hero", "The villain", "Comic relief", "Mysterious stranger"],
    topic: "hypothetical",
  },
  {
    id: "theme-song-genre",
    text: "Your personal theme song genre?",
    options: ["Jazz", "Pop", "Epic orchestral", "Lo-fi beats"],
    topic: "hypothetical",
  },
  {
    id: "live-in-a-story",
    text: "Live in one fictional world.",
    options: ["Hogwarts", "Middle-earth", "Star Wars", "Studio Ghibli"],
    topic: "hypothetical",
  },

  // nostalgia
  {
    id: "childhood-cartoon",
    text: "Peak childhood cartoon?",
    options: ["SpongeBob", "Pokemon", "Scooby-Doo", "Looney Tunes"],
    topic: "nostalgia",
  },
  {
    id: "school-lunch-trade",
    text: "Most traded school lunch item?",
    options: ["Fruit snacks", "Pudding cup", "Chips", "Juice box"],
    topic: "nostalgia",
  },
  {
    id: "recess-game",
    text: "Best recess game?",
    options: ["Tag", "Four square", "Jump rope", "Swings"],
    topic: "nostalgia",
  },
  {
    id: "first-video-game",
    text: "First video game obsession?",
    options: ["Mario", "Pokemon", "The Sims", "Minecraft"],
    topic: "nostalgia",
  },
  {
    id: "birthday-party-venue",
    text: "Dream birthday party as a kid?",
    options: ["Bowling alley", "Roller rink", "Pizza place", "Backyard sleepover"],
    topic: "nostalgia",
  },
  {
    id: "childhood-breakfast-cereal",
    text: "Cereal that ruled your childhood?",
    options: ["Cinnamon Toast Crunch", "Froot Loops", "Lucky Charms", "Cheerios"],
    topic: "nostalgia",
  },
  {
    id: "family-road-trip-seat",
    text: "Family road trip role?",
    options: ["Asleep in back", "Navigator", "DJ", "Are we there yet"],
    topic: "nostalgia",
  },
  {
    id: "summer-camp-activity",
    text: "Favorite summer activity as a kid?",
    options: ["Pool all day", "Bike rides", "Building forts", "Catching bugs"],
    topic: "nostalgia",
  },
  {
    id: "first-phone-game",
    text: "Early phone game you sank hours into?",
    options: ["Snake", "Angry Birds", "Flappy Bird", "Candy Crush"],
    topic: "nostalgia",
  },
  {
    id: "bedtime-story-pick",
    text: "Bedtime story on repeat?",
    options: ["Goodnight Moon", "Dr. Seuss", "Harry Potter", "Where the Wild Things Are"],
    topic: "nostalgia",
  },
  {
    id: "school-supply-joy",
    text: "Most exciting school supply?",
    options: ["Gel pens", "New backpack", "Fresh notebook", "Trapper Keeper"],
    topic: "nostalgia",
  },
  {
    id: "weekend-morning-as-a-kid",
    text: "Saturday morning as a kid?",
    options: ["Cartoons", "Sports practice", "Sleeping in", "Video games"],
    topic: "nostalgia",
  },

  // personality
  {
    id: "party-arrival",
    text: "Arrival time at a party?",
    options: ["Early", "Right on time", "Fashionably late", "Very late"],
    topic: "personality",
  },
  {
    id: "group-project-role",
    text: "Group project role?",
    options: ["The planner", "The idea person", "The finisher", "The snack bringer"],
    topic: "personality",
  },
  {
    id: "packing-style",
    text: "Packing for a trip?",
    options: ["Week ahead", "Night before", "Morning of", "Overpack everything"],
    topic: "personality",
  },
  {
    id: "decision-style",
    text: "Picking a restaurant?",
    options: ["Research reviews", "Ask the group", "Go with gut", "Same place again"],
    topic: "personality",
  },
  {
    id: "new-city-first-stop",
    text: "First stop in a new city?",
    options: ["Famous landmark", "Local cafe", "Museum", "Random wandering"],
    topic: "personality",
  },
  {
    id: "phone-notifications",
    text: "Phone notification style?",
    options: ["All on", "Mostly muted", "Inbox zero", "Red badge chaos"],
    topic: "personality",
  },
  {
    id: "board-game-energy",
    text: "Board game energy?",
    options: ["Very competitive", "Just for fun", "Rule explainer", "Secretly scheming"],
    topic: "personality",
  },
  {
    id: "weather-preference",
    text: "Perfect weather?",
    options: ["Sunny and hot", "Crisp and cool", "Rainy and gray", "Fresh snow"],
    topic: "personality",
  },
  {
    id: "karaoke-mode",
    text: "Karaoke night?",
    options: ["First to sign up", "Duet only", "Backup dancer", "Cheering from table"],
    topic: "personality",
  },
  {
    id: "problem-solving-style",
    text: "Something breaks at home?",
    options: ["YouTube tutorial", "Call someone", "Ignore it", "Take it apart"],
    topic: "personality",
  },
  {
    id: "surprise-reaction",
    text: "Surprise party thrown for you?",
    options: ["Love it", "Mild panic", "Knew all along", "Politely stunned"],
    topic: "personality",
  },
  {
    id: "text-reply-speed",
    text: "Text reply speed?",
    options: ["Instant", "Within the hour", "Same day", "Eventually"],
    topic: "personality",
  },
];
