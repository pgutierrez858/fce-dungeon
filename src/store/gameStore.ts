import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  PlayerState,
  CombatState,
  CombatPhase,
  QuestionType,
  FloorBoard,
  GraphNode,
  InventoryItem,
  Command,
} from '../types';
import { MAX_INVENTORY, MAX_COMMANDS, MAX_ENERGY } from '../types';
import { generateFloor } from '../data/floorGenerator';
import { getItemById } from '../data/items';
import { getRandomRest } from '../data/rests';
import { makeStartingCommands, drawCommandChoices } from '../data/commands';
import {
  drawQuestion,
  markDiscovered,
  recordAnswer,
  checkAnswer,
} from '../engine/questions';
import {
  clamp,
  resolveEnemyAction,
  applyEnemyAttack,
  consumeSkip,
  consumeSwap,
  getShieldCharges,
  consumeShield,
  hasEffect,
} from '../engine/combat';
import { sfx } from '../engine/sfx';

let instanceCounter = 0;
function makeInstanceId(): string { return `item-${++instanceCounter}`; }

function markNodeCleared(board: FloorBoard, nodeId: string): FloorBoard {
  return { ...board, nodes: board.nodes.map(n => n.id === nodeId ? { ...n, cleared: true } : n) };
}

function getNode(board: FloorBoard, nodeId: string): GraphNode | undefined {
  return board.nodes.find(n => n.id === nodeId);
}

const INITIAL_PLAYER: PlayerState = {
  hp: 60, maxHp: 60, xp: 0, gold: 0,
  inventory: [], activeEffects: [],
  commands: [],
};

interface GameStore extends GameState {
  startGame:        () => void;
  moveToNode:       (nodeId: string) => void;
  collectChest:     () => void;
  abandonChest:     () => void;
  descendFloor:     () => void;

  // Combat — player turn
  selectCommand:    (commandId: string) => void;
  submitAnswer:     (answer: string) => void;
  skipQuestion:     () => void;
  swapQuestionType: (qType: QuestionType) => void;
  acknowledgeResult:() => void;
  endTurn:          () => void;

  // Combat — post-enemy-turn ack
  acknowledgeEnemyTurn: () => void;

  // Combat — command choice after victory
  pickCommandChoice:  (index: number) => void;
  skipCommandChoice:  () => void;
  forgetCommand:      (commandId: string, pickIndex: number) => void;
  acknowledgeVictory: () => void;

  // Rest
  upgradeCommand: (commandId: string) => void;
  takeRest:       () => void;

  // Shop
  buyItem:   (itemId: string) => void;
  leaveShop: () => void;

  // Inventory
  useItem:  (instanceId: string) => void;
  dropItem: (instanceId: string) => void;

  openCodex:  () => void;
  closeCodex: () => void;
  resetGame:  () => void;
}

const INITIAL_GAME_STATE: Omit<GameState, 'questionProgress'> = {
  phase: 'title',
  currentFloor: 1,
  playerNodeId: '',
  floorBoard: null,
  shopPurchases: {},
  player: { ...INITIAL_PLAYER },
  combat: null,
  shopState: null,
  currentRest: null,
  currentChestItemId: null,
};

