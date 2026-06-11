import { useSyncExternalStore } from 'react';
import type { Lesson } from '../types';
import { lessonKey } from '../data';

export interface QuizRecord {
  best: number;
  total: number;
}

export interface ProgressState {
  /** lessonKey -> resource URLs checked off */
  resources: Record<string, string[]>;
  /** lessonKey -> best quiz result */
  quiz: Record<string, QuizRecord>;
  /** lessonKey -> coding challenge status */
  code: Record<string, 'attempted' | 'solved'>;
}

const STORAGE_KEY = 'ailearn-progress-v1';
export const QUIZ_PASS_RATIO = 0.7;

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        resources: parsed.resources ?? {},
        quiz: parsed.quiz ?? {},
        code: parsed.code ?? {},
      };
    }
  } catch {
    // corrupted storage — start fresh
  }
  return { resources: {}, quiz: {}, code: {} };
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function emit(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full/unavailable — keep in-memory state
  }
  listeners.forEach((fn) => fn());
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
}

export function toggleResource(key: string, url: string) {
  const current = state.resources[key] ?? [];
  const next = current.includes(url) ? current.filter((u) => u !== url) : [...current, url];
  emit({ ...state, resources: { ...state.resources, [key]: next } });
}

export function recordQuiz(key: string, score: number, total: number) {
  const prev = state.quiz[key];
  if (!prev || score > prev.best) {
    emit({ ...state, quiz: { ...state.quiz, [key]: { best: score, total } } });
  }
}

export function recordCode(key: string, status: 'attempted' | 'solved') {
  if (state.code[key] === 'solved') return; // never downgrade
  emit({ ...state, code: { ...state.code, [key]: status } });
}

export function resetProgress() {
  emit({ resources: {}, quiz: {}, code: {} });
}

// ---- derived status ----

export type LessonStatus = 'not-started' | 'in-progress' | 'complete';

export function quizPassed(p: ProgressState, key: string): boolean {
  const rec = p.quiz[key];
  return !!rec && rec.total > 0 && rec.best / rec.total >= QUIZ_PASS_RATIO;
}

export function lessonStatus(p: ProgressState, moduleId: string, lesson: Lesson): LessonStatus {
  const key = lessonKey(moduleId, lesson.id);
  const quizDone = quizPassed(p, key);
  const codeDone = !lesson.challenge || p.code[key] === 'solved';
  if (quizDone && codeDone) return 'complete';
  const touched =
    (p.resources[key]?.length ?? 0) > 0 || p.quiz[key] !== undefined || p.code[key] !== undefined;
  return touched ? 'in-progress' : 'not-started';
}
