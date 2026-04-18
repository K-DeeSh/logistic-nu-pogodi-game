export type ItemCategory = 'normal' | 'good_special' | 'bad' | 'troll';

export interface ItemDefinition {
  id: string;
  emoji: string;
  label: string;
  category: ItemCategory;
  catchPoints: number;       // points when caught (negative = penalty)
  catchChaos: number;        // chaos change when caught
  catchLives: number;        // lives change when caught (negative = lose life)
  missPoints: number;        // points change when missed (0 for bad/troll = no penalty for missing)
  missChaos: number;         // chaos change when missed
  missLives: number;         // lives change when missed
  comboBreak: boolean;       // breaks combo if caught?
  weight: number;            // spawn weight (higher = more frequent)
  color: string;             // card background color
  glowColor: string;         // glow color for effects
}

export interface FallingItem {
  id: string;
  defId: string;
  lane: number;              // 0-3
  y: number;                 // current y position (0 = top)
  speed: number;             // pixels per second
  flicker: boolean;          // flickering effect (some events)
  disguised: boolean;        // looks like normal/VIP but isn't
}

export interface EventEffects {
  speedMultiplier: number;
  scoreMultiplier: number;
  reverseControls: boolean;
  chaosMultiplier: number;
  disguiseBad: boolean;      // bad items look normal
  disguiseVIP: boolean;      // troll items look like VIP
  flickerItems: boolean;     // items flicker
  spawnRateMultiplier: number;
  vipBonusMultiplier: number;
  badSpawnBoost: number;     // extra weight for bad items
  comboMultiplier: number;
}

export interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  duration: number;          // seconds
  timeLeft: number;          // seconds remaining
  effects: EventEffects;
}

export interface DifficultyConfig {
  baseSpeed: number;         // pixels/second for items
  spawnInterval: number;     // ms between spawns
  maxItemsOnScreen: number;
  badItemChance: number;     // 0-1
  specialItemChance: number; // 0-1
  trollItemChance: number;   // 0-1
  eventChance: number;       // 0-1 per minute
}

export interface GameStats {
  caught: number;
  missed: number;
  badCaught: number;
  trollCaught: number;
  maxCombo: number;
  eventsLived: number;
}

export interface GameOverStats extends GameStats {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  survivalTime: number;      // seconds
}

export interface CatchAnimation {
  id: string;
  lane: number;
  y: number;           // current y position (moves upward)
  emoji: string;
  color: string;
  points: number;      // signed — shown as +50 or -30
  type: 'good' | 'bad';
  timer: number;       // seconds remaining
  duration: number;    // total duration in seconds
}

export interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  score: number;
  highScore: number;
  lives: number;
  chaos: number;             // 0-100
  combo: number;
  playerLane: number;
  items: FallingItem[];
  activeEvent: ActiveEvent | null;
  gameTime: number;          // seconds elapsed
  difficulty: DifficultyConfig;
  stats: GameStats;
  lastSpawnTime: number;
  nextEventTime: number;
  playerMoveTarget: number;  // for smooth animation
  catchFlash: { lane: number; type: 'good' | 'bad' | 'miss'; timer: number } | null;
  comboPopup: { value: number; timer: number } | null;
  catchAnimations: CatchAnimation[];
}
