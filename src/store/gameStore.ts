import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  PlayerState,
  CombatState,
  CombatPhase,
  QuestionType,
  FloorBoard,
  InventoryItem,
  ActiveEffect,
} from '../types';
import { generateFloor } from '../data/floorGenerator';
import { getItemById } from '../data/items';
import { getRandomRest } from '../data/rests';
import {
  drawQuestion,
  markDiscovered,
  recordAnswer,
  getBossQuestionType,
  checkAnswer,
} from '../engine/questions';
import { rollDie, clamp } from '../engine/combat';
import { sfx } from '../engine/sfx';

let instanceCounter = 0;
function makeInstanceId(): string {
  return `item-${++instanceCounter}`;
}

function hasSwap(effects: ActiveEffect[]): boolean {
  return effects.some(e => e.kind === 'swap');
}

function consumeSwap(effects: ActiveEffect[]): ActiveEffect[] {
  const idx = effects.findIndex(e => e.kind === 'swap');
  if (idx === -1) return effects;
  const sw = effects[idx] as { kind: 'swap'; charges: number };
  return sw.charges <= 1
    ? effects.filter((_, i) => i !== idx)
    : effects.map((e, i) => i === idx ? { kind: 'swap' as const, charges: sw.charges - 1 } : e);
}

function markTileCleared(board: FloorBoard, row: number, col: number): FloorBoard {
  return {
    ...board,
    tiles: board.tiles.map((r, ri) =>
      ri === row
        ? r.map((t, ci) => (ci === col ? { ...t, cleared: true } : t))
        : r
    ),
  };
}

const INITIAL_PLAYER: PlayerState = {
  hp: 20,
  maxHp: 20,
  xp: 0,
  gold: 0,
  inventory: [],
  activeEffects: [],
};

interface GameStore extends GameState {
  startGame: () => void;
  moveToTile: (row: number, col: number) => void;
  collectChest: () => void;
  descendFloor: () => void;

  rollForQuestion: () => void;
  pickSwapType: (qType: QuestionType) => void;
  submitAnswer: (answer: string) => void;
  skipQuestion: () => void;
  acknowledgeResult: () => void;

  buyItem: (itemId: string) => void;
  leaveShop: () => void;

  takeRest: () => void;

  useItem: (instanceId: string) => void;

  openCodex: () => void;
  closeCodex: () => void;

  resetGame: () => void;
}

