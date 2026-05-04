import type { CombatState, Enemy, EnemyAction, ActiveEffect, BossAbility, BossCurse, QuestionType } from '../types';

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getXpRank(xp: number): string {
  if (xp <= 30) return 'Apprentice Scribe';
  if (xp <= 60) return 'Journeyman Grammarian';
  if (xp <= 80) return 'Knight of Syntax';
  return '✦ Legendary Word-Slayer';
}

/** Resolve the next action the enemy will take (does not advance sequence index). */
export function resolveEnemyAction(combat: CombatState): { action: EnemyAction; dieRoll: number | null } {
  const { enemy, enemySequenceIndex } = combat;
  const { pattern, actions } = enemy;

  const getAction = (id: string) => actions.find(a => a.id === id) ?? actions[0];

  switch (pattern.kind) {
    case 'fixed':
      return { action: getAction(pattern.actionId), dieRoll: null };
    case 'sequence': {
      const idx = enemySequenceIndex % pattern.actionIds.length;
      return { action: getAction(pattern.actionIds[idx]), dieRoll: null };
    }
    case 'dice': {
      const roll = rollDie();
      const actionId = pattern.faceMap[roll] ?? actions[0].id;
      return { action: getAction(actionId), dieRoll: roll };
    }
  }
}

/** Apply an enemy attack to the player. Returns { newPlayerHp, newPlayerBlock, log }. */
export function applyEnemyAttack(
  damage: number,
  playerBlock: number,
  playerHp: number,
  playerMaxHp: number,
  shieldCharges: number,
): { newPlayerHp: number; newPlayerBlock: number; newShieldCharges: number; absorbed: boolean; blocked: number; dealt: number } {
  if (shieldCharges > 0) {
    return { newPlayerHp: playerHp, newPlayerBlock: playerBlock, newShieldCharges: shieldCharges - 1, absorbed: true, blocked: 0, dealt: 0 };
  }
  const blocked = Math.min(damage, playerBlock);
  const dealt   = damage - blocked;
  const newPlayerBlock = playerBlock - blocked;
  const newPlayerHp    = clamp(playerHp - dealt, 0, playerMaxHp);
  return { newPlayerHp, newPlayerBlock, newShieldCharges: 0, absorbed: false, blocked, dealt };
}

export function getShieldCharges(effects: ActiveEffect[]): number {
  const s = effects.find(e => e.kind === 'shield');
  return s ? (s as { kind: 'shield'; charges: number }).charges : 0;
}

export function consumeShield(effects: ActiveEffect[]): ActiveEffect[] {
  const idx = effects.findIndex(e => e.kind === 'shield');
  if (idx === -1) return effects;
  const s = effects[idx] as { kind: 'shield'; charges: number };
  return s.charges <= 1
    ? effects.filter((_, i) => i !== idx)
    : effects.map((e, i) => i === idx ? { kind: 'shield' as const, charges: s.charges - 1 } : e);
}

export function consumeSkip(effects: ActiveEffect[]): ActiveEffect[] {
  const idx = effects.findIndex(e => e.kind === 'skip');
  if (idx === -1) return effects;
  const s = effects[idx] as { kind: 'skip'; charges: number };
  return s.charges <= 1
    ? effects.filter((_, i) => i !== idx)
    : effects.map((e, i) => i === idx ? { kind: 'skip' as const, charges: s.charges - 1 } : e);
}

export function consumeSwap(effects: ActiveEffect[]): ActiveEffect[] {
  const idx = effects.findIndex(e => e.kind === 'swap');
  if (idx === -1) return effects;
  const s = effects[idx] as { kind: 'swap'; charges: number };
  return s.charges <= 1
    ? effects.filter((_, i) => i !== idx)
    : effects.map((e, i) => i === idx ? { kind: 'swap' as const, charges: s.charges - 1 } : e);
}

export function hasEffect(effects: ActiveEffect[], kind: 'shield' | 'skip' | 'swap'): boolean {
  return effects.some(e => e.kind === kind);
}

export function getEffectCharges(effects: ActiveEffect[], kind: 'shield' | 'skip' | 'swap'): number {
  const e = effects.find(ef => ef.kind === kind);
  return e ? (e as { kind: typeof kind; charges: number }).charges : 0;
}

const Q_TYPES: QuestionType[] = ['t1', 't2', 't3', 't4'];
const Q_NAMES: Record<QuestionType, string> = { t1: 'Part 1', t2: 'Part 2', t3: 'Part 3', t4: 'Part 4' };
const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function randQType(): QuestionType {
  return Q_TYPES[Math.floor(Math.random() * 4)];
}

/** Generate a boss curse for the next player turn. Called at the end of each enemy turn. */
export function generateBossCurse(ability: BossAbility): { curse: BossCurse | null; log: string } {
  switch (ability.kind) {
    case 'ultimecia': {
      const qType = randQType();
      return {
        curse: { kind: 'disabled_type', qType },
        log: `⌛ ULTIMECIA seals ${Q_NAMES[qType]} — those commands are locked this turn!`,
      };
    }
    case 'shiva': {
      const r1 = rollDie(), r2 = rollDie();
      return {
        curse: { kind: 'energy_surge', positions: [r1 - 1, r2 - 1] },
        log: `❄ SHIVA rolls ${DICE_FACES[r1]}${DICE_FACES[r2]} — commands at slots ${r1} & ${r2} cost +1 energy!`,
      };
    }
    case 'behemoth': {
      const qType = randQType();
      return {
        curse: { kind: 'type_override', qType },
        log: `💥 BEHEMOTH's tremor — all commands require ${Q_NAMES[qType]} this turn!`,
      };
    }
    case 'gabranth': {
      const qType = randQType();
      return {
        curse: { kind: 'strength_leech', qType },
        log: `⚔ GABRANTH condemns — using ${Q_NAMES[qType]} commands grants him +2 Strength!`,
      };
    }
    case 'bahamut':
      return { curse: null, log: '' };
  }
}

/** Preview the next enemy action without advancing state. */
export function peekEnemyIntent(enemy: Enemy, sequenceIndex: number): EnemyAction {
  const { pattern, actions } = enemy;
  const getAction = (id: string) => actions.find(a => a.id === id) ?? actions[0];

  switch (pattern.kind) {
    case 'fixed':
      return getAction(pattern.actionId);
    case 'sequence':
      return getAction(pattern.actionIds[sequenceIndex % pattern.actionIds.length]);
    case 'dice':
      return actions[0]; // dice enemies show "???" - handled in UI
  }
}
