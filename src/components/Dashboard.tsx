import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { flatLessons, lessonKey, modules } from '../data';
import { lessonStatus, quizPassed, resetProgress, useProgress } from '../lib/progress';
import { ProgressBar } from './ui';
import EmailCapture from './EmailCapture';

const moduleImage = (id: string) => `https://picsum.photos/seed/ailearn-${id}/720/480?grayscale`;

export default function Dashboard() {
  const progress = useProgress();

  const totalLessons = flatLessons.length;
  const doneLessons = flatLessons.filter(
    (fl) => lessonStatus(progress, fl.module.id, fl.lesson) === 'complete',
  ).length;
  const challenges = flatLessons.filter((fl) => fl.lesson.challenge);
  const solved = challenges.filter(
    (fl) => progress.code[lessonKey(fl.module.id, fl.lesson.id)] === 'solved',
  ).length;
  const quizzesPassed = flatLessons.filter((fl) =>
    quizPassed(progress, lessonKey(fl.module.id, fl.lesson.id)),
  ).length;
  const anyProgress =
    Object.keys(progress.quiz).length > 0 ||
    Object.keys(progress.code).length > 0 ||
    Object.keys(progress.resources).length > 0;

  return (
    <div className="dashboard">
      <section className="hero">
        <div className="hero-art" aria-hidden="true">
          <img src="https://picsum.photos/seed/ailearn-hero/1600/900?grayscale&blur=2" alt="" />
        </div>
        <span className="eyebrow">A free, self-paced course · 37 lessons · 16 challenges · 3 projects</span>
        <h1>
          From <span className="hero-dim">software engineer</span>
          <br />
          to <span className="hero-accent">AI engineer</span>
        </h1>
        <p className="hero-text">
          A structured roadmap of the best courses, lectures, and papers on the internet — paired
          with quizzes and in-browser Python challenges so you actually retain it. Work through the
          modules in order; everything builds on what came before.
        </p>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">
              {doneLessons}
              <span className="stat-max">/{totalLessons}</span>
            </div>
            <div className="stat-label">Lessons complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {quizzesPassed}
              <span className="stat-max">/{totalLessons}</span>
            </div>
            <div className="stat-label">Quizzes passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {solved}
              <span className="stat-max">/{challenges.length}</span>
            </div>
            <div className="stat-label">Challenges solved</div>
          </div>
        </div>
      </section>

      <section className="roadmap">
        <h2 className="section-title">The roadmap</h2>
        <div className="roadmap-list">
          {modules.map((module, idx) => {
            const done = module.lessons.filter(
              (l) => lessonStatus(progress, module.id, l) === 'complete',
            ).length;
            const challengeCount = module.lessons.filter((l) => l.challenge).length;
            const finished = done === module.lessons.length;
            return (
              <Link
                key={module.id}
                to={`/module/${module.id}`}
                className="module-card"
                style={{ '--i': idx } as CSSProperties}
              >
                <div className="module-thumb">
                  <img src={moduleImage(module.id)} alt="" loading="lazy" />
                  <span className={`module-num ${finished ? 'module-num-done' : ''}`}>
                    {finished ? '✓' : String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="module-card-body">
                  <div className="module-card-head">
                    <h3>{module.title}</h3>
                    <span className="module-count">
                      {done}/{module.lessons.length}
                    </span>
                  </div>
                  <p className="module-tagline">{module.tagline}</p>
                  <div className="module-card-meta">
                    <ProgressBar value={done} max={module.lessons.length} />
                    <span className="module-meta-text">
                      {module.lessons.length} lessons
                      {challengeCount > 0 &&
                        ` · ${challengeCount} coding challenge${challengeCount > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="projects-cta">
        <div className="projects-cta-body">
          <span className="eyebrow">After the course</span>
          <h2>Three enterprise take-home projects</h2>
          <p>
            The assignments companies actually send AI-engineer candidates — a cited RAG assistant, a
            ticket-triage pipeline, and an analytics agent — each with downloadable datasets, eval
            sets with gold answers, and the grading criteria reviewers use.
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          View the projects →
        </Link>
      </section>

      <EmailCapture context="dashboard" />

      {anyProgress && (
        <div className="danger-zone">
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('Reset all course progress? This cannot be undone.')) {
                resetProgress();
              }
            }}
          >
            Reset all progress
          </button>
        </div>
      )}
    </div>
  );
}
