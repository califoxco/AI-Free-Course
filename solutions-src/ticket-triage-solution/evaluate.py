"""Evaluation metrics — pure standard library. The same precision / recall / F1 you
implemented in Module 2, applied to the triage outputs."""
from __future__ import annotations

from collections import Counter


def _prf(tp: int, fp: int, fn: int) -> tuple[float, float, float]:
    p = tp / (tp + fp) if (tp + fp) else 0.0
    r = tp / (tp + fn) if (tp + fn) else 0.0
    f = 2 * p * r / (p + r) if (p + r) else 0.0
    return p, r, f


def per_class_prf(gold: list, pred: list, labels: list) -> dict:
    """Returns {label: (precision, recall, f1, support)} for a multi-class field."""
    out = {}
    for lab in labels:
        tp = sum(1 for g, p in zip(gold, pred) if g == lab and p == lab)
        fp = sum(1 for g, p in zip(gold, pred) if g != lab and p == lab)
        fn = sum(1 for g, p in zip(gold, pred) if g == lab and p != lab)
        support = sum(1 for g in gold if g == lab)
        out[lab] = (*_prf(tp, fp, fn), support)
    return out


def accuracy(gold: list, pred: list) -> float:
    return sum(1 for g, p in zip(gold, pred) if g == p) / len(gold) if gold else 0.0


def binary_prf(gold: list, pred: list) -> tuple[float, float, float]:
    """Precision / recall / F1 for a boolean field (True is the positive class)."""
    tp = sum(1 for g, p in zip(gold, pred) if g and p)
    fp = sum(1 for g, p in zip(gold, pred) if not g and p)
    fn = sum(1 for g, p in zip(gold, pred) if g and not p)
    return _prf(tp, fp, fn)


def top_confusions(gold: list, pred: list, n: int = 6) -> list:
    """Most frequent (gold -> predicted) mistakes, for error analysis."""
    pairs: Counter = Counter()
    for g, p in zip(gold, pred):
        if g != p:
            pairs[(g, p)] += 1
    return pairs.most_common(n)
