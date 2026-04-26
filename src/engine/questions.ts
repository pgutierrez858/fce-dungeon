import type {
  Question,
  Part1Question,
  Part2Question,
  Part3Question,
  Part4Question,
  QuestionType,
  QuestionProgress,
} from '../types';
import { getQuestionsForType } from '../data/questions/index';

// SRS weights: lower strength = higher weight (more likely to appear)
const WEIGHTS = [1.0, 0.65, 0.38, 0.18, 0.08, 0.03] as const;

function weightedDraw(
  questions: Question[],
  progress: Record<string, QuestionProgress>,
): Question {
  const weights = questions.map(q => {
    const p = progress[q.id];
    if (!p || !p.discovered) return WEIGHTS[0];
    return WEIGHTS[Math.min(p.strength, 5)];
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < questions.length; i++) {
    r -= weights[i];
    if (r <= 0) return questions[i];
  }
  return questions[questions.length - 1];
}

export function drawQuestion(
  progress: Record<string, QuestionProgress>,
  type: QuestionType,
): Question {
  const pool = getQuestionsForType(type);
  return weightedDraw(pool, progress);
}

export function markDiscovered(
  progress: Record<string, QuestionProgress>,
  questionId: string,
): Record<string, QuestionProgress> {
  const existing = progress[questionId];
  if (existing?.discovered) return progress;
  return {
    ...progress,
    [questionId]: { discovered: true, strength: existing?.strength ?? 0, correct: existing?.correct ?? 0, incorrect: existing?.incorrect ?? 0 },
  };
}

export function recordAnswer(
  progress: Record<string, QuestionProgress>,
  questionId: string,
  correct: boolean,
): Record<string, QuestionProgress> {
  const existing = progress[questionId] ?? { discovered: true, strength: 0, correct: 0, incorrect: 0 };
  const newStrength = correct
    ? Math.min(existing.strength + 1, 5)
    : Math.max(existing.strength - 1, 0);
  return {
    ...progress,
    [questionId]: {
      discovered: true,
      strength: newStrength,
      correct: existing.correct + (correct ? 1 : 0),
      incorrect: existing.incorrect + (correct ? 0 : 1),
    },
  };
}

export function getBossQuestionType(roll: number, enemy: { diceMap?: Record<string, string> }): QuestionType {
  if (!enemy.diceMap) return 't1';
  const mapped = enemy.diceMap[String(roll)];
  if (mapped === 't1' || mapped === 't2' || mapped === 't3' || mapped === 't4') return mapped;
  return 't1';
}

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ');
}

export function checkAnswer(question: Question, userInput: string): boolean {
  const input = normalise(userInput);

  if (question.type === 't1') {
    const q = question as Part1Question;
    const letter = input.replace(/[^a-d]/g, '');
    return letter === q.answer.toLowerCase();
  }

  if (question.type === 't2') {
    const q = question as Part2Question;
    const accepted = q.answer.split('/').map(a => normalise(a));
    return accepted.some(a => input === a);
  }

  if (question.type === 't3') {
    const q = question as Part3Question;
    const accepted = q.answer.split('/').map(a => normalise(a));
    return accepted.some(a => input === a);
  }

  if (question.type === 't4') {
    const q = question as Part4Question;
    const raw = Array.isArray(q.answer) ? q.answer : q.answer.split('/');
    const accepted = raw.map(a => normalise(a));
    return accepted.some(a => input === a || input.includes(a));
  }

  return false;
}
