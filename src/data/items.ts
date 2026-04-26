import type { Item } from '../types';

export const ITEMS: Item[] = [
  { id: 'i1',  ico: '🧪', name: 'Hi-Potion',         type: 'POTION', cost: 4,  effect: 'Restore 4 HP, or deal 2 direct damage to the current enemy.' },
  { id: 'i2',  ico: '💊', name: 'Elixir',             type: 'POTION', cost: 7,  effect: 'Restore all HP to maximum (20).' },
  { id: 'i3',  ico: '🌿', name: 'Antidote Flask',     type: 'POTION', cost: 3,  effect: 'Restore 2 HP. Can be used immediately after taking damage.' },
  { id: 'i4',  ico: '🛡', name: 'Iron Shield',        type: 'SHIELD', cost: 5,  effect: 'Absorb the next enemy attack completely.' },
  { id: 'i5',  ico: '🔰', name: 'Protect Rune',       type: 'SHIELD', cost: 4,  effect: 'Reduce the next incoming damage by 2 (minimum 0).' },
  { id: 'i6',  ico: '📜', name: 'Scroll of Passing',  type: 'SKIP',   cost: 3,  effect: "Skip a question without penalty. Enemy doesn't attack." },
  { id: 'i7',  ico: '📖', name: 'Tome of Passing',    type: 'SKIP',   cost: 5,  effect: 'Skip up to 2 questions in one combat without any penalty.' },
  { id: 'i8',  ico: '🔮', name: 'Prism Shard',        type: 'SWAP',   cost: 4,  effect: 'Answer a question from any other type deck this turn.' },
  { id: 'i9',  ico: '💎', name: "Scholar's Crystal",  type: 'SWAP',   cost: 6,  effect: 'For this combat, choose freely which question deck to draw from.' },
  { id: 'i10', ico: '⚗', name: 'Megalixir',           type: 'POTION', cost: 10, effect: 'Restore full HP and deal 3 direct damage to the current enemy.' },
  { id: 'i11', ico: '🌟', name: 'Holy Water',          type: 'POTION', cost: 5,  effect: 'Restore 3 HP and gain 2 bonus XP. Cannot be used mid-combat.' },
  { id: 'i12', ico: '🔱', name: 'Aegis Shield',        type: 'SHIELD', cost: 8,  effect: 'Absorb the next TWO enemy attacks completely.' },
];

export function getItemById(id: string): Item | undefined {
  return ITEMS.find(i => i.id === id);
}
