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
import { generateFloor, generateRandomEnemy } from '../data/floorGenerator';
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
  generateBossCurse,
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

  // Event rooms
  acceptEvent:          () => void;
  refuseEvent:          () => void;
  rerollCursedMirror:   () => void;
  acceptCursedRemoval:  () => void;
  pickCommandForUpgrade:(commandId: string) => void;

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
  currentEvent: null,
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
    bossCurse: null,
    bossTypeChanges: {},
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

    if (node.type === 'event' && !node.cleared) {
      const kind = node.eventKind!;
      const { player } = get();

      if (kind === 'cursed-mirror') {
        const targetCmd = player.commands[Math.floor(Math.random() * player.commands.length)];
        set({ phase: 'event', currentEvent: { kind, targetCommandId: targetCmd?.id } });
        return;
      }

      set({ phase: 'event', currentEvent: { kind } });
      return;
    }
  },

  // ── Combat: player selects a command ────────────────────────

  selectCommand: (commandId: string) => {
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'player-turn') return;

    const cmd = player.commands.find(c => c.id === commandId);
    if (!cmd) return;

    const cmdIndex = player.commands.findIndex(c => c.id === commandId);
    const effectiveCost = getEffectiveCost(cmd, cmdIndex, combat.bossCurse);
    if (combat.energy < effectiveCost) return;
    if (cmd.oncePerTurn && combat.usedCommandIds.includes(commandId)) return;

    // Effective question type: type_override > bahamut mutation > base
    const effectiveQType = getEffectiveQType(cmd, combat.bossCurse, combat.bossTypeChanges);

    // Ultimecia: disabled types block the command
    if (combat.bossCurse?.kind === 'disabled_type' && combat.bossCurse.qType === effectiveQType) return;

    // Lone Wolf: can't play if another command shares the same effective question type
    if (cmd.uniqueType) {
      const sharedType = player.commands.some(c => {
        if (c.id === cmd.id) return false;
        return getEffectiveQType(c, combat.bossCurse, combat.bossTypeChanges) === effectiveQType;
      });
      if (sharedType) return;
    }

    // Swap active effect lets the player change the question type
    if (hasEffect(player.activeEffects, 'swap')) {
      set({
        combat: {
          ...combat,
          pendingCommand: cmd,
          currentQuestionType: effectiveQType,
          phase: 'question', // player will be prompted to use/skip swap in UI
        },
      });
      return;
    }

    const question = drawQuestion(questionProgress, effectiveQType);
    const newProgress = markDiscovered(questionProgress, question.id);
    set({
      combat: {
        ...combat,
        pendingCommand: cmd,
        currentQuestion: question,
        currentQuestionType: effectiveQType,
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

    const cmdIndex = player.commands.findIndex(c => c.id === cmd.id);
    const newEnergy = combat.energy - getEffectiveCost(cmd, cmdIndex, combat.bossCurse);
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
    const { combat, player, questionProgress } = get();
    if (!combat || combat.phase !== 'question' || !combat.currentQuestion || !combat.pendingCommand) return;

    const correct = checkAnswer(combat.currentQuestion, answer);
    const cmd = combat.pendingCommand;
    sfx(correct ? 'correct' : 'wrong');

    const newProgress = recordAnswer(questionProgress, combat.currentQuestion.id, correct);
    const cmdIndex = player.commands.findIndex(c => c.id === cmd.id);
    const effectiveCost = getEffectiveCost(cmd, cmdIndex, combat.bossCurse);
    const newEnergy = combat.energy - effectiveCost;
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
    let { newEnemyHp, newEnemyBlock, newEnemyStrength, newPlayerBlock, newPlayerStrength, effectLog } =
      applyCommandEffects(cmd, combat);

    const extraLogs: string[] = [];

    // Gabranth: +2 enemy strength when player uses the condemned type
    if (combat.bossCurse?.kind === 'strength_leech' && combat.currentQuestionType === combat.bossCurse.qType) {
      newEnemyStrength += 2;
      extraLogs.push('⚔ GABRANTH gains +2 Strength!');
    }

    // Bahamut: permanently mutate the command's question type after each use
    let newBossTypeChanges = combat.bossTypeChanges;
    if (combat.enemy.bossAbility?.kind === 'bahamut') {
      const Q_TYPES: QuestionType[] = ['t1', 't2', 't3', 't4'];
      const currentEffective = combat.currentQuestionType ?? cmd.questionType;
      const others = Q_TYPES.filter(t => t !== currentEffective);
      const mutated = others[Math.floor(Math.random() * others.length)];
      newBossTypeChanges = { ...combat.bossTypeChanges, [cmd.id]: mutated };
      extraLogs.push(`🔥 BAHAMUT transforms ${cmd.name} — next use requires Part ${mutated[1]}!`);
    }

    const logEntry = `✔ ${cmd.name}! ${effectLog}${extraLogs.length ? ' ' + extraLogs.join(' ') : ''}`;

    if (newEnemyHp <= 0) {
      set({
        combat: {
          ...combat,
          enemyHp: 0, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
          playerBlock: newPlayerBlock, playerStrength: newPlayerStrength,
          energy: newEnergy, usedCommandIds: newUsed,
          bossTypeChanges: newBossTypeChanges,
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
        bossTypeChanges: newBossTypeChanges,
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
    let newInventory = player.inventory;
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

    // Fairy passive: survive a lethal blow at 1 HP
    if (newPlayerHp <= 0 && newInventory.some(i => i.type === 'FAIRY')) {
      const fairyIdx = newInventory.findIndex(i => i.type === 'FAIRY');
      newInventory = newInventory.filter((_, i) => i !== fairyIdx);
      newPlayerHp = 1;
      parts.push('🧚 A fairy saved you at 1 HP!');
    }

    const logEntry = `👹 ${enemy_name(combat)}: ${action.label} — ${parts.join(', ')}`;

    // Generate boss curse for next player turn
    let newBossCurse = combat.bossCurse;
    const curseEntries: string[] = [];
    if (combat.enemy.bossAbility && combat.enemy.bossAbility.kind !== 'bahamut') {
      const { curse, log: curseLog } = generateBossCurse(combat.enemy.bossAbility);
      newBossCurse = curse;
      if (curseLog) curseEntries.push(curseLog);
    }

    if (newPlayerHp <= 0) {
      sfx('defeat');
      set({
        combat: {
          ...combat,
          enemyHp: newEnemyHp, enemyBlock: newEnemyBlock, enemyStrength: newEnemyStrength,
          playerBlock: newPlayerBlock,
          enemySequenceIndex: combat.enemySequenceIndex + 1,
          lastDieRoll: dieRoll,
          bossCurse: newBossCurse,
          phase: 'defeated', lastAnswerCorrect: null,
          log: [...combat.log, logEntry, ...curseEntries, '💀 You have fallen...'],
        },
        player: { ...player, hp: newPlayerHp, activeEffects: newEffects, inventory: newInventory },
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
        bossCurse: newBossCurse,
        phase: 'enemy-turn',
        log: [...combat.log, logEntry, ...curseEntries],
      },
      player: { ...player, hp: newPlayerHp, activeEffects: newEffects, inventory: newInventory },
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

  // ── Event rooms ───────────────────────────────────────────────

  // Accept the current event offer (events 1, 4, 5, 6)
  acceptEvent: () => {
    const { currentEvent, player, floorBoard, playerNodeId, currentFloor } = get();
    if (!currentEvent) return;
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;

    switch (currentEvent.kind) {

      case 'potion-trade': {
        // Sell all potions for 10g each
        const POTION_TYPES = new Set(['POTION', 'HIGH_POTION', 'FIRE_POTION', 'BLOCK_POTION', 'STRENGTH_POTION']);
        const potions = player.inventory.filter(i => POTION_TYPES.has(i.type));
        const kept    = player.inventory.filter(i => !POTION_TYPES.has(i.type));
        const earned  = potions.length * 10;
        sfx('buy');
        set({ phase: 'map', currentEvent: null, floorBoard: newBoard,
          player: { ...player, inventory: kept, gold: player.gold + earned } });
        break;
      }

      case 'ancient-altar': {
        // +15 XP, -5 HP
        const newHp = clamp(player.hp - 5, 1, player.maxHp);
        sfx('correct');
        set({ phase: 'map', currentEvent: null, floorBoard: newBoard,
          player: { ...player, hp: newHp, xp: player.xp + 15 } });
        break;
      }

      case 'dark-ritual': {
        // Heal to full, -20% max HP (permanent)
        const newMaxHp = Math.max(10, Math.floor(player.maxHp * 0.8));
        sfx('heal');
        set({ phase: 'map', currentEvent: null, floorBoard: newBoard,
          player: { ...player, hp: newMaxHp, maxHp: newMaxHp } });
        break;
      }

      case 'enemy-encounter': {
        // Start combat with a random floor-appropriate enemy
        const enemy = generateRandomEnemy(currentFloor);
        set({ phase: 'combat', currentEvent: null, floorBoard: newBoard,
          combat: makeCombatStart(enemy) });
        break;
      }

      default:
        break;
    }
  },

  // Refuse the current event offer (events 1, 2, 4)
  refuseEvent: () => {
    const { floorBoard, playerNodeId } = get();
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    set({ phase: 'map', currentEvent: null, floorBoard: newBoard });
  },

  // Event 3 — pay 5 HP to pick a new random command to remove
  rerollCursedMirror: () => {
    const { currentEvent, player } = get();
    if (!currentEvent || currentEvent.kind !== 'cursed-mirror') return;
    if (player.hp <= 5) return;
    const remaining = player.commands.filter(c => c.id !== currentEvent.targetCommandId);
    const pool = remaining.length > 0 ? remaining : player.commands;
    const newTarget = pool[Math.floor(Math.random() * pool.length)];
    set({
      player: { ...player, hp: player.hp - 5 },
      currentEvent: { ...currentEvent, targetCommandId: newTarget?.id },
    });
  },

  // Event 3 — accept removal of the targeted command
  acceptCursedRemoval: () => {
    const { currentEvent, player, floorBoard, playerNodeId } = get();
    if (!currentEvent || currentEvent.kind !== 'cursed-mirror') return;
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    const newCommands = player.commands.filter(c => c.id !== currentEvent.targetCommandId);
    set({ phase: 'map', currentEvent: null, floorBoard: newBoard,
      player: { ...player, commands: newCommands } });
  },

  // Event 2 — after accepting offer, player picks which command to upgrade for free
  pickCommandForUpgrade: (commandId: string) => {
    const { currentEvent, player, floorBoard, playerNodeId } = get();
    if (!currentEvent || currentEvent.kind !== 'command-upgrade') return;
    const newBoard = floorBoard ? markNodeCleared(floorBoard, playerNodeId) : floorBoard;
    const newCommands = player.commands.map(c =>
      c.id === commandId && !c.upgraded
        ? { ...c, upgraded: true, effects: c.upgradedEffects, description: c.upgradedDescription }
        : c
    );
    sfx('buy');
    set({ phase: 'map', currentEvent: null, floorBoard: newBoard,
      player: { ...player, gold: 0, commands: newCommands } });
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
      case 'FAIRY':
        return; // passive — triggers automatically on death, cannot be used manually

      case 'FIRE_POTION': {
        if (!combat) return; // combat only
        sfx('correct');
        const newEnemyHp = Math.max(0, combat.enemyHp - 10);
        const logMsg = '🔥 Fire Potion: 10 direct damage!';
        if (newEnemyHp <= 0) {
          const victoryGold = player.gold + combat.enemy.gold;
          const victoryXp   = player.xp   + combat.enemy.xp;
          set(state => ({
            player: { ...state.player, gold: victoryGold, xp: victoryXp, inventory: removeItem(state.player.inventory) },
            combat: {
              ...combat, enemyHp: 0, phase: 'result' as CombatPhase, lastAnswerCorrect: true,
              log: [...combat.log, logMsg, `🏆 ${combat.enemy.name} defeated!`],
            },
          }));
          return;
        }
        set(state => ({
          player: { ...state.player, inventory: removeItem(state.player.inventory) },
          combat: { ...combat, enemyHp: newEnemyHp, log: [...combat.log, logMsg] },
        }));
        break;
      }

      case 'POTION': {
        sfx('heal');
        const healAmt = Math.max(1, Math.floor(player.maxHp * 0.1));
        set(state => ({
          player: {
            ...state.player,
            hp: clamp(state.player.hp + healAmt, 0, state.player.maxHp),
            inventory: removeItem(state.player.inventory),
          },
        }));
        break;
      }

      case 'HIGH_POTION': {
        sfx('heal');
        const healAmt = Math.max(1, Math.floor(player.maxHp * 0.2));
        set(state => ({
          player: {
            ...state.player,
            hp: clamp(state.player.hp + healAmt, 0, state.player.maxHp),
            inventory: removeItem(state.player.inventory),
          },
        }));
        break;
      }

      case 'BLOCK_POTION': {
        if (!combat) return; // combat only
        sfx('heal');
        set(state => ({
          player: { ...state.player, inventory: removeItem(state.player.inventory) },
          combat: { ...combat, playerBlock: combat.playerBlock + 12, log: [...combat.log, '🛡 Block Potion: +12 block'] },
        }));
        break;
      }

      case 'STRENGTH_POTION': {
        if (!combat) return; // combat only
        sfx('heal');
        set(state => ({
          player: { ...state.player, inventory: removeItem(state.player.inventory) },
          combat: { ...combat, playerStrength: combat.playerStrength + 4, log: [...combat.log, '💪 Strength Potion: +4 Strength'] },
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

}), { name: 'dungeon-of-grammar-save-v8' }));

// ── Internal helpers ─────────────────────────────────────────────

function enemy_name(combat: CombatState): string {
  return combat.enemy.name;
}

function getEffectiveQType(
  cmd: Command,
  bossCurse: CombatState['bossCurse'],
  bossTypeChanges: Record<string, QuestionType>,
): QuestionType {
  if (bossCurse?.kind === 'type_override') return bossCurse.qType;
  return (bossTypeChanges[cmd.id] as QuestionType | undefined) ?? cmd.questionType;
}

function getEffectiveCost(
  cmd: Command,
  cmdIndex: number,
  bossCurse: CombatState['bossCurse'],
): number {
  if (bossCurse?.kind === 'energy_surge' && bossCurse.positions.includes(cmdIndex)) {
    return cmd.energyCost + 1;
  }
  return cmd.energyCost;
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
      const totalDmg = eff.damage + newPlayerStrength;
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
