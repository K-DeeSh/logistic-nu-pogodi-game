import type { ActiveEvent, EventEffects } from '../types/game';

const DEFAULT_EFFECTS: EventEffects = {
  speedMultiplier: 1,
  scoreMultiplier: 1,
  reverseControls: false,
  chaosMultiplier: 1,
  disguiseBad: false,
  disguiseVIP: false,
  flickerItems: false,
  spawnRateMultiplier: 1,
  vipBonusMultiplier: 1,
  badSpawnBoost: 0,
  comboMultiplier: 1,
};

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: Partial<EventEffects>;
  minTime: number; // minimum game time (seconds) before this event can trigger
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'wms_manual',
    name: '⚡ WMS ушёл в ручной режим',
    description: 'Скорость выше, но очки за обычные товары x2',
    duration: 8,
    effects: { speedMultiplier: 1.5, scoreMultiplier: 2 },
    minTime: 20,
  },
  {
    id: 'scanner_reversed',
    name: '🔄 Сканер не в ту сторону',
    description: 'Управление влево/вправо поменялось местами!',
    duration: 7,
    effects: { reverseControls: true },
    minTime: 30,
  },
  {
    id: 'all_vip',
    name: '⭐ Все товары теперь VIP',
    description: 'Почти всё выглядит ценным, но часть — ловушки',
    duration: 8,
    effects: { disguiseVIP: true, vipBonusMultiplier: 1.5 },
    minTime: 45,
  },
  {
    id: 'inventory',
    name: '📋 Инвентаризация в разгар смены',
    description: 'Меньше товаров, но штраф за ошибку выше',
    duration: 9,
    effects: { spawnRateMultiplier: 0.5, chaosMultiplier: 2 },
    minTime: 25,
  },
  {
    id: 'integration_unstable',
    name: '🌀 Интеграция жива, но это не точно',
    description: 'Товары мерцают и сложнее читаются',
    duration: 8,
    effects: { flickerItems: true },
    minTime: 40,
  },
  {
    id: 'feng_shui',
    name: '🧘 Склад работает по фэншую',
    description: 'Ничего не изменилось, просто поверьте нам',
    duration: 6,
    effects: { scoreMultiplier: 1.3, comboMultiplier: 1.5 },
    minTime: 20,
  },
  {
    id: 'already_shipped',
    name: '📦 Система уверена, что всё отгружено',
    description: 'Score modifier снижен, пока держишь комбо',
    duration: 8,
    effects: { scoreMultiplier: 0.5, comboMultiplier: 2 },
    minTime: 35,
  },
  {
    id: 'friday_release',
    name: '🍕 Пятничный релиз',
    description: 'Всё чуть быстрее и хаотичнее',
    duration: 7,
    effects: { speedMultiplier: 1.4, spawnRateMultiplier: 1.4, chaosMultiplier: 1.3 },
    minTime: 20,
  },
  {
    id: 'manual_mode',
    name: '🔧 Ручной режим',
    description: 'Больше обычных товаров, скорость выше',
    duration: 9,
    effects: { speedMultiplier: 1.3, scoreMultiplier: 1.5 },
    minTime: 15,
  },
  {
    id: 'vip_watching',
    name: '👁️ VIP клиент смотрит прямо сейчас',
    description: 'VIP-объекты дают огромный бонус!',
    duration: 8,
    effects: { vipBonusMultiplier: 4, scoreMultiplier: 1.2 },
    minTime: 30,
  },
  {
    id: 'team_update',
    name: '💥 Соседняя команда выкатила обновление',
    description: 'Внезапный всплеск плохих объектов',
    duration: 6,
    effects: { badSpawnBoost: 30, spawnRateMultiplier: 1.3 },
    minTime: 40,
  },
  {
    id: 'resort',
    name: '🔀 Срочная пересортировка',
    description: 'Визуальный хаос, но логика ловли прежняя',
    duration: 7,
    effects: { flickerItems: true, speedMultiplier: 1.2, scoreMultiplier: 1.4 },
    minTime: 35,
  },
  {
    id: 'black_friday',
    name: '🛒 Чёрная пятница началась раньше времени',
    description: 'Максимальная нагрузка! Всё летит!',
    duration: 7,
    effects: { speedMultiplier: 1.6, spawnRateMultiplier: 1.8, scoreMultiplier: 1.5 },
    minTime: 60,
  },
  {
    id: 'marking_optional',
    name: '📵 Маркировка optional',
    description: 'Плохие товары выглядят как нормальные',
    duration: 7,
    effects: { disguiseBad: true, chaosMultiplier: 1.5 },
    minTime: 40,
  },
  {
    id: 'algo_optimized',
    name: '🤖 Алгоритм оптимизировал склад',
    description: 'Всё падает быстрее, зато комбо-множитель выше',
    duration: 9,
    effects: { speedMultiplier: 1.5, comboMultiplier: 2.5 },
    minTime: 50,
  },
];

let idCounter = 0;

export function buildEvent(template: EventTemplate): ActiveEvent {
  return {
    id: `event_${++idCounter}`,
    name: template.name,
    description: template.description,
    duration: template.duration,
    timeLeft: template.duration,
    effects: { ...DEFAULT_EFFECTS, ...template.effects },
  };
}

export function getAvailableEvents(gameTime: number): EventTemplate[] {
  return EVENT_TEMPLATES.filter((e) => gameTime >= e.minTime);
}

export function pickRandomEvent(gameTime: number): ActiveEvent | null {
  const available = getAvailableEvents(gameTime);
  if (available.length === 0) return null;
  const template = available[Math.floor(Math.random() * available.length)];
  return buildEvent(template);
}
