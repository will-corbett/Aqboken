import { sameAnswer } from '../shared/script.ts';
import type { Question } from './questions.ts';

export interface CheckResult {
  correct: boolean;
  /** If wrong: which other form of the word the answer is. */
  otherForm?: string;
}

export function checkAnswer(q: Question, input: string): CheckResult {
  if (q.choices) return { correct: input === q.answer || !!q.accept?.includes(input) };
  if (q.answerLang === 'digits') return { correct: input.replace(/\s/g, '') === q.answer };
  if (q.answerLang === 'en') return { correct: input.trim().toLowerCase() === q.answer.toLowerCase() };
  if ([q.answer, ...(q.accept ?? [])].some((a) => sameAnswer(input, a))) return { correct: true };
  const hit = q.others?.filter((o) => o.form !== q.answer && sameAnswer(input, o.form));
  return hit?.length ? { correct: false, otherForm: hit.map((h) => h.label).join(' / ') } : { correct: false };
}
