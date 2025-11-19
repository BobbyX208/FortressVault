const nouns = [
  "tiger", "robot", "ocean", "mountain", "pencil", "shadow", "planet", "coffee",
  "wizard", "dragon", "rocket", "forest", "guitar", "cookie", "spider", "breeze",
  "ninja", "pirate", "laser", "circus", "cactus", "fossil", "galaxy", "meteor",
  "puzzle", "bunker", "frenzy", "symbol", "dynamo", "vector", "engine", "anchor"
];

const verbs = [
  "eats", "finds", "jumps", "loves", "hates", "breaks", "makes", "rides",
  "wants", "keeps", "draws", "sings", "hears", "knows", "walks", "needs",
  "flips", "spins", "hunts", "cooks", "saves", "binds", "lifts", "drops",
  "mixes", "burns", "chills", "traps", "scans", "codes", "locks", "owns"
];

const adjectives = [
  "blue", "fast", "cold", "dark", "loud", "calm", "tiny", "huge",
  "wild", "soft", "hard", "epic", "rare", "ugly", "cute", "mad",
  "neon", "grim", "lazy", "busy", "cool", "warm", "faint", "bold",
  "sour", "dull", "keen", "vile", "rich", "poor", "lost", "safe"
];

const specialChars = "!@#$%^&*+-=?";
const numbers = "0123456789";

const leetMap: Record<string, string> = {
  'a': '@',
  'e': '3',
  'i': '1',
  'o': '0',
  's': '5',
  't': '7',
  'l': '1',
  'b': '8',
  'g': '9',
  'z': '2'
};

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function toSentenceCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function applyLeet(word: string, probability: number): string {
  return word.split('').map(char => {
    if (Math.random() < probability && leetMap[char.toLowerCase()]) {
      return leetMap[char.toLowerCase()];
    }
    return char;
  }).join('');
}

export function generatePassphrase(): string {
  // Stronger Structure: Adjective + Noun + Verb + Noun
  // Example: "Neon Tiger Jumps Galaxy"
  
  let p1 = pick(adjectives);
  let p2 = pick(nouns);
  let p3 = pick(verbs);
  let p4 = pick(nouns);

  // Ensure distinct nouns
  while (p4 === p2) p4 = pick(nouns);

  const rawWords = [p1, p2, p3, p4];
  
  const transformedWords = rawWords.map(w => {
    // Random Capitalization
    let temp = Math.random() > 0.4 ? toSentenceCase(w) : w;
    // Leet speak (moderate probability)
    temp = applyLeet(temp, 0.3);
    return temp;
  });

  // Join with spaces
  let result = transformedWords.join(' ');

  // Enforce Number (if leet didn't create one)
  if (!/\d/.test(result)) {
    const num = pick(numbers.split(''));
    result = result + num;
  }

  // Enforce Special Char
  if (!/[!@#$%^&*+-=?]/.test(result)) {
     const special = pick(specialChars.split(''));
     // Inject at random position or end
     if (Math.random() > 0.5) {
       result = result + special;
     } else {
       // Inject between words (replace a space)
       result = result.replace(' ', special);
     }
  }

  return result;
}