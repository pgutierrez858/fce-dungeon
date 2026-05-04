import type { FloorBoard, GraphNode, Enemy, QuestionType, TileType, EnemyAction, EnemyActionEffect, EnemyPattern, EventKind } from '../types';

const BASE = 'https://static.wikia.nocookie.net/exvius_gamepedia_en/images/';
function img(path: string) { return `${BASE}${path}/revision/latest`; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Enemy action helpers ─────────────────────────────────────────

function act(id: string, icon: string, label: string, effects: EnemyActionEffect[]): EnemyAction {
  return { id, icon, label, effects };
}

type Archetype = 'attacker' | 'blocker' | 'strengthener' | 'mixed';
const ARCHETYPES: Archetype[] = ['attacker', 'blocker', 'strengthener', 'mixed'];

function makeEnemyCombat(atk: number, floor: number): { actions: EnemyAction[]; pattern: EnemyPattern } {
  const archetype: Archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
  const blk = Math.max(3, Math.round(atk * 1.5));
  const str = floor >= 3 ? 2 : 1;
  const atkH = atk + Math.floor(atk * 0.6);

  switch (archetype) {
    case 'attacker':
      return {
        actions: [act('atk', '⚔', `Attack ${atk}`, [{ kind: 'attack', damage: atk }])],
        pattern: { kind: 'fixed', actionId: 'atk' },
      };
    case 'blocker':
      return {
        actions: [
          act('atk', '⚔', `Attack ${atk}`, [{ kind: 'attack', damage: atk }]),
          act('blk', '🛡', `Block ${blk}`, [{ kind: 'block', amount: blk }]),
        ],
        pattern: { kind: 'sequence', actionIds: ['blk', 'atk', 'atk'] },
      };
    case 'strengthener':
      return {
        actions: [
          act('atk', '⚔', `Attack ${atk}`, [{ kind: 'attack', damage: atk }]),
          act('str', '💪', `Strengthen ${str}`, [{ kind: 'strengthen', amount: str }]),
        ],
        pattern: { kind: 'dice', faceMap: { 1: 'str', 2: 'atk', 3: 'atk', 4: 'atk', 5: 'atk', 6: 'str' } },
      };
    case 'mixed':
    default:
      return {
        actions: [
          act('atk', '⚔', `Attack ${atk}`, [{ kind: 'attack', damage: atk }]),
          act('ath', '💥', `Heavy Attack ${atkH}`, [{ kind: 'attack', damage: atkH }]),
          act('blk', '🛡', `Block ${blk}`, [{ kind: 'block', amount: blk }]),
        ],
        pattern: { kind: 'dice', faceMap: { 1: 'blk', 2: 'atk', 3: 'atk', 4: 'ath', 5: 'ath', 6: 'blk' } },
      };
  }
}

// ── Floor configs ────────────────────────────────────────────────

interface EnemyEntry { name: string; desc: string; img?: string; dropsCommandCard?: boolean; }

interface BossConfig extends Omit<Enemy, 'floor'> {}

interface FloorConfig {
  floorName: string;
  qType: QuestionType;
  enemyPool: EnemyEntry[];
  hpRange:   [number, number];
  atkRange:  [number, number];
  goldRange: [number, number];
  xpRange:   [number, number];
  boss: BossConfig;
}

const FLOOR_CONFIGS: Record<number, FloorConfig> = {
  1: {
    floorName: 'Frost Caverns',
    qType: 't1',
    enemyPool: [
      { name: 'Ice Coeurl',      img: img('3/33/Monster-86.png'),  desc: 'A sleek feline wreathed in frost. Weak but swift.' },
      { name: 'Frozen Corpse',   img: img('b/bc/Monster-79.png'),  desc: 'An undead soldier entombed in ice.' },
      { name: 'Crystal Golem',   img: img('3/3c/Monster-117.png'), desc: 'A lumbering construct of living quartz.', dropsCommandCard: true },
      { name: 'Lich Acolyte',    img: img('2/24/Monster-75.png'),  desc: 'A skeletal mage serving the Lich Empress.' },
      { name: "Shiva's Herald",  img: img('7/7f/Monster-88.png'),  desc: 'An elite guard of crystalline light.', dropsCommandCard: true },
      { name: 'Frost Drake',     img: img('5/5a/Monster-119.png'), desc: 'A juvenile dragon coated in permafrost.' },
    ],
    hpRange: [10, 18], atkRange: [3, 5], goldRange: [1, 3], xpRange: [1, 3],
    boss: {
      id: 'boss-1', type: 'boss', name: 'SHIVA',
      img: img('4/49/Monster-101.png'),
      desc: 'The Empress of Ice — her gaze freezes the mind as thoroughly as the body.',
      maxHp: 50, gold: 8, xp: 8,
      dropsCommandCard: true, dropsPotion: true,
      actions: [
        act('freeze',   '❄',  'Freeze — Attack 7',    [{ kind: 'attack',    damage: 7 }]),
        act('barrier',  '🛡',  'Ice Barrier — Block 12', [{ kind: 'block',   amount: 12 }]),
        act('blizzard', '🌨', 'Blizzard — Attack 10',  [{ kind: 'attack',    damage: 10 }]),
        act('chill',    '💨', 'Chill — Strengthen 1', [{ kind: 'strengthen', amount: 1 }]),
      ],
      pattern: { kind: 'sequence', actionIds: ['barrier', 'freeze', 'freeze', 'blizzard', 'chill', 'freeze'] },
      bossAbility: { kind: 'shiva' },
    },
  },
  2: {
    floorName: 'Earthen Depths',
    qType: 't2',
    enemyPool: [
      { name: 'Thorn Fiend',   img: img('e/e2/Monster-29.png'),  desc: 'A vine-wrapped beast that chokes on bad grammar.' },
      { name: 'Swamp Gigas',   img: img('b/b0/Monster-133.png'), desc: 'A moss-covered giant of the foul marshes.', dropsCommandCard: true },
      { name: 'Pack Warg',     img: img('0/02/Monster-9.png'),   desc: 'A wolf-like predator running in shadowed packs.' },
      { name: 'Mire Serpent',  img: img('4/46/Monster-25.png'),  desc: 'A massive scaled creature lurking in black water.', dropsCommandCard: true },
      { name: 'Jungle Reaper', img: img('3/39/Monster-89.png'),  desc: 'A reaping specter haunting the overgrown halls.' },
      { name: 'Feral Garuda',  img: img('0/00/Monster-129.png'), desc: 'A tempest bird with talons like broken syntax.' },
    ],
    hpRange: [15, 25], atkRange: [5, 8], goldRange: [2, 4], xpRange: [2, 4],
    boss: {
      id: 'boss-2', type: 'boss', name: 'BEHEMOTH',
      img: img('e/e0/Monster-125.png'),
      desc: 'A colossus of living stone — it answers every wrong word with a tremor.',
      maxHp: 70, gold: 12, xp: 12,
      dropsCommandCard: true, dropsPotion: true,
      actions: [
        act('slam',    '⚔',  'Slam — Attack 9',       [{ kind: 'attack',    damage: 9 }]),
        act('bulk',    '💪',  'Bulk Up — Strengthen 1',[{ kind: 'strengthen', amount: 1 }]),
        act('fortify', '🛡',  'Fortify — Block 12',    [{ kind: 'block',     amount: 12 }]),
        act('crush',   '💥',  'Crush — Attack 13',     [{ kind: 'attack',    damage: 13 }]),
      ],
      pattern: { kind: 'sequence', actionIds: ['slam', 'fortify', 'slam', 'bulk', 'crush', 'slam'] },
      bossAbility: { kind: 'behemoth' },
    },
  },
  3: {
    floorName: 'Temporal Labyrinth',
    qType: 't3',
    enemyPool: [
      { name: 'Apprentice Mage', img: img('c/c8/Monster-37.png'), desc: 'A novice spellcaster, dangerous only to prefixes.' },
      { name: 'Fire Elemental',  img: img('d/db/Monster-52.png'), desc: 'A living flame that scorches verb endings.', dropsCommandCard: true },
      { name: 'Rune Sentinel',   img: img('1/16/Monster-61.png'), desc: 'A stone guardian inscribed with arcane suffixes.' },
      { name: 'Thunder Mage',    img: img('9/9d/Monster-36.png'), desc: 'A lightning-wreathed sorcerer of unstable form.', dropsCommandCard: true },
      { name: 'Void Sorcerer',   img: img('8/86/Monster-35.png'), desc: 'A dark adept who warps the shape of words.' },
      { name: 'Storm Elemental', img: img('4/46/Monster-54.png'), desc: 'A churning cyclone of magical syllables.' },
    ],
    hpRange: [20, 32], atkRange: [7, 10], goldRange: [3, 5], xpRange: [3, 5],
    boss: {
      id: 'boss-3', type: 'boss', name: 'ULTIMECIA',
      img: img('7/74/Monster-55.png'),
      desc: 'The Sorceress of Time — she compresses futures and stretches painful presents.',
      maxHp: 90, gold: 16, xp: 16,
      dropsCommandCard: true, dropsPotion: true,
      actions: [
        act('timeslip', '⌛', 'Time Slip — Attack 9',   [{ kind: 'attack',    damage: 9 }]),
        act('haste',    '💨', 'Haste — Strengthen 2',   [{ kind: 'strengthen', amount: 2 }]),
        act('timelock', '🔒', 'Time Lock — Attack 12',  [{ kind: 'attack',    damage: 12 }]),
        act('barrier',  '🛡', 'Null Ward — Block 10',   [{ kind: 'block',     amount: 10 }]),
      ],
      pattern: { kind: 'dice', faceMap: { 1: 'haste', 2: 'timeslip', 3: 'timeslip', 4: 'timelock', 5: 'barrier', 6: 'haste' } },
      bossAbility: { kind: 'ultimecia' },
    },
  },
  4: {
    floorName: 'Iron Citadel',
    qType: 't4',
    enemyPool: [
      { name: 'Dark Squire',     img: img('3/31/Monster-40.png'),  desc: 'A knight in training with poor paraphrasing skills.' },
      { name: 'Iron Lancer',     img: img('d/d9/Monster-41.png'),  desc: 'A disciplined soldier of the Dark Citadel.', dropsCommandCard: true },
      { name: 'Dusk Knight',     img: img('f/f5/Monster-44.png'),  desc: 'A twilight warrior wielding reversed clauses.' },
      { name: 'Shadow Dragoon',  img: img('8/81/Monster-38.png'),  desc: 'A leaping dark knight who inverts all sentences.', dropsCommandCard: true },
      { name: 'Fell Dragon',     img: img('7/78/Monster-47.png'),  desc: 'A corrupted dragon breathing passive-voice flame.' },
      { name: 'Obsidian Knight', img: img('1/10/Monster-94.png'),  desc: 'The elite guard of Gabranth, master of conditionals.', dropsCommandCard: true },
    ],
    hpRange: [28, 40], atkRange: [9, 13], goldRange: [4, 6], xpRange: [4, 6],
    boss: {
      id: 'boss-4', type: 'boss', name: 'GABRANTH',
      img: img('4/47/Monster-134.png'),
      desc: 'The Iron Judge — his sentence is delivered in steel and grammar alike.',
      maxHp: 110, gold: 20, xp: 20,
      dropsCommandCard: true, dropsPotion: true,
      actions: [
        act('judge',   '⚔',  'Judge — Attack 11',     [{ kind: 'attack',    damage: 11 }]),
        act('condemn', '💪',  'Condemn — Strengthen 2',[{ kind: 'strengthen', amount: 2 }]),
        act('parry',   '🛡',  'Parry — Block 14',      [{ kind: 'block',     amount: 14 }]),
        act('sentence','💥',  'Final Sentence — Attack 16', [{ kind: 'attack', damage: 16 }]),
      ],
      pattern: { kind: 'sequence', actionIds: ['judge', 'condemn', 'parry', 'judge', 'sentence', 'judge'] },
      bossAbility: { kind: 'gabranth' },
    },
  },
  5: {
    floorName: "Dragon's Sanctum",
    qType: 't1',
    enemyPool: [
      { name: 'Ice Wraith',      desc: "A spectral shard of Shiva's lingering power.", dropsCommandCard: true },
      { name: 'Sanctum Beast',   desc: "A primordial beast sealed in Bahamut's sanctum." },
      { name: 'Arcane Revenant', desc: "A spirit twisted by Ultimecia's time magic.", dropsCommandCard: true },
      { name: 'Dark Phantom',    desc: "The shadow of Gabranth, lurking in the citadel ruins." },
      { name: 'Void Drake',      desc: 'A drake that phases in and out of reality.', dropsCommandCard: true },
      { name: 'Chaos Wyrm',      desc: 'A wyrm twisted by the chaos of the deep.' },
    ],
    hpRange: [35, 50], atkRange: [11, 16], goldRange: [5, 8], xpRange: [5, 8],
    boss: {
      id: 'boss-5', type: 'boss', name: 'BAHAMUT',
      img: img('4/49/Monster-126.png'),
      desc: 'The Dragon King — master of all language, destroyer of worlds. Only the sharpest mind survives.',
      maxHp: 140, gold: 30, xp: 30,
      dropsCommandCard: true, dropsPotion: true,
      actions: [
        act('claw',      '🐉', 'Claw — Attack 13',        [{ kind: 'attack',    damage: 13 }]),
        act('dread',     '💪', 'Dread Aura — Strengthen 3',[{ kind: 'strengthen', amount: 3 }]),
        act('scale',     '🛡', 'Dragon Scale — Block 16',  [{ kind: 'block',     amount: 16 }]),
        act('megaflare', '🔥', 'Megaflare — Attack 20',   [{ kind: 'attack',    damage: 20 }]),
      ],
      pattern: { kind: 'sequence', actionIds: ['claw', 'dread', 'scale', 'megaflare', 'claw', 'claw', 'megaflare'] },
      bossAbility: { kind: 'bahamut' },
    },
  },
};

const ALL_Q_TYPES: QuestionType[] = ['t1', 't2', 't3', 't4'];
const ALL_EVENT_KINDS: EventKind[] = [
  'potion-trade', 'command-upgrade', 'cursed-mirror',
  'ancient-altar', 'dark-ritual', 'enemy-encounter',
];

export function generateRandomEnemy(floorNumber: number): Enemy {
  const cfg = FLOOR_CONFIGS[floorNumber];
  const idx = Math.floor(Math.random() * cfg.enemyPool.length);
  const nodeId = `event-${floorNumber}-${Date.now()}`;
  return makeEnemy(floorNumber, nodeId, idx);
}

const CHEST_ITEM_POOLS: Record<number, string[]> = {
  1: ['i3', 'i5', 'i1'],
  2: ['i3', 'i4', 'i1', 'i5'],
  3: ['i4', 'i3', 'i2', 'i1', 'i5'],
  4: ['i4', 'i2', 'i6', 'i1', 'i5'],
  5: ['i2', 'i4', 'i6', 'i1', 'i5'],
};

const SHOP_ITEM_POOLS: Record<number, string[]> = {
  1: ['i1', 'i3', 'i5'],
  2: ['i1', 'i3', 'i4', 'i5', 'i6'],
  3: ['i1', 'i3', 'i4', 'i2', 'i5', 'i6'],
  4: ['i1', 'i4', 'i2', 'i5', 'i6'],
  5: ['i1', 'i4', 'i2', 'i6', 'i5'],
};

const X_POSITIONS: Record<number, number[]> = {
  1: [50],
  2: [25, 75],
  3: [18, 50, 82],
  4: [12, 37, 63, 88],
};

const LAYER_TYPE_TEMPLATES: TileType[][] = [
  ['monster', 'monster', 'rest'],
  ['monster', 'chest',   'shop'],
  ['monster', 'monster', 'rest', 'chest'],
  ['monster', 'monster', 'shop'],
  ['monster', 'monster', 'rest'],
  ['monster', 'chest'],
];

function makeEnemy(floorNumber: number, nodeId: string, idx: number): Enemy {
  const cfg = FLOOR_CONFIGS[floorNumber];
  const entry = cfg.enemyPool[idx % cfg.enemyPool.length];
  const qType: QuestionType = floorNumber === 5 ? pickRandom(ALL_Q_TYPES) : cfg.qType;
  const atk = rand(cfg.atkRange[0], cfg.atkRange[1]);
  const { actions, pattern } = makeEnemyCombat(atk, floorNumber);
  return {
    id: `${nodeId}-enemy`,
    floor: floorNumber,
    type: qType,
    name: entry.name,
    desc: entry.desc,
    img:  entry.img,
    maxHp: rand(cfg.hpRange[0], cfg.hpRange[1]),
    gold:  rand(cfg.goldRange[0], cfg.goldRange[1]),
    xp:    rand(cfg.xpRange[0],   cfg.xpRange[1]),
    actions,
    pattern,
    dropsCommandCard: entry.dropsCommandCard ?? false,
  };
}

function buildConnections(layerNodes: GraphNode[][]): void {
  for (let l = 0; l < layerNodes.length - 1; l++) {
    const current = layerNodes[l];
    const next    = layerNodes[l + 1];

    for (const node of current) {
      const sorted = [...next].sort((a, b) =>
        Math.abs(a.xPct - node.xPct) - Math.abs(b.xPct - node.xPct)
      );
      node.connections.push(sorted[0].id);
    }

    for (const nextNode of next) {
      const hasIncoming = current.some(n => n.connections.includes(nextNode.id));
      if (!hasIncoming) {
        const closest = [...current].sort((a, b) =>
          Math.abs(a.xPct - nextNode.xPct) - Math.abs(b.xPct - nextNode.xPct)
        )[0];
        closest.connections.push(nextNode.id);
      }
    }

    for (const node of current) {
      if (node.connections.length < 2 && Math.random() < 0.40) {
        const candidates = next.filter(n => !node.connections.includes(n.id));
        if (candidates.length > 0) {
          const sorted = candidates.sort((a, b) =>
            Math.abs(a.xPct - node.xPct) - Math.abs(b.xPct - node.xPct)
          );
          node.connections.push(sorted[0].id);
        }
      }
    }
  }
}

export function generateFloor(floorNumber: number): FloorBoard {
  const cfg = FLOOR_CONFIGS[floorNumber];
  let nodeCounter = 0;
  const makeId = () => `${floorNumber}-n${nodeCounter++}`;

  const chestPool = shuffle(CHEST_ITEM_POOLS[floorNumber]);
  let monsterIdx = 0;
  let chestIdx   = 0;

  // One event room per floor: pick a random layer (1–6) and a random event kind
  const eventLayer = rand(1, 6);
  const eventKind  = pickRandom(ALL_EVENT_KINDS);

  const allNodes: GraphNode[] = [];
  const layerNodes: GraphNode[][] = [];

  const startId = makeId();
  const startNode: GraphNode = {
    id: startId, type: 'start', layer: 0, xPct: 50, connections: [], cleared: true,
  };
  allNodes.push(startNode);
  layerNodes.push([startNode]);

  for (let l = 1; l <= 6; l++) {
    const rawTypes = shuffle([...LAYER_TYPE_TEMPLATES[l - 1]]);

    // Inject event room: replace first 'monster' in the chosen layer
    if (l === eventLayer) {
      const mi = rawTypes.indexOf('monster');
      if (mi !== -1) rawTypes[mi] = 'event';
    }

    const types = rawTypes;
    const xPositions = X_POSITIONS[types.length];
    const layer: GraphNode[] = [];

    types.forEach((type, i) => {
      const id = makeId();
      const base: GraphNode = { id, type, layer: l, xPct: xPositions[i], connections: [], cleared: false };

      if (type === 'monster') {
        base.enemy = makeEnemy(floorNumber, id, monsterIdx++);
      } else if (type === 'chest') {
        base.itemId = chestPool[chestIdx++ % chestPool.length];
      } else if (type === 'shop') {
        base.shopItemIds = shuffle(SHOP_ITEM_POOLS[floorNumber]).slice(0, 4);
      } else if (type === 'event') {
        base.eventKind = eventKind;
      }

      layer.push(base);
      allNodes.push(base);
    });

    layerNodes.push(layer);
  }

  const bossId = makeId();
  const bossNode: GraphNode = {
    id: bossId, type: 'boss', layer: 7, xPct: 50, connections: [],
    enemy: { ...cfg.boss, floor: floorNumber },
    cleared: false,
  };
  allNodes.push(bossNode);
  layerNodes.push([bossNode]);

  buildConnections(layerNodes);

  return { floorNumber, floorName: cfg.floorName, nodes: allNodes, layerCount: layerNodes.length };
}
