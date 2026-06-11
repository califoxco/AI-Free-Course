import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findLesson, flatLessons, lessonKey } from '../data';
import { quizPassed, toggleResource, useProgress } from '../lib/progress';
import type { FlatLesson } from '../data';
import QuizView from './QuizView';
import CodeView from './CodeView';
import { DifficultyBadge, TypeBadge } from './ui';
import { hasAffiliates, outboundUrl } from '../config';

export default function LessonPage() {
  const { moduleId = '', lessonId = '' } = useParams();
  const fl = findLesson(moduleId, lessonId);

  if (!fl) {
    return (
      <div className="not-found">
        <p>Lesson not found.</p>
        <Link to="/">← Back to the roadmap</Link>
      </div>
    );
  }
  // key forces tab/quiz state to reset when navigating between lessons
  return <LessonInner key={`${moduleId}/${lessonId}`} fl={fl} />;
}

type Tab = 'learn' | 'quiz' | 'code';

function LessonInner({ fl }: { fl: FlatLesson }) {
  const { module, lesson } = fl;
  const [tab, setTab] = useState<Tab>('learn');
  const progress = useProgress();
  const key = lessonKey(module.id, lesson.id);

  const idx = flatLessons.findIndex(
    (f) => f.module.id === module.id && f.lesson.id === lesson.id,
  );
  const prev = idx > 0 ? flatLessons[idx - 1] : null;
  const next = idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null;

  const checkedResources = progress.resources[key] ?? [];
  const quizDone = quizPassed(progress, key);
  const codeDone = progress.code[key] === 'solved';

  return (
    <div className="lesson-page">
      <nav className="breadcrumb">
        <Link to="/">Roadmap</Link> <span>/</span>{' '}
        <Link to={`/module/${module.id}`}>{module.title}</Link> <span>/</span> {lesson.title}
      </nav>

      <h1>{lesson.title}</h1>
      <p className="lesson-summary">{lesson.summary}</p>

      {lesson.objectives && (
        <div className="objectives">
          <h3>You should walk away able to:</h3>
          <ul>
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'learn' ? 'tab-active' : ''}`} onClick={() => setTab('learn')}>
          📚 Learn{' '}
          <span className="tab-count">
            {checkedResources.length}/{lesson.resources.length}
          </span>
        </button>
        <button className={`tab ${tab === 'quiz' ? 'tab-active' : ''}`} onClick={() => setTab('quiz')}>
          ❓ Quiz {quizDone && <span className="tab-check">✓</span>}
        </button>
        {lesson.challenge && (
          <button className={`tab ${tab === 'code' ? 'tab-active' : ''}`} onClick={() => setTab('code')}>
            ⌨ Practice {codeDone && <span className="tab-check">✓</span>}
          </button>
        )}
      </div>

      {tab === 'learn' && (
        <div className="resource-list">
          {lesson.resources.map((r) => {
            const checked = checkedResources.includes(r.url);
            return (
              <div key={r.url} className={`resource-card ${checked ? 'resource-done' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleResource(key, r.url)}
                  title="Mark as completed"
                />
                <div className="resource-body">
                  <div className="resource-head">
                    <TypeBadge type={r.type} />
                    <a href={outboundUrl(r.url)} target="_blank" rel="noreferrer" className="resource-title">
                      {r.title} ↗
                    </a>
                  </div>
                  <div className="resource-sub">
                    {r.author && <span>{r.author}</span>}
                    {r.duration && <span> · {r.duration}</span>}
                  </div>
                  {r.description && <p className="resource-desc">{r.description}</p>}
                </div>
              </div>
            );
          })}
          {hasAffiliates() && (
            <p className="affiliate-disclosure">
              Some links are affiliate links that fund the course at no cost to you — every resource
              is chosen on merit first.
            </p>
          )}
          <div className="learn-next">
            Done with the material? Test yourself:{' '}
            <button className="btn btn-primary" onClick={() => setTab('quiz')}>
              Take the quiz →
            </button>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizView questions={lesson.quiz} storageKey={key} />}

      {tab === 'code' && lesson.challenge && (
        <div>
          <div className="challenge-head">
            <h2>{lesson.challenge.title}</h2>
            <DifficultyBadge difficulty={lesson.challenge.difficulty} />
          </div>
          <CodeView challenge={lesson.challenge} storageKey={key} />
        </div>
      )}

      <nav className="lesson-nav">
        {prev ? (
          <Link to={`/learn/${prev.module.id}/${prev.lesson.id}`} className="lesson-nav-link">
            ← {prev.lesson.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/${next.module.id}/${next.lesson.id}`} className="lesson-nav-link lesson-nav-next">
            {next.lesson.title} →
          </Link>
        ) : (
          <Link to="/" className="lesson-nav-link lesson-nav-next">
            🎉 Course complete — back to the roadmap
          </Link>
        )}
      </nav>
    </div>
  );
}