const INITIAL_GAME_STATE: Omit<GameState, 'questionProgress'> = {
  phase: 'title',
  currentFloor: 1,
  playerPos: { row: 0, col: 0 },
  floorBoard: null,
  shopPurchases: {},
  player: { ...INITIAL_PLAYER },
  combat: null,
  shopState: null,
  currentRest: null,
  currentChestItemId: null,
};

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  ...INITIAL_GAME_STATE,
  questionProgress: {},

  startGame: () => {
    const board = generateFloor(1);
    const { questionProgress } = get();
    set({
      ...INITIAL_GAME_STATE,
      phase: 'map',
      currentFloor: 1,
      playerPos: { row: 0, col: 0 },
      floorBoard: board,
      player: { ...INITIAL_PLAYER },
      questionProgress,
    });
  },

  moveToTile: (row: number, col: number) => {
    const { playerPos, floorBoard, shopPurchases, questionProgress, player } = get();
    if (!floorBoard) return;

    const dr = Math.abs(row - playerPos.row);
    const dc = Math.abs(col - playerPos.col);
    if (dr + dc !== 1) return;

    const tile = floorBoard.tiles[row][col];
    set({ playerPos: { row, col } });
    sfx('move');

    if (tile.type === 'start') return;

    if ((tile.type === 'monster' || tile.type === 'boss') && !tile.cleared) {
      if (tile.type === 'boss') sfx('boss');
      const enemy = tile.enemy!;
      const isBossMultiType = enemy.bossTypes && enemy.bossTypes.length > 1;
      const initialPhase: CombatPhase = isBossMultiType ? 'rolling' : 'question';

      const baseCombat: CombatState = {
        enemy,
        enemyHp: enemy.maxHp,
        currentQuestion: null,
        currentQuestionType: null,
        diceRoll: null,
        phase: initialPhase,
        lastAnswerCorrect: null,
        log: [`⚔ ${enemy.name} appears! (HP: ${enemy.maxHp}, ATK: ${enemy.atk})`],
      };

      if (initialPhase === 'question') {
        const qType = (enemy.bossTypes?.[0] ?? enemy.type) as QuestionType;
        if (hasSwap(player.activeEffects)) {
          set({
            phase: 'combat',
            combat: { ...baseCombat, phase: 'swapping', currentQuestionType: qType },
          });
        } else {
          const question = drawQuestion(questionProgress, qType);
          const newProgress = markDiscovered(questionProgress, question.id);
          set({
            phase: 'combat',
            combat: { ...baseCombat, currentQuestion: question, currentQuestionType: qType },
            questionProgress: newProgress,
          });
        }
      } else {
        set({ phase: 'combat', combat: baseCombat });
      }
      return;
    }

    if (tile.type === 'chest' && !tile.cleared) {
      set({ phase: 'chest', currentChestItemId: tile.itemId ?? null });
      return;
    }

    if (tile.type === 'shop') {
      const prevPurchased = shopPurchases[tile.id] ?? [];
      set({
        phase: 'shop',
        shopState: { tileId: tile.id, itemIds: tile.shopItemIds ?? [], purchased: prevPurchased },
      });
      return;
    }

    if (tile.type === 'rest' && !tile.cleared) {
      set({ phase: 'rest', currentRest: getRandomRest() });
      return;
    }
  },

  collectChest: () => {
    const { currentChestItemId, floorBoard, playerPos, player } = get();
    if (!floorBoard) return;
    const newBoard = markTileCleared(floorBoard, playerPos.row, playerPos.col);

    if (!currentChestItemId) {
      set({ phase: 'map', currentChestItemId: null, floorBoard: newBoard });
      return;
    }
    const item = getItemById(currentChestItemId);
    if (!item) {
      set({ phase: 'map', currentChestItemId: null, floorBoard: newBoard });
      return;
    }
    const instanceId = makeInstanceId();
    sfx('chest');
    set({
      phase: 'map',
      currentChestItemId: null,
      floorBoard: newBoard,
      player: { ...player, inventory: [...player.inventory, { ...item, instanceId }] },
    });
  },

  descendFloor: () => {
    const { currentFloor } = get();
    const next = currentFloor + 1;
    if (next > 5) return;
    const board = generateFloor(next);
    set({
      phase: 'map',
      currentFloor: next,
      playerPos: { row: 0, col: 0 },
      floorBoard: board,
      combat: null,
      shopState: null,
      currentRest: null,
      currentChestItemId: null,
    });
  },

  rollForQuestion: () => {
    const { combat, questionProgress, player } = get();
    if (!combat || combat.phase !== 'rolling') return;

    sfx('roll');
    const roll = rollDie();
    const qType = getBossQuestionType(roll, combat.enemy);

    const label =
      qType === 't1' ? '❄ Part 1' :
      qType === 't2' ? '🌿 Part 2' :
      qType === 't3' ? '🔮 Part 3' : '⚔ Part 4';

    if (hasSwap(player.activeEffects)) {
      set({
        combat: {
          ...combat,
          diceRoll: roll,
          currentQuestionType: qType,
          phase: 'swapping',
          log: [...combat.log, `🎲 Rolled ${roll} → ${label} (swap available!)`],
        },
      });
    } else {
      const question = drawQuestion(questionProgress, qType);
      const newProgress = markDiscovered(questionProgress, question.id);
      set({
        combat: {
          ...combat,
          diceRoll: roll,
          currentQuestion: question,
          currentQuestionType: qType,
          phase: 'question',
          log: [...combat.log, `🎲 Rolled ${roll} → ${label}`],
        },
        questionProgress: newProgress,
      });
    }
  },

  pickSwapType: (qType: QuestionType) => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'swapping') return;

    const question = drawQuestion(questionProgress, qType);
    const newProgress = markDiscovered(questionProgress, question.id);
    const newEffects = consumeSwap(player.activeEffects);

    set({
      combat: { ...combat, currentQuestion: question, currentQuestionType: qType, phase: 'question' },
      player: { ...player, activeEffects: newEffects },
      questionProgress: newProgress,
    });
  },

  skipQuestion: () => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'question') return;

    const skipIdx = player.activeEffects.findIndex(e => e.kind === 'skip');
    if (skipIdx === -1) return;

    const skipEffect = player.activeEffects[skipIdx] as { kind: 'skip'; charges: number };
    const newEffects: ActiveEffect[] = skipEffect.charges <= 1
      ? player.activeEffects.filter((_, i) => i !== skipIdx)
      : player.activeEffects.map((e, i) =>
          i === skipIdx ? { kind: 'skip' as const, charges: skipEffect.charges - 1 } : e
        );

    const updatedPlayer = { ...player, activeEffects: newEffects };
    const isBossMultiType = combat.enemy.bossTypes && combat.enemy.bossTypes.length > 1;

    if (isBossMultiType) {
      set({
        player: updatedPlayer,
        combat: {
          ...combat, phase: 'rolling', diceRoll: null,
          currentQuestion: null, currentQuestionType: null,
          log: [...combat.log, '📜 Question skipped.'],
        },
      });
    } else {
      const qType = combat.currentQuestionType!;
      const question = drawQuestion(questionProgress, qType);
      const newProgress = markDiscovered(questionProgress, question.id);
      set({
        player: updatedPlayer,
        combat: {
          ...combat, currentQuestion: question, phase: 'question',
          log: [...combat.log, '📜 Question skipped.'],
        },
        questionProgress: newProgress,
      });
    }
  },

  submitAnswer: (answer: string) => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'question' || !combat.currentQuestion) return;

    const correct = checkAnswer(combat.currentQuestion, answer);
    sfx(correct ? 'correct' : 'wrong');
    const newEnemyHp = correct ? combat.enemyHp - 1 : combat.enemyHp;

    const newProgress = recordAnswer(questionProgress, combat.currentQuestion.id, correct);

    let newPlayerHp = player.hp;
    let logEntry: string;
    let updatedEffects = player.activeEffects;

    if (!correct) {
      const shieldIdx = player.activeEffects.findIndex(e => e.kind === 'shield');
      const absorbed = shieldIdx !== -1;
      const damageDealt = absorbed ? 0 : combat.enemy.atk;
      newPlayerHp = clamp(player.hp - damageDealt, 0, player.maxHp);

      if (absorbed) {
        const shield = player.activeEffects[shieldIdx] as { kind: 'shield'; charges: number };
        updatedEffects = shield.charges <= 1
          ? player.activeEffects.filter((_, i) => i !== shieldIdx)
          : player.activeEffects.map((e, i) =>
              i === shieldIdx ? { kind: 'shield' as const, charges: shield.charges - 1 } : e
            );
        logEntry = `🛡 Shield absorbed the attack! (${shield.charges - 1 > 0 ? `${shield.charges - 1} charges left` : 'shield broken'})`;
      } else {
        logEntry = `✘ Wrong! ${combat.enemy.name} deals ${damageDealt} damage. (HP: ${newPlayerHp}/${player.maxHp})`;
      }
    } else {
      logEntry = `✔ Correct! ${combat.enemy.name} takes 1 damage. (Enemy HP: ${newEnemyHp})`;
    }

    const updatedPlayer = { ...player, hp: newPlayerHp, activeEffects: updatedEffects };

    if (newPlayerHp <= 0) {
      set({
        combat: { ...combat, enemyHp: newEnemyHp, phase: 'defeated', lastAnswerCorrect: correct,
                  log: [...combat.log, logEntry, '💀 You have fallen...'] },
        player: updatedPlayer,
        questionProgress: newProgress,
      });
      return;
    }

    if (newEnemyHp <= 0) {
      set({
        combat: { ...combat, enemyHp: 0, phase: 'defeated', lastAnswerCorrect: true,
                  log: [...combat.log, logEntry,
                        `🏆 ${combat.enemy.name} defeated! +${combat.enemy.gold} Gold, +${combat.enemy.xp} XP`] },
        player: { ...updatedPlayer, gold: player.gold + combat.enemy.gold, xp: player.xp + combat.enemy.xp },
        questionProgress: newProgress,
      });
      return;
    }

    set({
      combat: { ...combat, enemyHp: newEnemyHp, phase: 'result',
                lastAnswerCorrect: correct, log: [...combat.log, logEntry] },
      player: updatedPlayer,
      questionProgress: newProgress,
    });
  },

  acknowledgeResult: () => {
    const { combat, floorBoard, playerPos, currentFloor, questionProgress, player } = get();
    if (!combat) return;

    if (combat.phase === 'defeated') {
      const enemyDied = combat.enemyHp <= 0;
      if (enemyDied) {
        sfx('victory');
        const newBoard = floorBoard ? markTileCleared(floorBoard, playerPos.row, playerPos.col) : floorBoard;
        const isFinalBoss = combat.enemy.type === 'boss' && currentFloor === 5;
        set({ phase: isFinalBoss ? 'victory' : 'map', combat: null, floorBoard: newBoard });
      } else {
        sfx('defeat');
        set({ phase: 'defeat', combat: null });
      }
      return;
    }

    if (combat.phase === 'result') {
      const isBossMultiType = combat.enemy.bossTypes && combat.enemy.bossTypes.length > 1;
      if (isBossMultiType) {
        set({
          combat: {
            ...combat, phase: 'rolling', diceRoll: null,
            currentQuestion: null, currentQuestionType: null, lastAnswerCorrect: null,
          },
        });
      } else {
        const qType = combat.currentQuestionType!;
        if (hasSwap(player.activeEffects)) {
          set({
            combat: { ...combat, phase: 'swapping', currentQuestion: null, lastAnswerCorrect: null },
          });
        } else {
          const question = drawQuestion(questionProgress, qType);
          const newProgress = markDiscovered(questionProgress, question.id);
          set({
            combat: { ...combat, currentQuestion: question, phase: 'question', lastAnswerCorrect: null },
            questionProgress: newProgress,
          });
        }
      }
    }
  },

  buyItem: (itemId: string) => {
    const { player, shopState } = get();
    if (!shopState) return;
    const item = getItemById(itemId);
    if (!item) return;
    if (player.gold < item.cost) return;
    if (shopState.purchased.includes(itemId)) return;

    const instanceId = makeInstanceId();
    sfx('buy');
    set({
      player: {
        ...player,
        gold: player.gold - item.cost,
        inventory: [...player.inventory, { ...item, instanceId }],
      },
      shopState: { ...shopState, purchased: [...shopState.purchased, itemId] },
    });
  },

  leaveShop: () => {
    const { shopState, shopPurchases } = get();
    if (!shopState) { set({ phase: 'map' }); return; }
    set({
      phase: 'map',
      shopState: null,
      shopPurchases: { ...shopPurchases, [shopState.tileId]: shopState.purchased },
    });
  },

  takeRest: () => {
    const { currentRest, player, floorBoard, playerPos } = get();
    if (!currentRest) return;
    const newHp = clamp(player.hp + currentRest.hpHeal, 0, player.maxHp);
    const newXp = player.xp + (currentRest.bonusXp ?? 0);
    sfx('heal');
    const newBoard = floorBoard ? markTileCleared(floorBoard, playerPos.row, playerPos.col) : floorBoard;
    set({ phase: 'map', currentRest: null, floorBoard: newBoard, player: { ...player, hp: newHp, xp: newXp } });
  },

  useItem: (instanceId: string) => {
    const { player, combat } = get();
    const item = player.inventory.find(i => i.instanceId === instanceId);
    if (!item) return;

    const removeItem = (inv: InventoryItem[]) => inv.filter(i => i.instanceId !== instanceId);

    switch (item.type) {
      case 'POTION': {
        if (item.id === 'i11' && combat) return;
        sfx('heal');

        let newHp = player.hp;
        let newEnemyHp = combat?.enemyHp ?? 0;
        let logMsg = '';

        if (item.id === 'i1') {
          if (combat) { newEnemyHp = Math.max(0, newEnemyHp - 2); logMsg = '🧪 Hi-Potion: -2 enemy HP'; }
          else         { newHp = clamp(player.hp + 4, 0, player.maxHp); }
        } else if (item.id === 'i2') {
          newHp = player.maxHp; logMsg = '💊 Elixir: full HP restored';
        } else if (item.id === 'i3') {
          newHp = clamp(player.hp + 2, 0, player.maxHp); logMsg = '🌿 Antidote: +2 HP';
        } else if (item.id === 'i10') {
          newHp = player.maxHp;
          newEnemyHp = combat ? Math.max(0, newEnemyHp - 3) : newEnemyHp;
          logMsg = '⚗ Megalixir: full HP + -3 enemy HP';
        } else if (item.id === 'i11') {
          set(state => ({
            player: {
              ...state.player,
              hp: clamp(player.hp + 3, 0, player.maxHp),
              xp: state.player.xp + 2,
              inventory: removeItem(state.player.inventory),
            },
          }));
          return;
        }

        const updatedCombat = combat
          ? { ...combat, enemyHp: newEnemyHp, log: logMsg ? [...combat.log, logMsg] : combat.log }
          : combat;

        if (updatedCombat && newEnemyHp <= 0) {
          const victoryGold = player.gold + (combat?.enemy.gold ?? 0);
          const victoryXp   = player.xp   + (combat?.enemy.xp   ?? 0);
          set(state => ({
            player: {
              ...state.player, hp: newHp, gold: victoryGold, xp: victoryXp,
              inventory: removeItem(state.player.inventory),
            },
            combat: {
              ...updatedCombat!, enemyHp: 0, phase: 'defeated',
              log: [...(updatedCombat?.log ?? []), `🏆 ${combat?.enemy.name} defeated!`],
            },
          }));
          return;
        }

        set(state => ({
          player: { ...state.player, hp: newHp, inventory: removeItem(state.player.inventory) },
          combat: updatedCombat,
        }));
        break;
      }

      case 'SHIELD': {
        const charges = item.id === 'i12' ? 2 : 1;
        set(state => ({
          player: {
            ...state.player,
            inventory: removeItem(state.player.inventory),
            activeEffects: [...state.player.activeEffects, { kind: 'shield' as const, charges }],
          },
        }));
        break;
      }

      case 'SKIP': {
        const charges = item.id === 'i7' ? 2 : 1;
        set(state => ({
          player: {
            ...state.player,
            inventory: removeItem(state.player.inventory),
            activeEffects: [...state.player.activeEffects, { kind: 'skip' as const, charges }],
          },
        }));
        break;
      }

      case 'SWAP': {
        // i8 (Prism Shard) = 1 swap; i9 (Scholar's Crystal) = effectively unlimited (99)
        const charges = item.id === 'i9' ? 99 : 1;
        set(state => ({
          player: {
            ...state.player,
            inventory: removeItem(state.player.inventory),
            activeEffects: [...state.player.activeEffects, { kind: 'swap' as const, charges }],
          },
        }));
        break;
      }
    }
  },

  openCodex: () => {
    set({ phase: 'questions' });
  },

  closeCodex: () => {
    const { floorBoard } = get();
    set({ phase: floorBoard ? 'map' : 'title' });
  },

  resetGame: () => {
    const { questionProgress } = get();
    set({ ...INITIAL_GAME_STATE, questionProgress });
  },
}), { name: 'dungeon-of-grammar-save-v3' }));
