import type { Command, CommandEffect, QuestionType } from '../types';

const Q_TYPES: QuestionType[] = ['t1', 't2', 't3', 't4'];

function randQType(): QuestionType {
  return Q_TYPES[Math.floor(Math.random() * 4)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 7);
}

export interface CommandTemplate {
  baseId: string;
  name: string;
  energyCost: number;
  effects: CommandEffect[];
  upgradedEffects: CommandEffect[];
  upgradeCost: number;
  description: string;
  upgradedDescription: string;
}

export function instantiateTemplate(tpl: CommandTemplate, qt?: QuestionType): Command {
  const qType = qt ?? randQType();
  return {
    id: `${tpl.baseId}-${qType}-${uid()}`,
    name: tpl.name,
    questionType: qType,
    energyCost: tpl.energyCost,
    effects: tpl.effects,
    upgradedEffects: tpl.upgradedEffects,
    upgradeCost: tpl.upgradeCost,
    upgraded: false,
    description: tpl.description,
    upgradedDescription: tpl.upgradedDescription,
  };
}

const STRIKE_TPL: CommandTemplate = {
  baseId: 'strike',
  name: 'Strike',
  energyCost: 1,
  effects: [{ kind: 'attack', damage: 6 }],
  upgradedEffects: [{ kind: 'attack', damage: 9 }],
  upgradeCost: 15,
  description: 'Deal 6 damage.',
  upgradedDescription: 'Deal 9 damage.',
};

const DEFEND_TPL: CommandTemplate = {
  baseId: 'defend',
  name: 'Defend',
  energyCost: 1,
  effects: [{ kind: 'block', amount: 5 }],
  upgradedEffects: [{ kind: 'block', amount: 8 }],
  upgradeCost: 15,
  description: 'Gain 5 block.',
  upgradedDescription: 'Gain 8 block.',
};

export function makeStartingCommands(): Command[] {
  const atkType = randQType();
  let defType: QuestionType;
  do { defType = randQType(); } while (defType === atkType);
  return [instantiateTemplate(STRIKE_TPL, atkType), instantiateTemplate(DEFEND_TPL, defType)];
}

export const COMMAND_POOL: CommandTemplate[] = [
  {
    baseId: 'power-strike',
    name: 'Power Strike',
    energyCost: 2,
    effects: [{ kind: 'attack', damage: 12 }],
    upgradedEffects: [{ kind: 'attack', damage: 16 }],
    upgradeCost: 25,
    description: 'Deal 12 damage.',
    upgradedDescription: 'Deal 16 damage.',
  },
  {
    baseId: 'bulwark',
    name: 'Bulwark',
    energyCost: 2,
    effects: [{ kind: 'block', amount: 10 }],
    upgradedEffects: [{ kind: 'block', amount: 14 }],
    upgradeCost: 25,
    description: 'Gain 10 block.',
    upgradedDescription: 'Gain 14 block.',
  },
  {
    baseId: 'war-cry',
    name: 'War Cry',
    energyCost: 1,
    effects: [{ kind: 'strength', amount: 3 }],
    upgradedEffects: [{ kind: 'strength', amount: 4 }],
    upgradeCost: 30,
    description: 'Gain 3 Strength this combat.',
    upgradedDescription: 'Gain 4 Strength this combat.',
  },
  {
    baseId: 'bash',
    name: 'Bash',
    energyCost: 2,
    effects: [{ kind: 'attack', damage: 8 }, { kind: 'strength', amount: 2 }],
    upgradedEffects: [{ kind: 'attack', damage: 10 }, { kind: 'strength', amount: 3 }],
    upgradeCost: 30,
    description: 'Deal 8 damage. Gain 2 Strength.',
    upgradedDescription: 'Deal 10 damage. Gain 3 Strength.',
  },
  {
    baseId: 'iron-skin',
    name: 'Iron Skin',
    energyCost: 2,
    effects: [{ kind: 'block', amount: 6 }, { kind: 'strength', amount: 2 }],
    upgradedEffects: [{ kind: 'block', amount: 8 }, { kind: 'strength', amount: 3 }],
    upgradeCost: 30,
    description: 'Gain 6 block and 2 Strength.',
    upgradedDescription: 'Gain 8 block and 3 Strength.',
  },
  {
    baseId: 'rally',
    name: 'Rally',
    energyCost: 1,
    effects: [{ kind: 'block', amount: 3 }, { kind: 'strength', amount: 1 }],
    upgradedEffects: [{ kind: 'block', amount: 4 }, { kind: 'strength', amount: 2 }],
    upgradeCost: 20,
    description: 'Gain 3 block and 1 Strength.',
    upgradedDescription: 'Gain 4 block and 2 Strength.',
  },
  {
    baseId: 'havoc',
    name: 'Havoc',
    energyCost: 3,
    effects: [{ kind: 'attack', damage: 20 }],
    upgradedEffects: [{ kind: 'attack', damage: 26 }],
    upgradeCost: 40,
    description: 'Deal 20 damage.',
    upgradedDescription: 'Deal 26 damage.',
  },
  {
    baseId: 'fortify',
    name: 'Fortify',
    energyCost: 3,
    effects: [{ kind: 'block', amount: 16 }],
    upgradedEffects: [{ kind: 'block', amount: 22 }],
    upgradeCost: 40,
    description: 'Gain 16 block.',
    upgradedDescription: 'Gain 22 block.',
  },
  {
    baseId: 'battle-stance',
    name: 'Battle Stance',
    energyCost: 1,
    effects: [{ kind: 'strength', amount: 2 }, { kind: 'block', amount: 4 }],
    upgradedEffects: [{ kind: 'strength', amount: 3 }, { kind: 'block', amount: 5 }],
    upgradeCost: 30,
    description: 'Gain 2 Strength and 4 block.',
    upgradedDescription: 'Gain 3 Strength and 5 block.',
  },
  {
    baseId: 'sword-dance',
    name: 'Sword Dance',
    energyCost: 2,
    effects: [{ kind: 'attack', damage: 7 }, { kind: 'block', amount: 7 }],
    upgradedEffects: [{ kind: 'attack', damage: 9 }, { kind: 'block', amount: 9 }],
    upgradeCost: 30,
    description: 'Deal 7 damage and gain 7 block.',
    upgradedDescription: 'Deal 9 damage and gain 9 block.',
  },
];

export function drawCommandChoices(count: number): Command[] {
  const shuffled = [...COMMAND_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(t => instantiateTemplate(t));
}
