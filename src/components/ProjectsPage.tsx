import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { DifficultyBadge } from './ui';
import EmailCapture from './EmailCapture';

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <nav className="breadcrumb">
        <Link to="/">Roadmap</Link> <span>/</span> Take-home projects
      </nav>
      <span className="eyebrow">Prove it · 3 enterprise take-homes</span>
      <h1>Interview-grade projects</h1>
      <p className="lesson-summary">
        These are the kinds of take-home assignments enterprise companies actually send AI-engineer
        candidates — a RAG system with evals, a structured-output pipeline with cost analysis, and a
        tool-using agent over real data. Each comes with the assets a hiring team would provide:
        documents, labeled datasets, and gold-answer eval sets. Build them on your own machine, with
        any stack; the brief and grading criteria are in each download.
      </p>

      <div className="project-list">
        {projects.map((p, idx) => (
          <article key={p.id} className="project-card">
            <header className="project-head">
              <div>
                <span className="project-num">Project {String(idx + 1).padStart(2, '0')}</span>
                <h2>{p.title}</h2>
                <p className="project-company">{p.company}</p>
              </div>
              <div className="project-head-right">
                <DifficultyBadge difficulty={p.difficulty} />
                <span className="project-time">{p.timeEstimate}</span>
              </div>
            </header>

            <p className="project-scenario">{p.scenario}</p>

            <div className="project-skills">
              {p.skills.map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>

            <div className="project-columns">
              <div>
                <h3>What you build</h3>
                <ul>
                  {p.tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>What reviewers look for</h3>
                <ul>
                  {p.rubric.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="project-assets">
              <h3>Included assets</h3>
              <ul>
                {p.assets.map((a) => (
                  <li key={a.file}>
                    <code>{a.file}</code> — {a.description}
                  </li>
                ))}
              </ul>
              <div className="project-downloads">
                <a className="btn btn-primary project-download" href={p.downloadUrl} download>
                  ↓ Download assets ({p.sizeKb} KB zip)
                </a>
                {p.solution && (
                  <a className="btn btn-ghost project-download" href={p.solution.url} download>
                    ↓ Reference solution ({p.solution.sizeKb} KB) — try it yourself first
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="projects-footnote">
        All data is synthetic but internally consistent — the gold answers in each eval set were
        computed directly from the included datasets, so you can score yourself exactly.
      </p>

      <EmailCapture context="projects" />
    </div>
  );
}
