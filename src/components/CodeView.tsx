import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import type { CodingChallenge } from '../types';
import { recordCode } from '../lib/progress';
import { runCode, runTests } from '../lib/python';
import type { RunResult, TestRun } from '../lib/python';
import { Inline } from './ui';

const draftKey = (storageKey: string) => `ailearn-draft-${storageKey}`;

export default function CodeView({
  challenge,
  storageKey,
}: {
  challenge: CodingChallenge;
  storageKey: string;
}) {
  const [code, setCode] = useState<string>(
    () => localStorage.getItem(draftKey(storageKey)) ?? challenge.starterCode,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [tests, setTests] = useState<TestRun | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const onChange = (value: string) => {
    setCode(value);
    try {
      localStorage.setItem(draftKey(storageKey), value);
    } catch {
      // storage unavailable — keep editing in memory
    }
  };

  const handleRun = async () => {
    setBusy('Starting…');
    setTests(null);
    const result = await runCode(code, challenge.packages, setBusy);
    setOutput(result);
    setBusy(null);
  };

  const handleTest = async () => {
    setBusy('Starting…');
    setOutput(null);
    const run = await runTests(code, challenge.testCode, challenge.packages, setBusy);
    setTests(run);
    setBusy(null);
    const allPassed = !!run.results?.length && run.results.every((r) => r.passed);
    recordCode(storageKey, allPassed ? 'solved' : 'attempted');
  };

  const handleReset = () => {
    if (window.confirm('Reset your code to the starter template?')) {
      setCode(challenge.starterCode);
      localStorage.removeItem(draftKey(storageKey));
      setOutput(null);
      setTests(null);
    }
  };

  const passedCount = tests?.results?.filter((r) => r.passed).length ?? 0;
  const totalCount = tests?.results?.length ?? 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="code-view">
      <div className="code-grid">
        <div className="code-description">
          {challenge.connection && (
            <div className="connection-note">
              <span className="connection-label">Why this exercise</span>
              <p>
                <Inline text={challenge.connection} />
              </p>
            </div>
          )}
          {challenge.description.split('\n\n').map((para, i) => (
            <p key={i}>
              <Inline text={para} />
            </p>
          ))}

          {challenge.examples?.map((ex, i) => (
            <div key={i} className="code-example">
              <div>
                <span className="example-label">Input:</span> <code>{ex.input}</code>
              </div>
              <div>
                <span className="example-label">Output:</span> <code>{ex.output}</code>
              </div>
              {ex.explanation && <div className="example-explanation">{ex.explanation}</div>}
            </div>
          ))}

          {challenge.hints && challenge.hints.length > 0 && (
            <div className="hints">
              {challenge.hints.slice(0, hintsShown).map((h, i) => (
                <div key={i} className="hint">
                  💡 <Inline text={h} />
                </div>
              ))}
              {hintsShown < challenge.hints.length && (
                <button className="btn btn-ghost btn-small" onClick={() => setHintsShown((n) => n + 1)}>
                  {hintsShown === 0 ? 'Show a hint' : 'Another hint'} ({challenge.hints.length - hintsShown}{' '}
                  left)
                </button>
              )}
            </div>
          )}

          <div className="solution-area">
            <button className="btn btn-ghost btn-small" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? 'Hide solution' : 'Show solution'}
            </button>
            {showSolution && (
              <pre className="solution-code">
                <code>{challenge.solution}</code>
              </pre>
            )}
          </div>
        </div>

        <div className="code-editor-pane">
          <CodeMirror
            value={code}
            height="420px"
            theme={oneDark}
            extensions={[python()]}
            onChange={onChange}
            basicSetup={{ lineNumbers: true, foldGutter: false }}
          />
          <div className="code-actions">
            <button className="btn btn-ghost" onClick={handleRun} disabled={busy !== null}>
              ▶ Run
            </button>
            <button className="btn btn-primary" onClick={handleTest} disabled={busy !== null}>
              {busy ?? 'Submit (run tests)'}
            </button>
            <button className="btn btn-ghost" onClick={handleReset} disabled={busy !== null}>
              Reset
            </button>
            <span className="code-note">Python runs in your browser (Pyodide) — nothing is uploaded.</span>
          </div>

          {output && (
            <div className="output-panel">
              <div className="output-title">Output</div>
              {output.stdout && <pre className="output-stdout">{output.stdout}</pre>}
              {output.error && <pre className="output-error">{output.error}</pre>}
              {!output.stdout && !output.error && <pre className="output-stdout">(no output)</pre>}
            </div>
          )}

          {tests && (
            <div className="output-panel">
              <div className={`test-summary ${allPassed ? 'test-summary-pass' : 'test-summary-fail'}`}>
                {tests.results
                  ? allPassed
                    ? `🎉 All ${totalCount} tests passed — challenge solved!`
                    : `${passedCount}/${totalCount} tests passed`
                  : 'Your code raised an error before tests could run.'}
              </div>
              {tests.results?.map((r, i) => (
                <div key={i} className={`test-row ${r.passed ? 'test-pass' : 'test-fail'}`}>
                  <span>{r.passed ? '✓' : '✗'}</span>
                  <span className="test-name">{r.name}</span>
                  {r.error && <span className="test-error">{r.error}</span>}
                </div>
              ))}
              {tests.error && <pre className="output-error">{tests.error}</pre>}
              {tests.stdout && <pre className="output-stdout">{tests.stdout}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
