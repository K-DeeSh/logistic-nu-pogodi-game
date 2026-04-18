import type {
  GameState,
  FallingItem,
  DifficultyConfig,
  GameOverStats,
} from '../types/game';
import {
  ITEM_DEFINITIONS,
  ITEMS_BY_ID,
  pickWeightedRandom,
} from '../data/items';
import { pickRandomEvent } from '../data/events';
import { getHighScore, saveHighScore } from '../utils/storage';

export const LANES = 4;
export const CATCH_ZONE_HEIGHT = 80; // px from bottom where items are caught

let itemIdCounter = 0;

// ── Initial difficulty ──────────────────────────────────────────────
export function initialDifficulty(): DifficultyConfig {
  return {
    baseSpeed: 110,
    spawnInterval: 1400,
    maxItemsOnScreen: 5,
    badItemChance: 0.06,
    specialItemChance: 0.10,
    trollItemChance: 0.03,
    eventChance: 0.18,
  };
}

// ── Difficulty scaling based on elapsed game time ───────────────────
export function scaleDifficulty(seconds: number): DifficultyConfig {
  const t = Math.min(seconds, 180); // cap at 3 minutes
  const factor = 1 + t / 90; // 1x at 0s, 3x at 180s
  return {
    baseSpeed: Math.min(110 * factor, 300),
    spawnInterval: Math.max(1400 / factor, 450),
    maxItemsOnScreen: Math.min(5 + Math.floor(t / 20), 10),
    badItemChance: Math.min(0.06 + t / 900, 0.25),
    specialItemChance: Math.min(0.10 + t / 600, 0.25),
    trollItemChance: Math.min(0.03 + t / 1200, 0.12),
    eventChance: 0.18,
  };
}

// ── Create initial game state ────────────────────────────────────────
export function createInitialState(): GameState {
  return {
    status: 'idle',
    score: 0,
    highScore: getHighScore(),
    lives: 3,
    chaos: 0,
    combo: 0,
    playerLane: 1,
    items: [],
    activeEvent: null,
    gameTime: 0,
    difficulty: initialDifficulty(),
    stats: { caught: 0, missed: 0, badCaught: 0, trollCaught: 0, maxCombo: 0, eventsLived: 0 },
    lastSpawnTime: 0,
    nextEventTime: 25 + Math.random() * 15,
    playerMoveTarget: 1,
    catchFlash: null,
    comboPopup: null,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...createInitialState(),
    highScore: state.highScore,
    status: 'playing',
  };
}

// ── Spawn a new item ─────────────────────────────────────────────────
function spawnItem(state: GameState, canvasHeight: number): FallingItem | null {
  const { difficulty, activeEvent } = state;
  const eff = activeEvent?.effects;

  // pick lane: avoid lanes already heavily occupied at top
  const topZone = 60;
  const usedLanes = state.items
    .filter((it) => it.y < topZone)
    .map((it) => it.lane);
  const freeLanes = [0, 1, 2, 3].filter((l) => !usedLanes.includes(l));
  if (freeLanes.length === 0) return null;
  const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];

  // pick item type based on difficulty and active effects
  const roll = Math.random();
  let pool = ITEM_DEFINITIONS;

  const badBoost = eff?.badSpawnBoost ?? 0;
  const extraWeights: Record<string, number> = {};

  if (eff?.disguiseBad || eff?.disguiseVIP) {
    // Events handled at render time, pool unchanged
  }
  if (badBoost > 0) {
    pool.filter((d) => d.category === 'bad').forEach((d) => {
      extraWeights[d.id] = badBoost;
    });
  }

  let filtered: typeof ITEM_DEFINITIONS;
  if (roll < difficulty.trollItemChance) {
    filtered = pool.filter((d) => d.category === 'troll');
  } else if (roll < difficulty.trollItemChance + difficulty.badItemChance) {
    filtered = pool.filter((d) => d.category === 'bad');
  } else if (roll < difficulty.trollItemChance + difficulty.badItemChance + difficulty.specialItemChance) {
    filtered = pool.filter((d) => d.category === 'good_special');
  } else {
    filtered = pool.filter((d) => d.category === 'normal');
  }

  const def = filtered.length > 0
    ? pickWeightedRandom(filtered, extraWeights)
    : pickWeightedRandom(pool.filter((d) => d.category === 'normal'));

  const effectSpeed = eff?.speedMultiplier ?? 1;

  // disguise logic
  const disguised: boolean =
    !!(eff?.disguiseBad && def.category === 'bad') ||
    !!(eff?.disguiseVIP && def.category === 'troll');

  const flicker: boolean = eff?.flickerItems ?? false;

  // start above canvas
  return {
    id: `item_${++itemIdCounter}`,
    defId: def.id,
    lane,
    y: -canvasHeight * 0.1,
    speed: difficulty.baseSpeed * effectSpeed * (0.85 + Math.random() * 0.3),
    flicker,
    disguised,
  };
}

