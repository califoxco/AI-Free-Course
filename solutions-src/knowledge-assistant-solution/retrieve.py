"""
Retrievers - the R in RAG, implemented from scratch in the standard library.

Two interchangeable backends behind the same .retrieve(query, k) interface:

  * BM25       - the classic lexical ranking function (what Elasticsearch runs).
                 Term-frequency saturation + length normalization + IDF.
  * TfidfCosine- sparse TF-IDF vectors scored by cosine similarity. Mechanically
                 identical to neural-embedding retrieval (vectors + cosine); the
                 only difference is the vectors are sparse word counts instead of
                 learned dense semantics.

Why no neural embeddings here? Two honest reasons. (1) Anthropic's API does not
ship an embeddings endpoint, and this solution deliberately has a single optional
dependency; (2) for a 15-document corpus with consistent in-house terminology,
lexical retrieval is a strong baseline - the eval (recall@k in run.py) is what
tells you whether you need more. The Retriever interface is one class away from
a voyage/sentence-transformers backend if the measurement says so.
"""
from __future__ import annotations

import math
from collections import Counter
from dataclasses import dataclass

from ingest import Chunk, tokenize


@dataclass
class Hit:
    chunk: Chunk
    score: float


class BM25:
    def __init__(self, chunks: list[Chunk], k1: float = 1.5, b: float = 0.75):
        self.chunks = chunks
        self.k1, self.b = k1, b
        self._docs = [tokenize(c.text) for c in chunks]
        self._tf = [Counter(d) for d in self._docs]
        self._len = [len(d) for d in self._docs]
        n = len(chunks)
        self._avglen = sum(self._len) / n
        df: Counter = Counter()
        for d in self._docs:
            df.update(set(d))
        # standard BM25+ style idf; always positive
        self._idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def retrieve(self, query: str, k: int = 5) -> list[Hit]:
        q = tokenize(query)
        hits = []
        for i, chunk in enumerate(self.chunks):
            s = 0.0
            norm = self.k1 * (1 - self.b + self.b * self._len[i] / self._avglen)
            for t in q:
                f = self._tf[i].get(t, 0)
                if f:
                    s += self._idf[t] * f * (self.k1 + 1) / (f + norm)
            hits.append(Hit(chunk, s))
        hits.sort(key=lambda h: h.score, reverse=True)
        return hits[:k]


class TfidfCosine:
    def __init__(self, chunks: list[Chunk]):
        self.chunks = chunks
        docs = [tokenize(c.text) for c in chunks]
        n = len(chunks)
        df: Counter = Counter()
        for d in docs:
            df.update(set(d))
        self._idf = {t: math.log(n / f) + 1 for t, f in df.items()}
        self._vecs = [self._vectorize(d) for d in docs]

    def _vectorize(self, tokens: list[str]) -> dict[str, float]:
        tf = Counter(tokens)
        vec = {t: c * self._idf.get(t, 0.0) for t, c in tf.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {t: v / norm for t, v in vec.items()}

    def retrieve(self, query: str, k: int = 5) -> list[Hit]:
        qv = self._vectorize(tokenize(query))
        hits = []
        for chunk, dv in zip(self.chunks, self._vecs):
            # cosine of unit vectors = dot product (same math as embedding search)
            score = sum(w * dv.get(t, 0.0) for t, w in qv.items())
            hits.append(Hit(chunk, score))
        hits.sort(key=lambda h: h.score, reverse=True)
        return hits[:k]
