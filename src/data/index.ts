import type { Lesson, Module } from '../types';
import { m1 } from './m1-foundations';
import { m2 } from './m2-ml-fundamentals';
import { m3 } from './m3-deep-learning';
import { m4 } from './m4-transformers';
import { m5 } from './m5-llm-apis';
import { m6 } from './m6-rag';
import { m7 } from './m7-agents';
import { m8 } from './m8-finetuning';
import { m9 } from './m9-production';

export const modules: Module[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9];

export interface FlatLesson {
  module: Module;
  lesson: Lesson;
}

/** All lessons in course order, for prev/next navigation. */
export const flatLessons: FlatLesson[] = modules.flatMap((module) =>
  module.lessons.map((lesson) => ({ module, lesson })),
);

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

export function findModule(moduleId: string): Module | undefined {
  return modules.find((m) => m.id === moduleId);
}

export function findLesson(moduleId: string, lessonId: string): FlatLesson | undefined {
  return flatLessons.find((fl) => fl.module.id === moduleId && fl.lesson.id === lessonId);
}
