import type { Question, QuestionType } from '../../types';
import { PART1 } from './part1';
import { PART2 } from './part2';
import { PART3_ALL as PART3 } from './part3';
import { PART4 } from './part4';

export function getQuestionsForType(type: QuestionType): Question[] {
  if (type === 't1') return PART1 as Question[];
  if (type === 't2') return PART2 as Question[];
  if (type === 't3') return PART3 as Question[];
  return PART4 as Question[];
}

export function getAllQuestions(): Question[] {
  return [...PART1, ...PART2, ...PART3, ...PART4] as Question[];
}
