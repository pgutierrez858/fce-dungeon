export type QuestionType = 't1' | 't2' | 't3' | 't4';
export type EnemyType = QuestionType | 'boss' | 'final';
export type TileType = 'start' | 'monster' | 'chest' | 'rest' | 'shop' | 'boss' | 'event';

// ── Commands ────────────────────────────────────────────────────

export type CommandEffect =
  | { kind: 'attack'; damage: number }
  | { kind: 'block'; amount: number }
  | { kind: 'strength'; amount: number };

export interface Command {
  id: string;
  name: string;
  questionType: QuestionType;
  energyCost: number;
  effects: CommandEffect[];
  upgradedEffects: CommandEffect[];
  upgradeCost: number;
  upgraded: boolean;
  description: string;
  upgradedDescription: string;
  uniqueType?: boolean;
  oncePerTurn?: boolean;
}

// ── Enemy ───────────────────────────────────────────────────────

export type EnemyActionEffect =
  | { kind: 'attack'; damage: number }
  | { kind: 'block'; amount: number }
  | { kind: 'strengthen'; amount: number };

export interface EnemyAction {
  id: string;
  icon: string;
  label: string;
  effects: EnemyActionEffect[];
}

export type EnemyPattern =
  | { kind: 'fixed'; actionId: string }
  | { kind: 'sequence'; actionIds: string[] }
  | { kind: 'dice'; faceMap: Record<number, string> };

export type BossAbility =
  | { kind: 'ultimecia' }
  | { kind: 'shiva' }
  | { kind: 'behemoth' }
  | { kind: 'gabranth' }
  | { kind: 'bahamut' };

export type BossCurse =
  | { kind: 'disabled_type'; qType: QuestionType }
  | { kind: 'energy_surge'; positions: number[] }
  | { kind: 'type_override'; qType: QuestionType }
  | { kind: 'strength_leech'; qType: QuestionType };

export interface Enemy {
  id: string;
  floor: number;
  type: EnemyType;
  name: string;
  maxHp: number;
  gold: number;
  xp: number;
  img?: string;
  desc: string;
  actions: EnemyAction[];
  pattern: EnemyPattern;
  dropsCommandCard?: boolean;
  dropsPotion?: boolean;
  bossAbility?: BossAbility;
}

// ── Items ───────────────────────────────────────────────────────

export type ItemType = 'FIRE_POTION' | 'FAIRY' | 'POTION' | 'HIGH_POTION' | 'BLOCK_POTION' | 'STRENGTH_POTION';

export interface Item {
  id: string;
  ico: string;
  name: string;
  type: ItemType;
  cost: number;
  effect: string;
}

// ── Events ──────────────────────────────────────────────────────

export type EventKind =
  | 'potion-trade'      // sell all potions for 10g each (refusable)
  | 'command-upgrade'   // lose all gold, upgrade a command (refusable)
  | 'cursed-mirror'     // remove random command; pay 5HP to reroll
  | 'ancient-altar'     // +15 XP, -5 HP (refusable)
  | 'dark-ritual'       // heal to full, -20% max HP (forced)
  | 'enemy-encounter';  // random enemy fight (forced)

export interface EventState {
  kind: EventKind;
  targetCommandId?: string; // cursed-mirror: which command is slated for removal
}

export interface GraphNode {
  id: string;
  type: TileType;
  layer: number;
  xPct: number;
  connections: string[];
  enemy?: Enemy;
  itemId?: string;
  shopItemIds?: string[];
  eventKind?: EventKind;
  cleared: boolean;
}

export interface FloorBoard {
  floorNumber: number;
  floorName: string;
  nodes: GraphNode[];
  layerCount: number;
}

export interface RestCard {
  ico: string;
  title: string;
  text: string;
  hpHeal: number;
  bonusXp?: number;
}

// ── Questions ───────────────────────────────────────────────────

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
  answer: string | string[];
  tip: string;
}

export interface Part3Question {
  id: string;
  type: 't3';
  sentence: string;
  stem: string;
  answer: string | string[];
  tip: string;
}

export interface Part4Question {
  id: string;
  type: 't4';
  sentence: string;
  beginWith: string;
  keyword: string;
  answer: string | string[];
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
  commands: Command[];
}

// ── Combat ──────────────────────────────────────────────────────

export type CombatPhase =
  | 'player-turn'    // player selects commands
  | 'question'       // answering a question for a command
  | 'result'         // feedback after answering
  | 'enemy-turn'     // enemy action resolved, waiting for ack
  | 'command-choice' // pick a new command card
  | 'defeated';      // combat over (check enemyHp to determine win/loss)

export interface CombatState {
  enemy: Enemy;
  enemyHp: number;
  enemyBlock: number;
  enemyStrength: number;
  enemySequenceIndex: number;
  playerBlock: number;
  playerStrength: number;
  energy: number;
  usedCommandIds: string[];
  currentQuestion: Question | null;
  currentQuestionType: QuestionType | null;
  pendingCommand: Command | null;
  phase: CombatPhase;
  lastAnswerCorrect: boolean | null;
  commandChoices: Command[] | null;
  lastDieRoll: number | null;
  bossCurse: BossCurse | null;
  bossTypeChanges: Record<string, QuestionType>;
  log: string[];
}

export type GamePhase =
  | 'title'
  | 'map'
  | 'combat'
  | 'shop'
  | 'rest'
  | 'chest'
  | 'event'
  | 'questions'
  | 'victory'
  | 'defeat';

export interface QuestionProgress {
  discovered: boolean;
  strength: number;
  correct: number;
  incorrect: number;
}

export interface ShopState {
  tileId: string;
  itemIds: string[];
  purchased: string[];
}

export const MAX_INVENTORY = 3;
export const MAX_COMMANDS = 6;
export const MAX_ENERGY = 3;

export interface GameState {
  phase: GamePhase;
  currentFloor: number;
  playerNodeId: string;
  floorBoard: FloorBoard | null;
  shopPurchases: Record<string, string[]>;
  player: PlayerState;
  combat: CombatState | null;
  shopState: ShopState | null;
  currentRest: RestCard | null;
  currentChestItemId: string | null;
  currentEvent: EventState | null;
  questionProgress: Record<string, QuestionProgress>;
}