// ── Main update tick ─────────────────────────────────────────────────
export function updateGame(
  state: GameState,
  dt: number, // seconds
  canvasHeight: number
): GameState {
  if (state.status !== 'playing') return state;

  let s = { ...state };
  s.gameTime = s.gameTime + dt;
  s.difficulty = scaleDifficulty(s.gameTime);

  // Update active event
  let activeEvent = s.activeEvent ? { ...s.activeEvent, timeLeft: s.activeEvent.timeLeft - dt } : null;
  if (activeEvent && activeEvent.timeLeft <= 0) {
    activeEvent = null;
    s.stats = { ...s.stats, eventsLived: s.stats.eventsLived + 1 };
  }
  s.activeEvent = activeEvent;

  // Trigger new event?
  if (!s.activeEvent && s.gameTime >= s.nextEventTime) {
    const newEvent = pickRandomEvent(s.gameTime);
    if (newEvent) {
      s.activeEvent = newEvent;
      s.nextEventTime = s.gameTime + newEvent.duration + 15 + Math.random() * 20;
    }
  }

  const eff = s.activeEvent?.effects;
  const effectSpeed = eff?.speedMultiplier ?? 1;

  // Move items
  const catchY = canvasHeight - CATCH_ZONE_HEIGHT;
  let newItems: FallingItem[] = [];
  let scoreChange = 0;
  let chaosChange = 0;
  let livesChange = 0;
  let comboBreak = false;
  let comboGain = 0;
  let catchFlash = s.catchFlash;
  let comboPopup = s.comboPopup;
  let caught = 0;
  let missed = 0;
  let badCaught = 0;
  let trollCaught = 0;

  for (const item of s.items) {
    const moved = { ...item, y: item.y + item.speed * effectSpeed * dt };

    if (moved.y >= catchY && item.y < catchY) {
      // Item reached catch zone - check if player is in same lane
      if (s.playerLane === item.lane) {
        // Caught!
        const def = ITEMS_BY_ID[item.defId];

        // Resolve disguise: if disguised, treat as the visual category
        const effectiveDef = item.disguised
          ? // bad disguised as normal → still bad on catch
            def
          : def;

        const scoreM = eff?.scoreMultiplier ?? 1;
        const comboM = eff?.comboMultiplier ?? 1;
        const vipM = def.category === 'good_special'
          ? (eff?.vipBonusMultiplier ?? 1)
          : 1;

        const comboBonus = effectiveDef.comboBreak ? 0 : Math.floor(s.combo * 2 * comboM);
        const pts = Math.round(effectiveDef.catchPoints * scoreM * vipM) + comboBonus;

        scoreChange += pts;
        chaosChange += effectiveDef.catchChaos * (eff?.chaosMultiplier ?? 1);
        livesChange += effectiveDef.catchLives;

        if (effectiveDef.comboBreak) {
          comboBreak = true;
          badCaught += effectiveDef.category === 'bad' ? 1 : 0;
          trollCaught += effectiveDef.category === 'troll' ? 1 : 0;
          catchFlash = { lane: item.lane, type: 'bad', timer: 0.4 };
        } else {
          comboGain++;
          caught++;
          catchFlash = { lane: item.lane, type: 'good', timer: 0.3 };
        }
      } else {
        // Missed (player was in a different lane)
        const def = ITEMS_BY_ID[item.defId];
        if (def.category === 'normal' || def.category === 'good_special') {
          scoreChange += def.missPoints;
          chaosChange += def.missChaos * (eff?.chaosMultiplier ?? 1);
          livesChange += def.missLives;
          // Only VIP/urgent cause a combo break when missed
          if (def.category === 'good_special' && def.missChaos >= 8) {
            comboBreak = true;
            missed++;
          } else if (def.missPoints < 0) {
            missed++;
          }
        }
        // bad/troll items: correct move to let them pass — no penalty
      }
    } else if (moved.y > canvasHeight + 20) {
      // Gone past bottom without catching
      // Already handled at catch zone
    } else {
      newItems.push(moved);
    }
  }

  // Spawn new items
  const now = s.gameTime * 1000;
  const spawnInt = s.difficulty.spawnInterval / (eff?.spawnRateMultiplier ?? 1);
  let lastSpawn = s.lastSpawnTime;
  let items = newItems;

  if (now - lastSpawn >= spawnInt && items.length < s.difficulty.maxItemsOnScreen) {
    const newItem = spawnItem(s, canvasHeight);
    if (newItem) {
      items = [...items, newItem];
      lastSpawn = now;
    }
  }

  // Update combo
  let combo = s.combo;
  if (comboBreak) {
    combo = 0;
  } else {
    combo += comboGain;
  }
  if (combo > s.stats.maxCombo) {
    s.stats = { ...s.stats, maxCombo: combo };
  }

  // Combo popup
  if (comboGain > 0 && combo >= 3) {
    comboPopup = { value: combo, timer: 0.8 };
  }

  // Update flash timers
  if (catchFlash) {
    catchFlash = { ...catchFlash, timer: catchFlash.timer - dt };
    if (catchFlash.timer <= 0) catchFlash = null;
  } else {
    catchFlash = s.catchFlash
      ? { ...s.catchFlash, timer: s.catchFlash.timer - dt }
      : null;
    if (catchFlash && catchFlash.timer <= 0) catchFlash = null;
  }

  if (comboPopup) {
    comboPopup = { ...comboPopup, timer: comboPopup.timer - dt };
    if (comboPopup.timer <= 0) comboPopup = null;
  } else if (s.comboPopup) {
    comboPopup = { ...s.comboPopup, timer: s.comboPopup.timer - dt };
    if (comboPopup.timer <= 0) comboPopup = null;
  }

  const newScore = Math.max(0, s.score + scoreChange);
  const newLives = s.lives + livesChange;
  const newChaos = Math.max(0, Math.min(100, s.chaos + chaosChange));

  let newStats = {
    ...s.stats,
    caught: s.stats.caught + caught,
    missed: s.stats.missed + missed,
    badCaught: s.stats.badCaught + badCaught,
    trollCaught: s.stats.trollCaught + trollCaught,
  };

  // Game over conditions
  const isGameOver = newLives <= 0 || newChaos >= 100;

  if (isGameOver) {
    saveHighScore(newScore);
    return {
      ...s,
      status: 'gameover',
      score: newScore,
      highScore: Math.max(s.highScore, newScore),
      lives: Math.max(0, newLives),
      chaos: Math.min(100, newChaos),
      combo,
      items,
      activeEvent: s.activeEvent,
      lastSpawnTime: lastSpawn,
      stats: newStats,
      catchFlash,
      comboPopup,
    };
  }

  return {
    ...s,
    score: newScore,
    lives: newLives,
    chaos: newChaos,
    combo,
    items,
    activeEvent: s.activeEvent,
    lastSpawnTime: lastSpawn,
    stats: newStats,
    catchFlash,
    comboPopup,
  };
}

