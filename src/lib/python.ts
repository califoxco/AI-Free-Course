/** Pyodide loader and Python execution helpers (everything runs in the browser). */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const RESULTS_MARKER = '___AILEARN_RESULTS___';

type Pyodide = {
  runPythonAsync: (code: string, opts?: { globals?: unknown }) => Promise<unknown>;
  loadPackage: (names: string[]) => Promise<void>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  globals: { get: (name: string) => any };
};

let pyodidePromise: Promise<Pyodide> | null = null;
const loadedPackages = new Set<string>();

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

export function getPyodide(onStatus?: (msg: string) => void): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.('Downloading Python runtime (~10 MB, one time)…');
      await injectScript(PYODIDE_BASE + 'pyodide.js');
      onStatus?.('Starting Python…');
      const loadPyodide = (window as any).loadPyodide;
      const pyodide: Pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
      return pyodide;
    })();
    pyodidePromise.catch(() => {
      pyodidePromise = null; // allow retry after a network failure
    });
  }
  return pyodidePromise;
}

async function ensurePackages(pyodide: Pyodide, packages: string[], onStatus?: (msg: string) => void) {
  const missing = packages.filter((p) => !loadedPackages.has(p));
  if (missing.length) {
    onStatus?.(`Loading ${missing.join(', ')}…`);
    await pyodide.loadPackage(missing);
    missing.forEach((p) => loadedPackages.add(p));
  }
}

export interface RunResult {
  stdout: string;
  error: string | null;
}

async function execute(code: string, packages: string[] | undefined, onStatus?: (msg: string) => void): Promise<RunResult> {
  const pyodide = await getPyodide(onStatus);
  if (packages?.length) await ensurePackages(pyodide, packages, onStatus);
  onStatus?.('Running…');

  const lines: string[] = [];
  pyodide.setStdout({ batched: (s) => lines.push(s) });
  pyodide.setStderr({ batched: (s) => lines.push(s) });

  // Fresh namespace per run so stale definitions from previous runs can't leak in.
  const ns = pyodide.globals.get('dict')();
  try {
    await pyodide.runPythonAsync(code, { globals: ns });
    return { stdout: lines.join('\n'), error: null };
  } catch (err: any) {
    return { stdout: lines.join('\n'), error: String(err?.message ?? err) };
  } finally {
    ns.destroy?.();
  }
}

export function runCode(code: string, packages?: string[], onStatus?: (msg: string) => void): Promise<RunResult> {
  return execute(code, packages, onStatus);
}

export interface TestResult {
  name: string;
  passed: boolean;
  error: string | null;
}

export interface TestRun {
  results: TestResult[] | null; // null when the code errored before tests reported
  stdout: string;
  error: string | null;
}

const HARNESS = `
import json as __json
__results = []
def __check(name, fn):
    try:
        fn()
        __results.append({"name": name, "passed": True, "error": None})
    except AssertionError as __e:
        __results.append({"name": name, "passed": False, "error": str(__e) or "assertion failed"})
    except Exception as __e:
        __results.append({"name": name, "passed": False, "error": type(__e).__name__ + ": " + str(__e)})
`;

export async function runTests(
  userCode: string,
  testCode: string,
  packages?: string[],
  onStatus?: (msg: string) => void,
): Promise<TestRun> {
  const full = [userCode, HARNESS, testCode, `print(${JSON.stringify(RESULTS_MARKER)} + __json.dumps(__results))`].join('\n\n');
  const { stdout, error } = await execute(full, packages, onStatus);

  let results: TestResult[] | null = null;
  const visible: string[] = [];
  for (const line of stdout.split('\n')) {
    if (line.startsWith(RESULTS_MARKER)) {
      try {
        results = JSON.parse(line.slice(RESULTS_MARKER.length));
      } catch {
        // malformed marker line — treat as ordinary output
        visible.push(line);
      }
    } else {
      visible.push(line);
    }
  }
  return { results, stdout: visible.join('\n').trim(), error };
}
