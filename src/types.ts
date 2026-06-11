export type ResourceType = 'video' | 'paper' | 'article' | 'course' | 'docs';

export interface Resource {
  type: ResourceType;
  title: string;
  url: string;
  author?: string;
  duration?: string; // e.g. "18 min", "2h playlist"
  description?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // index into options
  explanation: string;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingChallenge {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  /**
   * 1-3 sentences explicitly bridging the lesson material to this exercise:
   * what you just learned, which part of it you're now implementing, and
   * where it shows up in real systems. Rendered as a callout above the
   * description.
   */
  connection?: string;
  /** Plain-text paragraphs separated by \n\n. `backticks` render as inline code. */
  description: string;
  examples?: ChallengeExample[];
  starterCode: string;
  solution: string;
  /**
   * Python test code appended after the user's code. Use the injected
   * __check(name, fn) helper: define a test function with asserts, then
   * register it with __check("description", test_fn).
   */
  testCode: string;
  packages?: string[]; // pyodide packages to load, e.g. ['numpy']
  hints?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  objectives?: string[];
  resources: Resource[];
  quiz: QuizQuestion[];
  challenge?: CodingChallenge;
}

export interface Module {
  id: string;
  title: string;
  tagline: string;
  description: string;
  lessons: Lesson[];
}
