export type QuestionType = 't1' | 't2' | 't3' | 't4';
export type EnemyType = QuestionType | 'boss' | 'final';
export type TileType = 'start' | 'monster' | 'chest' | 'rest' | 'shop' | 'boss';

export interface Enemy {
  id: string;
  floor: number;
  type: EnemyType;
  name: string;
  maxHp: number;
  atk: number;
  gold: number;
  xp: number;
  img?: string;
  desc: string;
  bossTypes?: QuestionType[];
  diceMap?: Record<string, string>;
}

export type ItemType = 'POTION' | 'SHIELD' | 'SKIP' | 'SWAP';

export interface Item {
  id: string;
  ico: string;
  name: string;
  type: ItemType;
  cost: number;
  effect: string;
}

export interface GridTile {
  id: string;            // `${floor}-${row}-${col}`
  row: number;
  col: number;
  type: TileType;
  enemy?: Enemy;         // monster / boss tiles
  itemId?: string;       // chest tiles
  shopItemIds?: string[];
  cleared: boolean;
}

export interface FloorBoard {
  floorNumber: number;
  floorName: string;
  width: number;
  height: number;
  tiles: GridTile[][];
}

export interface RestCard {
  ico: string;
  title: string;
  text: string;
  hpHeal: number;
  bonusXp?: number;
}

export interface Part1Question {
  id: string;
  type: 't1';
  sentence: string;
  options: [string, string, string, string];
  answer: string;
  tip: string;
}

export interface Part2Question {
  id: string;
  type: 't2';
  sentence: string;
  answer: string;
  tip: string;
}

export interface Part3Question {
  id: string;
  type: 't3';
  sentence: string;
  stem: string;
  answer: string;
  tip: string;
}

export interface Part4Question {
  id: string;
  type: 't4';
  sentence: string;
  beginWith: string;
  keyword: string;
  answer: string | string[];  // multiple accepted forms
  tip: string;
}

export type Question =
  | Part1Question
  | Part2Question
  | Part3Question
  | Part4Question;

export interface InventoryItem extends Item {
  instanceId: string;
}

export type ActiveEffect =
  | { kind: 'shield'; charges: number }
  | { kind: 'skip'; charges: number }
  | { kind: 'swap'; charges: number };

export interface PlayerState {
  hp: number;
  maxHp: number;
  xp: number;
  gold: number;
  inventory: InventoryItem[];
  activeEffects: ActiveEffect[];
}

export type CombatPhase = 'rolling' | 'swapping' | 'question' | 'result' | 'defeated';

export interface CombatState {
  enemy: Enemy;
  enemyHp: number;
  currentQuestion: Question | null;
  currentQuestionType: QuestionType | null;
  diceRoll: number | null;
  phase: CombatPhase;
  lastAnswerCorrect: boolean | null;
  log: string[];
}

export type GamePhase =
  | 'title'
  | 'map'
  | 'combat'
  | 'shop'
  | 'rest'
  | 'chest'
  | 'questions'
  | 'victory'
  | 'defeat';

export interface QuestionProgress {
  discovered: boolean;
  strength: number;    // 0–5
  correct: number;
  incorrect: number;
}

export interface ShopState {
  tileId: string;
  itemIds: string[];
  purchased: string[];
}

export interface GameState {
  phase: GamePhase;
  currentFloor: number;
  playerPos: { row: number; col: number };
  floorBoard: FloorBoard | null;
  shopPurchases: Record<string, string[]>;
  player: PlayerState;
  combat: CombatState | null;
  shopState: ShopState | null;
  currentRest: RestCard | null;
  currentChestItemId: string | null;
  questionProgress: Record<string, QuestionProgress>;
}
