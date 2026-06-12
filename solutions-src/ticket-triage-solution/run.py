"""
Orchestrator: load tickets -> classify -> score against gold labels -> cost projection.

  python run.py                              # offline rule-based baseline (no API key)
  python run.py --provider anthropic         # the real LLM classifier (needs ANTHROPIC_API_KEY)
  python run.py --provider anthropic --model claude-haiku-4-5   # recommended production tier
  python run.py --provider anthropic --limit 20                 # cheap subset while iterating
"""
from __future__ import annotations

import argparse
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import classify as C
import evaluate as E

HERE = Path(__file__).parent
DATA = HERE / "data"

# $ per 1M tokens (input, output). Cached input reads bill at 0.1x input.
PRICING = {
    "claude-haiku-4-5": (1.00, 5.00),
    "claude-sonnet-4-6": (3.00, 15.00),
    "claude-opus-4-8": (5.00, 25.00),
}


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def project_cost(avg_in: float, avg_cached: float, avg_out: float, monthly: int = 50_000) -> None:
    print(f"\nCost projection at {monthly:,} tickets/month")
    print(f"  avg tokens/ticket: {avg_in:.0f} uncached-in + {avg_cached:.0f} cached-in + {avg_out:.0f} out")
    print(f"  {'model':<20}{'$ / month':>12}")
    for model, (p_in, p_out) in PRICING.items():
        cost = monthly * (avg_in / 1e6 * p_in + avg_cached / 1e6 * p_in * 0.1 + avg_out / 1e6 * p_out)
        print(f"  {model:<20}{'$' + format(cost, ',.2f'):>12}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Support ticket triage pipeline.")
    ap.add_argument("--provider", choices=["baseline", "anthropic"], default="baseline")
    ap.add_argument("--model", default="claude-opus-4-8")
    ap.add_argument("--limit", type=int, default=0, help="classify only the first N test tickets")
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    labeled = load_jsonl(DATA / "tickets_labeled.jsonl")
    test = load_jsonl(DATA / "tickets_test.jsonl")
    gold = {r["id"]: r for r in load_jsonl(DATA / "labels_test.jsonl")}
    if args.limit:
        test = test[: args.limit]

    taxonomy = (HERE / "taxonomy.md").read_text(encoding="utf-8")
    system = C.build_system_prompt(taxonomy, C.pick_few_shot(labeled))

    if args.provider == "anthropic":
        clf = C.AnthropicClassifier(system, model=args.model)
        if args.model != "claude-haiku-4-5":
            print(
                f"[note] Running on {args.model}. For this high-volume classifier, "
                "--model claude-haiku-4-5 is far cheaper at similar quality - see REPORT.md.\n"
            )
        runner = lambda: list(  # noqa: E731
            ThreadPoolExecutor(max_workers=args.workers).map(clf.classify, test)
        )
    else:
        clf = C.BaselineClassifier()
        print("[baseline] Rule-based classifier - no API key needed. This is the floor to beat.\n")
        runner = lambda: [clf.classify(t) for t in test]  # noqa: E731

    t0 = time.time()
    preds = runner()
    elapsed = time.time() - t0

    ids = [t["id"] for t in test]
    g = {f: [gold[i][f] for i in ids] for f in ["category", "priority", "needs_human"]}
    g_oid = [gold[i]["order_id"] for i in ids]
    p_cat = [pr.category for pr in preds]
    p_pri = [pr.priority for pr in preds]
    p_hum = [pr.needs_human for pr in preds]
    p_oid = [pr.order_id for pr in preds]

    label = args.provider + (f"/{args.model}" if args.provider == "anthropic" else "")
    print("=" * 66)
    print(f"Classified {len(test)} tickets in {elapsed:.1f}s  ({label})")
    print("=" * 66)

    print("\nCATEGORY  - per-class precision / recall / F1")
    prf = E.per_class_prf(g["category"], p_cat, C.CATEGORIES)
    macro = [0.0, 0.0, 0.0]
    for lab in C.CATEGORIES:
        pp, rr, ff, n = prf[lab]
        macro[0] += pp
        macro[1] += rr
        macro[2] += ff
        print(f"  {lab:<16} P={pp:.2f}  R={rr:.2f}  F1={ff:.2f}  (n={n})")
    k = len(C.CATEGORIES)
    print(f"  {'macro avg':<16} P={macro[0]/k:.2f}  R={macro[1]/k:.2f}  F1={macro[2]/k:.2f}")
    print(f"  accuracy = {E.accuracy(g['category'], p_cat):.2f}")

    print("\nPRIORITY")
    print(f"  accuracy = {E.accuracy(g['priority'], p_pri):.2f}")

    print("\nNEEDS_HUMAN  - the metric that matters most (a missed escalation is the worst failure)")
    pp, rr, ff = E.binary_prf(g["needs_human"], p_hum)
    print(f"  precision={pp:.2f}  recall={rr:.2f}  F1={ff:.2f}  (positives in test: {sum(g['needs_human'])})")

    print("\nORDER_ID extraction")
    oid_acc = sum(1 for a, b in zip(g_oid, p_oid) if (a or None) == (b or None)) / len(ids)
    print(f"  exact-match accuracy = {oid_acc:.2f}")

    print("\nCATEGORY confusion - top mistakes (gold -> predicted)")
    for (gg, pp_), c in E.top_confusions(g["category"], p_cat):
        print(f"  {gg:<16} -> {pp_:<16} x{c}")

    if args.provider == "anthropic":
        n = len(preds)
        avg_in = sum(pr.usage["input"] for pr in preds) / n
        avg_cached = sum(pr.usage["cache_read"] for pr in preds) / n
        avg_out = sum(pr.usage["output"] for pr in preds) / n
        project_cost(avg_in, avg_cached, avg_out)
    else:
        project_cost(avg_in=120, avg_cached=700, avg_out=30)
        print("  (token figures are estimates; run --provider anthropic for measured usage)")


if __name__ == "__main__":
    main()
