import type { FloorBoard, GridTile, Enemy, QuestionType } from '../types';

const BASE = 'https://static.wikia.nocookie.net/exvius_gamepedia_en/images/';

function img(path: string) {
  return `${BASE}${path}/revision/latest`;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface EnemyEntry { name: string; desc: string; img?: string; }

interface FloorConfig {
  floorName: string;
  qType: QuestionType;
  enemyPool: EnemyEntry[];
  hpRange:   [number, number];
  atkRange:  [number, number];
  goldRange: [number, number];
  xpRange:   [number, number];
  boss: Omit<Enemy, 'floor'>;
}

const FLOOR_CONFIGS: Record<number, FloorConfig> = {
  1: {
    floorName: 'Frost Caverns',
    qType: 't1',
    enemyPool: [
      { name: 'Ice Coeurl',      img: img('3/33/Monster-86.png'),  desc: 'A sleek feline wreathed in frost. Weak but swift.' },
      { name: 'Frozen Corpse',   img: img('b/bc/Monster-79.png'),  desc: 'An undead soldier entombed in ice.' },
      { name: 'Crystal Golem',   img: img('3/3c/Monster-117.png'), desc: 'A lumbering construct of living quartz.' },
      { name: 'Lich Acolyte',    img: img('2/24/Monster-75.png'),  desc: 'A skeletal mage serving the Lich Empress.' },
      { name: "Shiva's Herald",  img: img('7/7f/Monster-88.png'),  desc: 'An elite guard of crystalline light.' },
      { name: 'Frost Drake',     img: img('5/5a/Monster-119.png'), desc: 'A juvenile dragon coated in permafrost.' },
    ],
    hpRange: [2, 4], atkRange: [1, 2], goldRange: [1, 3], xpRange: [1, 3],
    boss: {
      id: 'boss-1', type: 'boss',
      name: 'SHIVA',
      img: img('4/49/Monster-101.png'),
      desc: 'The Empress of Ice — her gaze freezes the mind as thoroughly as the body.',
      maxHp: 6, atk: 2, gold: 8, xp: 8,
      bossTypes: ['t1'],
    },
  },
  2: {
    floorName: 'Earthen Depths',
    qType: 't2',
    enemyPool: [
      { name: 'Thorn Fiend',  img: img('e/e2/Monster-29.png'),  desc: 'A vine-wrapped beast that chokes on bad grammar.' },
      { name: 'Swamp Gigas',  img: img('b/b0/Monster-133.png'), desc: 'A moss-covered giant of the foul marshes.' },
      { name: 'Pack Warg',    img: img('0/02/Monster-9.png'),   desc: 'A wolf-like predator running in shadowed packs.' },
      { name: 'Mire Serpent', img: img('4/46/Monster-25.png'),  desc: 'A massive scaled creature lurking in black water.' },
      { name: 'Jungle Reaper',img: img('3/39/Monster-89.png'),  desc: 'A reaping specter haunting the overgrown halls.' },
      { name: 'Feral Garuda', img: img('0/00/Monster-129.png'), desc: 'A tempest bird with talons like broken syntax.' },
    ],
    hpRange: [3, 5], atkRange: [2, 3], goldRange: [2, 4], xpRange: [2, 4],
    boss: {
      id: 'boss-2', type: 'boss',
      name: 'BEHEMOTH',
      img: img('e/e0/Monster-125.png'),
      desc: 'A colossus of living stone — it answers every wrong word with a tremor.',
      maxHp: 8, atk: 3, gold: 12, xp: 12,
      bossTypes: ['t1', 't2'],
      diceMap: { '1': 't1', '2': 't1', '3': 't1', '4': 't2', '5': 't2', '6': 't2' },
    },
  },
  3: {
    floorName: 'Temporal Labyrinth',
    qType: 't3',
    enemyPool: [
      { name: 'Apprentice Mage', img: img('c/c8/Monster-37.png'), desc: 'A novice spellcaster, dangerous only to prefixes.' },
      { name: 'Fire Elemental',  img: img('d/db/Monster-52.png'), desc: 'A living flame that scorches verb endings.' },
      { name: 'Rune Sentinel',   img: img('1/16/Monster-61.png'), desc: 'A stone guardian inscribed with arcane suffixes.' },
      { name: 'Thunder Mage',    img: img('9/9d/Monster-36.png'), desc: 'A lightning-wreathed sorcerer of unstable form.' },
      { name: 'Void Sorcerer',   img: img('8/86/Monster-35.png'), desc: 'A dark adept who warps the shape of words.' },
      { name: 'Storm Elemental', img: img('4/46/Monster-54.png'), desc: 'A churning cyclone of magical syllables.' },
    ],
    hpRange: [4, 6], atkRange: [2, 3], goldRange: [3, 5], xpRange: [3, 5],
    boss: {
      id: 'boss-3', type: 'boss',
      name: 'ULTIMECIA',
      img: img('7/74/Monster-55.png'),
      desc: 'The Sorceress of Time — she compresses futures and stretches painful presents.',
      maxHp: 10, atk: 3, gold: 16, xp: 16,
      bossTypes: ['t1', 't2', 't3'],
      diceMap: { '1': 't1', '2': 't1', '3': 't2', '4': 't2', '5': 't3', '6': 't3' },
    },
  },
  4: {
    floorName: 'Iron Citadel',
    qType: 't4',
    enemyPool: [
      { name: 'Dark Squire',     img: img('3/31/Monster-40.png'),  desc: 'A knight in training with poor paraphrasing skills.' },
      { name: 'Iron Lancer',     img: img('d/d9/Monster-41.png'),  desc: 'A disciplined soldier of the Dark Citadel.' },
      { name: 'Dusk Knight',     img: img('f/f5/Monster-44.png'),  desc: 'A twilight warrior wielding reversed clauses.' },
      { name: 'Shadow Dragoon',  img: img('8/81/Monster-38.png'),  desc: 'A leaping dark knight who inverts all sentences.' },
      { name: 'Fell Dragon',     img: img('7/78/Monster-47.png'),  desc: 'A corrupted dragon breathing passive-voice flame.' },
      { name: 'Obsidian Knight', img: img('1/10/Monster-94.png'),  desc: 'The elite guard of Gabranth, master of conditionals.' },
    ],
    hpRange: [5, 7], atkRange: [3, 4], goldRange: [4, 6], xpRange: [4, 6],
    boss: {
      id: 'boss-4', type: 'boss',
      name: 'GABRANTH',
      img: img('4/47/Monster-134.png'),
      desc: 'The Iron Judge — his sentence is delivered in steel and grammar alike.',
      maxHp: 12, atk: 4, gold: 20, xp: 20,
      bossTypes: ['t1', 't2', 't3', 't4'],
      diceMap: { '1': 't1', '2': 't2', '3': 't2', '4': 't3', '5': 't4', '6': 't4' },
    },
  },
  5: {
    floorName: "Dragon's Sanctum",
    qType: 't1',
    enemyPool: [
      { name: 'Ice Wraith',      desc: "A spectral shard of Shiva's lingering power." },
      { name: 'Sanctum Beast',   desc: "A primordial beast sealed in Bahamut's sanctum." },
      { name: 'Arcane Revenant', desc: "A spirit twisted by Ultimecia's time magic." },
      { name: 'Dark Phantom',    desc: "The shadow of Gabranth, lurking in the citadel ruins." },
      { name: 'Void Drake',      desc: 'A drake that phases in and out of reality.' },
      { name: 'Chaos Wyrm',      desc: 'A wyrm twisted by the chaos of the deep.' },
    ],
    hpRange: [6, 8], atkRange: [3, 5], goldRange: [5, 8], xpRange: [5, 8],
    boss: {
      id: 'boss-5', type: 'boss',
      name: 'BAHAMUT',
      img: img('4/49/Monster-126.png'),
      desc: 'The Dragon King — master of all language, destroyer of worlds. Only the sharpest mind survives.',
      maxHp: 15, atk: 5, gold: 30, xp: 30,
      bossTypes: ['t1', 't2', 't3', 't4'],
      diceMap: { '1': 't1', '2': 't2', '3': 't2', '4': 't3', '5': 't4', '6': 't4' },
    },
  },
};

const ALL_Q_TYPES: QuestionType[] = ['t1', 't2', 't3', 't4'];

const CHEST_ITEM_POOLS: Record<number, string[]> = {
  1: ['i3', 'i6', 'i4', 'i1'],
  2: ['i1', 'i4', 'i5', 'i6', 'i3'],
  3: ['i1', 'i5', 'i7', 'i8', 'i4'],
  4: ['i2', 'i7', 'i8', 'i9', 'i12'],
  5: ['i2', 'i10', 'i9', 'i12', 'i11'],
};

const SHOP_ITEM_POOLS: Record<number, string[]> = {
  1: ['i1', 'i3', 'i4', 'i6', 'i5'],
  2: ['i1', 'i3', 'i4', 'i5', 'i6', 'i7'],
  3: ['i1', 'i4', 'i5', 'i6', 'i7', 'i8', 'i11'],
  4: ['i2', 'i5', 'i7', 'i8', 'i9', 'i12', 'i11'],
  5: ['i2', 'i7', 'i8', 'i9', 'i10', 'i11', 'i12'],
};

function makeEnemy(floorNumber: number, tileId: string, idx: number): Enemy {
  const cfg = FLOOR_CONFIGS[floorNumber];
  const entry = cfg.enemyPool[idx % cfg.enemyPool.length];
  const qType: QuestionType = floorNumber === 5 ? pickRandom(ALL_Q_TYPES) : cfg.qType;
  return {
    id: `${tileId}-enemy`,
    floor: floorNumber,
    type: qType,
    name: entry.name,
    desc: entry.desc,
    img:  entry.img,
    maxHp: rand(cfg.hpRange[0],   cfg.hpRange[1]),
    atk:   rand(cfg.atkRange[0],  cfg.atkRange[1]),
    gold:  rand(cfg.goldRange[0], cfg.goldRange[1]),
    xp:    rand(cfg.xpRange[0],   cfg.xpRange[1]),
  };
}

export function generateFloor(floorNumber: number): FloorBoard {
  const cfg = FLOOR_CONFIGS[floorNumber];
  const ROWS = 4;
  const COLS = 6;

  const free: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === 0 && c === 0) continue;
      if (r === ROWS - 1 && c === COLS - 1) continue;
      free.push([r, c]);
    }
  }
  const positions = shuffle(free); // 22 positions

  const tileTypes: Array<'monster' | 'chest' | 'rest' | 'shop'> = [
    ...Array<'monster'>(13).fill('monster'),
    ...Array<'chest'>(4).fill('chest'),
    ...Array<'rest'>(3).fill('rest'),
    ...Array<'shop'>(2).fill('shop'),
  ];

  const chestPool = shuffle(CHEST_ITEM_POOLS[floorNumber]);
  const shopPool  = shuffle(SHOP_ITEM_POOLS[floorNumber]);

  let monsterIdx = 0;
  let chestIdx   = 0;
  let shopIdx    = 0;

  const tileMap = new Map<string, GridTile>();

  tileMap.set('0,0', {
    id: `${floorNumber}-0-0`, row: 0, col: 0,
    type: 'start', cleared: true,
  });

  tileMap.set(`${ROWS - 1},${COLS - 1}`, {
    id: `${floorNumber}-${ROWS - 1}-${COLS - 1}`,
    row: ROWS - 1, col: COLS - 1,
    type: 'boss',
    enemy: { ...cfg.boss, floor: floorNumber },
    cleared: false,
  });

  positions.forEach(([r, c], i) => {
    const type = tileTypes[i];
    const id   = `${floorNumber}-${r}-${c}`;

    let tile: GridTile;

    if (type === 'monster') {
      tile = { id, row: r, col: c, type: 'monster', cleared: false,
               enemy: makeEnemy(floorNumber, id, monsterIdx++) };

    } else if (type === 'chest') {
      tile = { id, row: r, col: c, type: 'chest', cleared: false,
               itemId: chestPool[chestIdx++ % chestPool.length] };

    } else if (type === 'shop') {
      const start = shopIdx * 4;
      let items = shopPool.slice(start, start + 4);
      if (items.length < 4) items = [...items, ...shopPool.slice(0, 4 - items.length)];
      shopIdx++;
      tile = { id, row: r, col: c, type: 'shop', cleared: false, shopItemIds: items };

    } else {
      tile = { id, row: r, col: c, type: 'rest', cleared: false };
    }

    tileMap.set(`${r},${c}`, tile);
  });

  const tiles: GridTile[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: GridTile[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(tileMap.get(`${r},${c}`)!);
    }
    tiles.push(row);
  }

  return { floorNumber, floorName: cfg.floorName, width: COLS, height: ROWS, tiles };
}
