import type { RestCard } from '../types';

export const RESTS: RestCard[] = [
  {
    ico: '💤',
    title: 'Sanctuary Alcove',
    text: 'A hidden chamber, safe and silent. Restore 3 HP.',
    hpHeal: 3,
  },
  {
    ico: '🔥',
    title: 'Campfire',
    text: 'A warm fire, a moment of peace. Restore 2 HP.',
    hpHeal: 2,
  },
  {
    ico: '⛲',
    title: 'Holy Spring',
    text: 'Sacred water fills the air. Restore 4 HP.',
    hpHeal: 4,
  },
  {
    ico: '📚',
    title: 'Ancient Library',
    text: 'Scrolls line the walls. Restore 1 HP and gain 3 bonus XP.',
    hpHeal: 1,
    bonusXp: 3,
  },
];

export function getRandomRest(): RestCard {
  return RESTS[Math.floor(Math.random() * RESTS.length)];
}
