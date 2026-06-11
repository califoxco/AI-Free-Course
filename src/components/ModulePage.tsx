import { Link, useParams } from 'react-router-dom';
import { findModule, lessonKey, modules } from '../data';
import { lessonStatus, useProgress } from '../lib/progress';
import { DifficultyBadge, StatusIcon } from './ui';
import AdSlot from './AdSlot';

export default function ModulePage() {
  const { moduleId = '' } = useParams();
  const module = findModule(moduleId);
  const progress = useProgress();

  if (!module) {
    return (
      <div className="not-found">
        <p>Module not found.</p>
        <Link to="/">← Back to the roadmap</Link>
      </div>
    );
  }

  const idx = modules.findIndex((m) => m.id === module.id);

  return (
    <div className="module-page">
      <nav className="breadcrumb">
        <Link to="/">Roadmap</Link> <span>/</span> {module.title}
      </nav>
      <div className="module-banner">
        <img
          src={`https://picsum.photos/seed/ailearn-${module.id}/1600/500?grayscale`}
          alt=""
          loading="lazy"
        />
        <span className="module-banner-num">{String(idx + 1).padStart(2, '0')}</span>
      </div>
      <h1>{module.title}</h1>
      <p className="module-description">{module.description}</p>

      <div className="lesson-table">
        {module.lessons.map((lesson, idx) => {
          const key = lessonKey(module.id, lesson.id);
          const status = lessonStatus(progress, module.id, lesson);
          const quiz = progress.quiz[key];
          const videos = lesson.resources.filter((r) => r.type === 'video' || r.type === 'course').length;
          const papers = lesson.resources.filter((r) => r.type === 'paper').length;
          return (
            <Link key={lesson.id} to={`/learn/${module.id}/${lesson.id}`} className="lesson-row">
              <StatusIcon status={status} />
              <span className="lesson-idx">{idx + 1}</span>
              <div className="lesson-row-main">
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-meta">
                  {videos > 0 && <span>▶ {videos} video{videos > 1 ? 's' : ''}</span>}
                  {papers > 0 && <span>📄 {papers} paper{papers > 1 ? 's' : ''}</span>}
                  <span>
                    ❓ quiz{quiz ? ` ${quiz.best}/${quiz.total}` : ''}
                  </span>
                </span>
              </div>
              <span className="lesson-row-right">
                {lesson.challenge ? (
                  <>
                    {progress.code[key] === 'solved' && <span className="solved-flag">solved</span>}
                    <DifficultyBadge difficulty={lesson.challenge.difficulty} />
                  </>
                ) : (
                  <span className="no-challenge">—</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      <AdSlot id={`module-${module.id}`} />
    </div>
  );
}
