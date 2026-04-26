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
