"""
Ingestion: load the 15 markdown docs and split them into retrieval chunks.

Chunking strategy: STRUCTURE-AWARE, not fixed-size. These are short, well-structured
policy/docs files with meaningful `##` sections, so the natural retrieval unit is
"one section of one document" - a section is a single coherent policy statement
(e.g. "PTO Policy > Carryover"). Fixed-size windows would cut mid-rule and force
overlap bookkeeping for no benefit at this corpus size.

Each chunk is prefixed with its document title and section heading ("contextual
retrieval", lite): an isolated sentence like "Up to 5 unused days may be carried
over" matches queries far better when the chunk also carries the tokens
"PTO Policy / Carryover".
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Chunk:
    source: str   # filename, e.g. "pto-policy.md" - this is what citations point at
    title: str    # document H1
    section: str  # H2 heading ("" for the preamble before the first H2)
    text: str     # heading-prefixed body used for both indexing and prompting


def _split_sections(markdown: str) -> tuple[str, list[tuple[str, str]]]:
    """Returns (doc_title, [(section_heading, section_body), ...])."""
    title = ""
    sections: list[tuple[str, str]] = []
    heading = ""
    buf: list[str] = []

    def flush() -> None:
        body = "\n".join(buf).strip()
        if body:
            sections.append((heading, body))
        buf.clear()

    for line in markdown.splitlines():
        if line.startswith("# ") and not title:
            title = line[2:].strip()
        elif line.startswith("## "):
            flush()
            heading = line[3:].strip()
        else:
            buf.append(line)
    flush()
    return title, sections


def load_chunks(docs_dir: Path) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(docs_dir.glob("*.md")):
        title, sections = _split_sections(path.read_text(encoding="utf-8"))
        for heading, body in sections:
            header = f"{title} - {heading}" if heading else title
            chunks.append(
                Chunk(
                    source=path.name,
                    title=title,
                    section=heading,
                    text=f"{header}\n{body}",
                )
            )
    return chunks


# --- shared tokenizer (used by both retrievers) ---

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "am", "do", "does",
    "did", "to", "of", "in", "on", "for", "and", "or", "not", "no", "with", "at",
    "by", "from", "as", "that", "this", "these", "those", "it", "its", "i", "my",
    "we", "our", "you", "your", "how", "what", "when", "where", "which", "who",
    "why", "can", "could", "should", "would", "may", "must", "will", "if", "than",
}


def tokenize(text: str) -> list[str]:
    """Lowercase word tokens, stopwords dropped, with a deliberately crude stemmer
    (strip possessives and plural -s). Crude is fine: both queries and documents
    pass through the same function, so it only needs to be consistent."""
    out = []
    for w in re.findall(r"[a-z0-9']+", text.lower()):
        if w.endswith("'s"):
            w = w[:-2]
        w = w.strip("'")
        if len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        if w and w not in _STOPWORDS:
            out.append(w)
    return out