// ── Player movement ──────────────────────────────────────────────────
export function movePlayer(state: GameState, direction: 'left' | 'right'): GameState {
  if (state.status !== 'playing') return state;

  const eff = state.activeEvent?.effects;
  const reverse = eff?.reverseControls ?? false;
  const effectDir = reverse
    ? direction === 'left' ? 'right' : 'left'
    : direction;

  const delta = effectDir === 'left' ? -1 : 1;
  const newLane = Math.max(0, Math.min(LANES - 1, state.playerLane + delta));

  return { ...state, playerLane: newLane, playerMoveTarget: newLane };
}

export function setPlayerLane(state: GameState, lane: number): GameState {
  if (state.status !== 'playing') return state;
  return { ...state, playerLane: lane, playerMoveTarget: lane };
}

// ── Game over stats ──────────────────────────────────────────────────
export function getGameOverStats(state: GameState): GameOverStats {
  return {
    ...state.stats,
    score: state.score,
    highScore: state.highScore,
    isNewHighScore: state.score >= state.highScore && state.score > 0,
    survivalTime: state.gameTime,
  };
}

// ── Funny summaries ──────────────────────────────────────────────────
export function getFunnySummary(stats: GameOverStats): string {
  if (stats.trollCaught >= 3) return '👻 Вас обманул склад. Три раза.';
  if (stats.badCaught >= 5) return '🚫 Брак принимали как родной. Склад в ужасе.';
  if (stats.maxCombo >= 15) return '🔥 Легенда склада. Кладовщик года!';
  if (stats.maxCombo >= 8) return '⚡ Отличная серия! Прораб доволен.';
  if (stats.caught < 5) return '📦 Товары тосковали в одиночестве...';
  if (stats.eventsLived >= 5) return '🌀 Пережил все хаосы. Железные нервы.';
  if (stats.survivalTime < 20) return '⏱️ Рекорд по скорости вылета с работы.';
  if (stats.score >= 500) return '🏆 Склад работает как швейцарские часы!';
  return '📋 Неплохо. WMS всё ещё не знает, что произошло.';
}
