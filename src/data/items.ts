import type { Item } from '../types';

export const ITEMS: Item[] = [
  { id: 'i1', ico: '🔥', name: 'Fire Potion',       type: 'FIRE_POTION',     cost: 4,  effect: 'Deal 10 direct damage to the enemy. (Combat only)' },
  { id: 'i2', ico: '🧚', name: 'Fairy in a Bottle', type: 'FAIRY',           cost: 6,  effect: 'Survive one lethal blow with 1 HP remaining. (Passive — triggers automatically when you would die)' },
  { id: 'i3', ico: '🧪', name: 'Potion',             type: 'POTION',          cost: 3,  effect: 'Restore 10% of your max HP.' },
  { id: 'i4', ico: '💊', name: 'Hi-Potion',          type: 'HIGH_POTION',     cost: 5,  effect: 'Restore 20% of your max HP.' },
  { id: 'i5', ico: '🛡', name: 'Block Potion',       type: 'BLOCK_POTION',    cost: 4,  effect: 'Gain 12 block this combat. (Combat only)' },
  { id: 'i6', ico: '💪', name: 'Strength Potion',    type: 'STRENGTH_POTION', cost: 5,  effect: 'Gain 4 Strength this combat. (Combat only)' },
];

export function getItemById(id: string): Item | undefined {
  return ITEMS.find(i => i.id === id);
}
