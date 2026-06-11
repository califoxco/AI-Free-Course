import { useMemo, useState } from 'react';
import type { QuizQuestion } from '../types';
import { QUIZ_PASS_RATIO, recordQuiz, useProgress } from '../lib/progress';
import { Inline } from './ui';

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

/** Deterministic option order per question, so answer positions vary but stay stable. */
function permutation(n: number, seed: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizView({
  questions,
  storageKey,
}: {
  questions: QuizQuestion[];
  storageKey: string;
}) {
  const progress = useProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const perms = useMemo(
    () => questions.map((q, i) => permutation(q.options.length, hashCode(`${storageKey}:${i}`))),
    [questions, storageKey],
  );

  const best = progress.quiz[storageKey];
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const allAnswered = answers.every((a) => a !== null);
  const passed = score / questions.length >= QUIZ_PASS_RATIO;

  const select = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  };

  const submit = () => {
    setSubmitted(true);
    recordQuiz(storageKey, score, questions.length);
  };

  const retry = () => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <div className="quiz">
      {best && (
        <div className="quiz-best">
          Best score: {best.best}/{best.total}
          {best.best / best.total >= QUIZ_PASS_RATIO ? ' — passed ✓' : ` — need ${Math.ceil(questions.length * QUIZ_PASS_RATIO)} to pass`}
        </div>
      )}

      {questions.map((q, qi) => (
        <div key={qi} className="quiz-question">
          <h3>
            <span className="quiz-qnum">{qi + 1}</span> <Inline text={q.question} />
          </h3>
          <div className="quiz-options">
            {perms[qi].map((oi, displayIdx) => {
              const opt = q.options[oi];
              let cls = 'quiz-option';
              if (!submitted && answers[qi] === oi) cls += ' selected';
              if (submitted && oi === q.correct) cls += ' correct';
              if (submitted && answers[qi] === oi && oi !== q.correct) cls += ' wrong';
              return (
                <button key={oi} className={cls} onClick={() => select(qi, oi)} disabled={submitted}>
                  <span className="quiz-letter">{String.fromCharCode(65 + displayIdx)}</span>
                  <Inline text={opt} />
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className={`quiz-explanation ${answers[qi] === q.correct ? 'exp-correct' : 'exp-wrong'}`}>
              <strong>{answers[qi] === q.correct ? '✓ Correct.' : '✗ Not quite.'}</strong>{' '}
              <Inline text={q.explanation} />
            </div>
          )}
        </div>
      ))}

      <div className="quiz-actions">
        {!submitted ? (
          <button className="btn btn-primary" onClick={submit} disabled={!allAnswered}>
            {allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions to submit`}
          </button>
        ) : (
          <div className="quiz-result">
            <span className={passed ? 'quiz-pass' : 'quiz-fail'}>
              {score}/{questions.length} {passed ? '— passed! ✓' : '— keep going, review the material and retry.'}
            </span>
            <button className="btn btn-ghost" onClick={retry}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
