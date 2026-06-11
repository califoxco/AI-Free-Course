import type { ResourceType } from '../types';
import type { LessonStatus } from '../lib/progress';

/** Renders `backtick` spans in plain text as inline code. */
export function Inline({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))}
    </>
  );
}

export const RESOURCE_META: Record<ResourceType, { label: string; icon: string }> = {
  video: { label: 'Video', icon: '▶' },
  paper: { label: 'Paper', icon: '📄' },
  article: { label: 'Article', icon: '✦' },
  course: { label: 'Course', icon: '🎓' },
  docs: { label: 'Docs', icon: '📘' },
};

export function TypeBadge({ type }: { type: ResourceType }) {
  const meta = RESOURCE_META[type];
  return (
    <span className={`type-badge type-${type}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  return <span className={`difficulty difficulty-${difficulty.toLowerCase()}`}>{difficulty}</span>;
}

export function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'complete') {
    return (
      <span className="status-icon status-complete" title="Complete">
        ✓
      </span>
    );
  }
  if (status === 'in-progress') {
    return <span className="status-icon status-progress" title="In progress" />;
  }
  return <span className="status-icon status-todo" title="Not started" />;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