function makeCombatStart(enemy: Parameters<typeof resolveEnemyAction>[0]['enemy']): CombatState {
  return {
    enemy,
    enemyHp: enemy.maxHp,
    enemyBlock: 0,
    enemyStrength: 0,
    enemySequenceIndex: 0,
    playerBlock: 0,
    playerStrength: 0,
    energy: MAX_ENERGY,
    usedCommandIds: [],
    currentQuestion: null,
    currentQuestionType: null,
    pendingCommand: null,
    phase: 'player-turn',
    lastAnswerCorrect: null,
    commandChoices: null,
    lastDieRoll: null,
    log: [`⚔ ${enemy.name} appears! (HP: ${enemy.maxHp})`],
  };
}

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  ...INITIAL_GAME_STATE,
  questionProgress: {},

  // ── Game start ───────────────────────────────────────────────

  startGame: () => {
    const board = generateFloor(1);
    const startNode = board.nodes.find(n => n.type === 'start')!;
    const { questionProgress } = get();
    set({
      ...INITIAL_GAME_STATE,
      phase: 'map',
      currentFloor: 1,
      playerNodeId: startNode.id,
      floorBoard: board,
      player: { ...INITIAL_PLAYER, commands: makeStartingCommands() },
      questionProgress,
    });
  },

  // ── Navigation ───────────────────────────────────────────────

  moveToNode: (nodeId: string) => {
    const { playerNodeId, floorBoard, shopPurchases } = get();
    if (!floorBoard) return;

    const currentNode = getNode(floorBoard, playerNodeId);
    if (!currentNode?.connections.includes(nodeId)) return;

    const node = getNode(floorBoard, nodeId);
    if (!node) return;

    set({ playerNodeId: nodeId });
    sfx('move');

    if (node.type === 'start') return;

    if ((node.type === 'monster' || node.type === 'boss') && !node.cleared) {
      if (node.type === 'boss') sfx('boss');
      const enemy = node.enemy!;
      set({ phase: 'combat', combat: makeCombatStart(enemy) });
      return;
    }

    if (node.type === 'chest' && !node.cleared) {
      set({ phase: 'chest', currentChestItemId: node.itemId ?? null });
      return;
    }

    if (node.type === 'shop') {
      const prevPurchased = shopPurchases[node.id] ?? [];
      set({
        phase: 'shop',
        shopState: { tileId: node.id, itemIds: node.shopItemIds ?? [], purchased: prevPurchased },
      });
      return;
    }

    if (node.type === 'rest' && !node.cleared) {
      set({ phase: 'rest', currentRest: getRandomRest() });
      return;
    }
  },

  // ── Combat: player selects a command ────────────────────────

  selectCommand: (commandId: string) => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'player-turn') return;

    const cmd = player.commands.find(c => c.id === commandId);
    if (!cmd) return;
    if (combat.energy < cmd.energyCost) return;

    const qType = cmd.questionType;

    // Swap active effect lets the player change the question type
    if (hasEffect(player.activeEffects, 'swap')) {
      set({
        combat: {
          ...combat,
          pendingCommand: cmd,
          currentQuestionType: qType,
          phase: 'question', // player will be prompted to use/skip swap in UI
        },
      });
      return;
    }

    const question = drawQuestion(questionProgress, qType);
    const newProgress = markDiscovered(questionProgress, question.id);
    set({
      combat: {
        ...combat,
        pendingCommand: cmd,
        currentQuestion: question,
        currentQuestionType: qType,
        phase: 'question',
      },
      questionProgress: newProgress,
    });
  },

  // ── Combat: swap the question type before answering ─────────

  swapQuestionType: (qType: QuestionType) => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'question' || !combat.pendingCommand) return;
    const newEffects = consumeSwap(player.activeEffects);
    const question = drawQuestion(questionProgress, qType);
    const newProgress = markDiscovered(questionProgress, question.id);
    set({
      combat: { ...combat, currentQuestion: question, currentQuestionType: qType },
      player: { ...player, activeEffects: newEffects },
      questionProgress: newProgress,
    });
  },

  // ── Combat: skip the question (auto-succeed) ─────────────────

  skipQuestion: () => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'question' || !combat.pendingCommand) return;
    if (!hasEffect(player.activeEffects, 'skip')) return;

    const cmd = combat.pendingCommand;
    const newEffects = consumeSkip(player.activeEffects);

    // Apply command effects as if correct
    const { newEnemyHp, newEnemyBlock, newEnemyStrength, newPlayerBlock, newPlayerStrength, effectLog } =
      applyCommandEffects(cmd, combat);

    const newEnergy = combat.energy - cmd.energyCost;
    const logEntry = `📜 Skip used! ${cmd.name} auto-succeeds. ${effectLog}`;

    if (newEnemyHp <= 0) {
      set({
        combat: {
          ...combat,
          enemyHp: 0, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
          playerBlock: newPlayerBlock, playerStrength: newPlayerStrength,
          energy: newEnergy,
          usedCommandIds: [...combat.usedCommandIds, cmd.id],
          pendingCommand: null, currentQuestion: null, currentQuestionType: null,
          phase: 'result', lastAnswerCorrect: true,
          log: [...combat.log, logEntry],
        },
        player: { ...player, activeEffects: newEffects },
      });
      return;
    }

    set({
      combat: {
        ...combat,
        enemyHp: newEnemyHp, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
        playerBlock: newPlayerBlock, playerStrength: newPlayerStrength,
        energy: newEnergy,
        usedCommandIds: [...combat.usedCommandIds, cmd.id],
        pendingCommand: null, currentQuestion: null, currentQuestionType: null,
        phase: 'result', lastAnswerCorrect: true,
        log: [...combat.log, logEntry],
      },
      player: { ...player, activeEffects: newEffects },
      questionProgress,
    });
  },

  // ── Combat: submit an answer ─────────────────────────────────

  submitAnswer: (answer: string) => {
    const { combat, questionProgress } = get();
    if (!combat || combat.phase !== 'question' || !combat.currentQuestion || !combat.pendingCommand) return;

    const correct = checkAnswer(combat.currentQuestion, answer);
    const cmd = combat.pendingCommand;
    sfx(correct ? 'correct' : 'wrong');

    const newProgress = recordAnswer(questionProgress, combat.currentQuestion.id, correct);
    const newEnergy = combat.energy - cmd.energyCost;
    const newUsed = [...combat.usedCommandIds, cmd.id];

    if (!correct) {
      const logEntry = `✘ ${cmd.name} missed! (wrong answer)`;
      set({
        combat: {
          ...combat,
          energy: newEnergy,
          usedCommandIds: newUsed,
          pendingCommand: null,
          phase: 'result', lastAnswerCorrect: false,
          log: [...combat.log, logEntry],
        },
        questionProgress: newProgress,
      });
      return;
    }

    // Apply command effects
    const { newEnemyHp, newEnemyBlock, newEnemyStrength, newPlayerBlock, newPlayerStrength, effectLog } =
      applyCommandEffects(cmd, combat);

    const logEntry = `✔ ${cmd.name}! ${effectLog}`;

    if (newEnemyHp <= 0) {
      set({
        combat: {
          ...combat,
          enemyHp: 0, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
          playerBlock: newPlayerBlock, playerStrength: newPlayerStrength,
          energy: newEnergy, usedCommandIds: newUsed,
          pendingCommand: null, currentQuestion: null, currentQuestionType: null,
          phase: 'result', lastAnswerCorrect: true,
          log: [...combat.log, logEntry],
        },
        questionProgress: newProgress,
      });
      return;
    }

    set({
      combat: {
        ...combat,
        enemyHp: newEnemyHp, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
        playerBlock: newPlayerBlock, playerStrength: newPlayerStrength,
        energy: newEnergy, usedCommandIds: newUsed,
        pendingCommand: null, currentQuestion: null, currentQuestionType: null,
        phase: 'result', lastAnswerCorrect: true,
        log: [...combat.log, logEntry],
      },
      questionProgress: newProgress,
    });
  },

  // ── Combat: acknowledge result and return to player turn ──────

  acknowledgeResult: () => {
    const { combat, player } = get();
    if (!combat || combat.phase !== 'result') return;

    // Enemy died on the last command
    if (combat.enemyHp <= 0) {
      sfx('victory');
      const { floorBoard, playerNodeId, currentFloor } = get();
      const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
      const goldGain = combat.enemy.gold;
      const xpGain   = combat.enemy.xp;
      const newPlayer = { ...player, gold: player.gold + goldGain, xp: player.xp + xpGain };

      const isFinalBoss = combat.enemy.type === 'boss' && currentFloor === 5;
      if (isFinalBoss) {
        set({ phase: 'victory', floorBoard: newBoard, player: newPlayer, combat: null });
      } else {
        const choices = drawCommandChoices(3);
        set({
          phase: 'combat',
          floorBoard: newBoard,
          player: newPlayer,
          combat: { ...combat, phase: 'command-choice', commandChoices: choices },
        });
      }
      return;
    }

    // Back to player turn
    set({ combat: { ...combat, phase: 'player-turn', lastAnswerCorrect: null } });
  },

  // ── Combat: end player turn, execute enemy action ─────────────

  endTurn: () => {
    const { combat, player } = get();
    if (!combat || combat.phase !== 'player-turn') return;

    // Enemy loses block at start of their turn
    const enemyBlockCleared = { ...combat, enemyBlock: 0 };

    // Resolve enemy action
    const { action, dieRoll } = resolveEnemyAction(enemyBlockCleared);
    let newEnemyHp = combat.enemyHp;
    let newEnemyBlock = 0;
    let newEnemyStrength = combat.enemyStrength;
    let newPlayerHp = player.hp;
    let newPlayerBlock = combat.playerBlock;
    let newEffects = player.activeEffects;
    const parts: string[] = [];

    for (const eff of action.effects) {
      if (eff.kind === 'attack') {
        const totalDmg = eff.damage + combat.enemyStrength;
        const shieldCharges = getShieldCharges(newEffects);
        const result = applyEnemyAttack(totalDmg, newPlayerBlock, newPlayerHp, player.maxHp, shieldCharges);
        newPlayerHp    = result.newPlayerHp;
        newPlayerBlock = result.newPlayerBlock;
        if (result.absorbed) {
          newEffects = consumeShield(newEffects);
          parts.push(`🛡 Shield absorbed ${totalDmg} dmg`);
        } else if (result.blocked > 0) {
          parts.push(`${action.icon} ${eff.damage + (combat.enemyStrength > 0 ? `+${combat.enemyStrength}` : '')} dmg (${result.blocked} blocked → ${result.dealt} dealt)`);
        } else {
          parts.push(`${action.icon} ${totalDmg} damage dealt`);
        }
      } else if (eff.kind === 'block') {
        newEnemyBlock += eff.amount;
        parts.push(`🛡 ${enemy_name(combat)} gains ${eff.amount} block`);
      } else if (eff.kind === 'strengthen') {
        newEnemyStrength += eff.amount;
        parts.push(`💪 ${enemy_name(combat)} gains ${eff.amount} Strength`);
      }
    }

    const logEntry = `👹 ${enemy_name(combat)}: ${action.label} — ${parts.join(', ')}`;

    if (newPlayerHp <= 0) {
      sfx('defeat');
      set({
        combat: {
          ...combat,
          enemyHp: newEnemyHp, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
          playerBlock: newPlayerBlock,
          enemySequenceIndex: combat.enemySequenceIndex + 1,
          lastDieRoll: dieRoll,
          phase: 'defeated', lastAnswerCorrect: null,
          log: [...combat.log, logEntry, '💀 You have fallen...'],
        },
        player: { ...player, hp: newPlayerHp, activeEffects: newEffects },
      });
      return;
    }

    set({
      combat: {
        ...combat,
        enemyHp: newEnemyHp, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
        playerBlock: newPlayerBlock,
        enemySequenceIndex: combat.enemySequenceIndex + 1,
        lastDieRoll: dieRoll,
        phase: 'enemy-turn',
        log: [...combat.log, logEntry],
      },
      player: { ...player, hp: newPlayerHp, activeEffects: newEffects },
    });
  },

  // ── Combat: acknowledge enemy turn → new player turn ─────────

  acknowledgeEnemyTurn: () => {
    const { combat } = get();
    if (!combat || combat.phase !== 'enemy-turn') return;
    // Player loses block at start of their own turn
    set({
      combat: {
        ...combat,
        playerBlock: 0,
        energy: MAX_ENERGY,
        usedCommandIds: [],
        phase: 'player-turn',
        lastAnswerCorrect: null,
      },
    });
  },

  // ── Combat: final defeat ack ─────────────────────────────────

  acknowledgeVictory: () => {
    const { combat, floorBoard, playerNodeId } = get();
    if (!combat || combat.phase !== 'defeated') return;
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    sfx('defeat');
    set({ phase: 'defeat', combat: null, floorBoard: newBoard });
  },

  // ── Command choice ────────────────────────────────────────────

  pickCommandChoice: (index: number) => {
    const { combat, player, currentFloor } = get();
    if (!combat || combat.phase !== 'command-choice' || !combat.commandChoices) return;

    const chosen = combat.commandChoices[index];
    if (!chosen) return;

    if (player.commands.length < MAX_COMMANDS) {
      const newCommands = [...player.commands, chosen];
      const isFinalBoss = combat.enemy.type === 'boss' && currentFloor === 5;
      set({
        phase: isFinalBoss ? 'victory' : 'map',
        player: { ...player, commands: newCommands },
        combat: null,
      });
    } else {
      // Must forget a command first — signal UI with a special sub-state
      // We store the index of the chosen card and wait for forgetCommand
      set({ combat: { ...combat, commandChoices: [chosen] } }); // narrow to chosen card
    }
  },

  skipCommandChoice: () => {
    const { combat, currentFloor } = get();
    if (!combat || combat.phase !== 'command-choice') return;
    const isFinalBoss = combat.enemy.type === 'boss' && currentFloor === 5;
    set({ phase: isFinalBoss ? 'victory' : 'map', combat: null });
  },

  forgetCommand: (commandId: string, pickIndex: number) => {
    const { combat, player, currentFloor } = get();
    if (!combat || combat.phase !== 'command-choice' || !combat.commandChoices) return;

    const chosen = combat.commandChoices[pickIndex];
    if (!chosen) return;

    const newCommands = player.commands
      .filter(c => c.id !== commandId)
      .concat(chosen);

    const isFinalBoss = combat.enemy.type === 'boss' && currentFloor === 5;
    set({
      phase: isFinalBoss ? 'victory' : 'map',
      player: { ...player, commands: newCommands },
      combat: null,
    });
  },

  // ── Rest ─────────────────────────────────────────────────────

  upgradeCommand: (commandId: string) => {
    const { player } = get();
    const cmd = player.commands.find(c => c.id === commandId);
    if (!cmd || cmd.upgraded) return;
    if (player.xp < cmd.upgradeCost) return;
    const newCommands = player.commands.map(c =>
      c.id === commandId
        ? { ...c, upgraded: true, effects: c.upgradedEffects, description: c.upgradedDescription }
        : c
    );
    set({ player: { ...player, xp: player.xp - cmd.upgradeCost, commands: newCommands } });
  },

  takeRest: () => {
    const { currentRest, player, floorBoard, playerNodeId } = get();
    if (!currentRest) return;
    const newHp = clamp(player.hp + currentRest.hpHeal, 0, player.maxHp);
    const newXp = player.xp + (currentRest.bonusXp ?? 0);
    sfx('heal');
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    set({ phase: 'map', currentRest: null, floorBoard: newBoard, player: { ...player, hp: newHp, xp: newXp } });
  },

  // ── Chest / Floor ────────────────────────────────────────────

  collectChest: () => {
    const { currentChestItemId, floorBoard, playerNodeId, player } = get();
    if (!floorBoard) return;
    if (player.inventory.length >= MAX_INVENTORY) return;

    const newBoard = markNodeCleared(floorBoard, playerNodeId);

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

  abandonChest: () => {
    const { floorBoard, playerNodeId } = get();
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    set({ phase: 'map', currentChestItemId: null, floorBoard: newBoard });
  },

  descendFloor: () => {
    const { currentFloor } = get();
    const next = currentFloor + 1;
    if (next > 5) return;
    const board = generateFloor(next);
    const startNode = board.nodes.find(n => n.type === 'start')!;
    set({
      phase: 'map',
      currentFloor: next,
      playerNodeId: startNode.id,
      floorBoard: board,
      combat: null, shopState: null, currentRest: null, currentChestItemId: null,
    });
  },

  // ── Shop ─────────────────────────────────────────────────────

  buyItem: (itemId: string) => {
    const { player, shopState } = get();
    if (!shopState) return;
    if (player.inventory.length >= MAX_INVENTORY) return;
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

  // ── Items ─────────────────────────────────────────────────────

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
          if (combat) { newEnemyHp = Math.max(0, newEnemyHp - 10); logMsg = '🧪 Hi-Potion: -10 enemy HP'; }
          else        { newHp = clamp(player.hp + 10, 0, player.maxHp); }
        } else if (item.id === 'i2') {
          newHp = player.maxHp; logMsg = '💊 Elixir: full HP restored';
        } else if (item.id === 'i3') {
          newHp = clamp(player.hp + 8, 0, player.maxHp); logMsg = '🌿 Antidote: +8 HP';
        } else if (item.id === 'i10') {
          newHp = player.maxHp;
          newEnemyHp = combat ? Math.max(0, newEnemyHp - 15) : newEnemyHp;
          logMsg = '⚗ Megalixir: full HP + -15 enemy HP';
        } else if (item.id === 'i11') {
          set(state => ({
            player: {
              ...state.player,
              hp: clamp(player.hp + 12, 0, player.maxHp),
              xp: state.player.xp + 5,
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
              ...updatedCombat!, enemyHp: 0, phase: 'result' as CombatPhase,
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

  dropItem: (instanceId: string) => {
    const { player } = get();
    set({ player: { ...player, inventory: player.inventory.filter(i => i.instanceId !== instanceId) } });
  },

  openCodex:  () => set({ phase: 'questions' }),
  closeCodex: () => { const { floorBoard } = get(); set({ phase: floorBoard ? 'map' : 'title' }); },
  resetGame:  () => { const { questionProgress } = get(); set({ ...INITIAL_GAME_STATE, questionProgress }); },

}), { name: 'dungeon-of-grammar-save-v5' }));

// ── Internal helpers ─────────────────────────────────────────────

function enemy_name(combat: CombatState): string {
  return combat.enemy.name;
}

interface EffectResult {
  newEnemyHp: number;
  newEnemyBlock: number;
  newEnemyStrength: number;
  newPlayerBlock: number;
  newPlayerStrength: number;
  effectLog: string;
}

function applyCommandEffects(cmd: Command, combat: CombatState): EffectResult {
  const effects = cmd.effects;
  let newEnemyHp = combat.enemyHp;
  let newEnemyBlock = combat.enemyBlock;
  let newEnemyStrength = combat.enemyStrength;
  let newPlayerBlock = combat.playerBlock;
  let newPlayerStrength = combat.playerStrength;
  const parts: string[] = [];

  for (const eff of effects) {
    if (eff.kind === 'attack') {
      const totalDmg = eff.damage + combat.playerStrength;
      const absorbed = Math.min(totalDmg, newEnemyBlock);
      const dealt    = totalDmg - absorbed;
      newEnemyBlock  = newEnemyBlock - absorbed;
      newEnemyHp     = Math.max(0, newEnemyHp - dealt);
      if (absorbed > 0) {
        parts.push(`⚔ ${totalDmg} dmg (${absorbed} blocked → ${dealt} dealt)`);
      } else {
        parts.push(`⚔ ${totalDmg} dmg`);
      }
    } else if (eff.kind === 'block') {
      newPlayerBlock += eff.amount;
      parts.push(`🛡 +${eff.amount} block`);
    } else if (eff.kind === 'strength') {
      newPlayerStrength += eff.amount;
      parts.push(`💪 +${eff.amount} Strength`);
    }
  }

  return {
    newEnemyHp, newEnemyBlock, newEnemyStrength,
    newPlayerBlock, newPlayerStrength,
    effectLog: parts.join(', '),
  };
}
