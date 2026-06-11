import type { Module } from '../types';

export const m6: Module = {
  id: 'rag',
  title: 'RAG & Embeddings',
  tagline: 'Ground models in your data: embeddings, vector search, chunking, retrieval.',
  description:
    'Retrieval-Augmented Generation is the most-deployed LLM architecture in industry: embed your documents, retrieve what’s relevant to a query, and let the model answer with sources. This module covers the whole pipeline — embeddings, chunking, vector search, and the advanced tricks (hybrid search, reranking) that separate demos from production systems.',
  lessons: [
    {
      id: 'embeddings-search',
      title: 'Embeddings & Semantic Search',
      summary:
        'Embedding models map text to vectors where semantic similarity becomes geometric proximity — "How do I reset my password?" lands near "credential recovery steps" despite sharing zero words. This single capability powers semantic search, RAG, clustering, deduplication, and recommendations.',
      objectives: [
        'Explain what an embedding model produces and what distance means in that space',
        'Implement cosine-similarity search over a set of vectors',
        'Distinguish embedding models from generative models',
      ],
      resources: [
        {
          type: 'video',
          title: 'Word Embedding and Word2Vec, Clearly Explained!!!',
          url: 'https://www.youtube.com/watch?v=viZrOnJclY0',
          author: 'StatQuest',
          duration: '16 min',
          description: 'How text becomes vectors with meaningful geometry — the foundation of everything in this module.',
        },
        {
          type: 'article',
          title: 'What are Vector Embeddings?',
          url: 'https://www.pinecone.io/learn/vector-embeddings/',
          author: 'Pinecone Learning Center',
          duration: '20 min',
          description: 'Clear intro to embeddings and similarity metrics.',
        },
        {
          type: 'docs',
          title: 'Embeddings guide',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/embeddings',
          author: 'Anthropic',
          duration: '15 min',
          description: 'Practical guidance on using embedding models in applications.',
        },
        {
          type: 'article',
          title: 'Sentence Transformers documentation',
          url: 'https://www.sbert.net/',
          author: 'SBERT',
          duration: 'reference',
          description: 'The standard open-source library — run your first embedding model locally in 5 lines.',
        },
      ],
      quiz: [
        {
          question: 'Two texts have embeddings with cosine similarity 0.92. This suggests…',
          options: [
            'They are semantically similar in meaning, even if they share few exact words',
            'They are character-for-character nearly identical',
            'One is a translation of the other',
            'They have the same length',
          ],
          correct: 0,
          explanation:
            'Embedding models are trained so that meaning, not surface form, determines position in the space. That’s the whole point: matching "password reset" to "can’t log into my account".',
        },
        {
          question: 'Embedding models differ from generative LLMs in that they…',
          options: [
            'Output a fixed-size vector representing the input’s meaning, rather than generating tokens',
            'Cannot process text longer than one sentence',
            'Are always larger than generative models',
            'Require labeled data for every query',
          ],
          correct: 0,
          explanation:
            'Encoder-style models compress input into a vector (typically 256–3072 dims). They’re far cheaper and faster than generative models — you embed millions of documents, you generate sparingly.',
        },
        {
          question: 'Keyword search (BM25) beats pure embedding search when the query is…',
          options: [
            'An exact identifier like an error code, SKU, or function name that must match literally',
            'A vague natural-language question',
            'A paraphrase of document content',
            'In a different language from the documents',
          ],
          correct: 0,
          explanation:
            'Embeddings blur "ERR_CONN_4012" toward other error codes; exact-match terms are where lexical search shines. This complementarity is why production systems run hybrid search (both, merged).',
        },
      ],
      challenge: {
        title: 'Top-K Semantic Search',
        difficulty: 'Easy',
        connection:
          'The lesson said semantic search has two halves: an embedding model turns text into vectors (you saw how in the StatQuest video — in production you call an embeddings API for this), and then a search finds the nearest vectors. This exercise is the ENTIRE second half. When a vector database advertises "similarity search", this function is what it runs at scale.',
        description:
          'Picture the setup: your embedding model has already converted a pile of support articles into vectors, and a user query has just been embedded the same way. The tests hand you these vectors directly — your job is the search step that finds which articles the query is closest to.\n\n`cosine_similarity(a, b)` — cosine similarity between two equal-length lists of floats: `dot(a, b) / (|a| * |b|)`. If either vector has zero magnitude, return `0.0`. (Recall from the lesson why cosine: direction encodes meaning; length should not matter.)\n\n`top_k(query, vectors, k)` — given the query vector and the list of document vectors, return the *indices* of the `k` most similar documents, ordered from most to least similar. Those indices are how you would look up the original text to show the user — or, in the next lessons, to stuff into a RAG prompt.',
        examples: [
          {
            input: 'cosine_similarity([1, 0], [1, 0])',
            output: '1.0',
          },
          {
            input: 'top_k([1, 0], [[0, 1], [1, 0], [0.9, 0.1]], 2)',
            output: '[1, 2]',
            explanation: 'Index 1 is identical in direction; index 2 is close; index 0 is orthogonal.',
          },
        ],
        starterCode:
          'import math\n\ndef cosine_similarity(a, b):\n    # dot(a,b) / (|a| * |b|); return 0.0 if either norm is 0\n    pass\n\n\ndef top_k(query, vectors, k):\n    # Return indices of the k most similar vectors, most similar first.\n    pass\n',
        solution:
          'import math\n\ndef cosine_similarity(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    if na == 0 or nb == 0:\n        return 0.0\n    return dot / (na * nb)\n\n\ndef top_k(query, vectors, k):\n    scored = [(cosine_similarity(query, v), i) for i, v in enumerate(vectors)]\n    scored.sort(key=lambda t: t[0], reverse=True)\n    return [i for _, i in scored[:k]]\n',
        testCode:
          'def t1():\n    assert abs(cosine_similarity([1, 0], [1, 0]) - 1.0) < 1e-9\n__check("identical direction -> 1.0", t1)\n\ndef t2():\n    assert abs(cosine_similarity([1, 0], [0, 1])) < 1e-9\n__check("orthogonal vectors -> 0.0", t2)\n\ndef t3():\n    assert abs(cosine_similarity([1, 2], [-1, -2]) - (-1.0)) < 1e-9\n__check("opposite direction -> -1.0", t3)\n\ndef t4():\n    assert cosine_similarity([0, 0], [1, 2]) == 0.0, "zero vector must return 0.0, not crash"\n__check("zero vector handled", t4)\n\ndef t5():\n    a, b = [3, 0], [1, 0]\n    assert abs(cosine_similarity(a, b) - 1.0) < 1e-9, "cosine ignores magnitude"\n__check("magnitude-invariant", t5)\n\ndef t6():\n    docs = [[0, 1], [1, 0], [0.9, 0.1]]\n    assert top_k([1, 0], docs, 2) == [1, 2], f"got {top_k([1, 0], docs, 2)}"\n__check("top_k returns best matches in order", t6)\n\ndef t7():\n    docs = [[1, 1], [2, 2], [-1, -1], [1, 0]]\n    out = top_k([1, 1], docs, 4)\n    assert out[:2] in ([0, 1], [1, 0]), "the two parallel vectors rank first"\n    assert out[-1] == 2, "the opposite vector ranks last"\n__check("full ranking is correct", t7)\n',
        hints: [
          'Score every vector with enumerate, sort by score descending, slice the first k, return indices.',
          'sorted(..., key=..., reverse=True) or sort with a (score, index) tuple list both work.',
        ],
      },
    },
    {
      id: 'chunking-vectordb',
      title: 'Chunking Strategies & Vector Databases',
      summary:
        'You can’t embed a 200-page PDF as one vector — you must split documents into chunks, and how you split materially changes retrieval quality. Then those vectors need a home: vector databases index millions of embeddings for fast approximate nearest-neighbor search.',
      objectives: [
        'Compare chunking strategies (fixed, overlapping, semantic/structural)',
        'Explain why overlap exists and what chunk size trades off',
        'Describe what a vector DB adds over a NumPy array (ANN indexes, filtering, scale)',
      ],
      resources: [
        {
          type: 'video',
          title: 'What is a Vector Database?',
          url: 'https://www.youtube.com/watch?v=t9IDoenf-lo',
          author: 'IBM Technology',
          duration: '8 min',
          description: 'Vector indexes and similarity search infrastructure in eight minutes.',
        },
        {
          type: 'article',
          title: 'Chunking Strategies for LLM Applications',
          url: 'https://www.pinecone.io/learn/chunking-strategies/',
          author: 'Pinecone',
          duration: '20 min',
          description: 'The standard reference on chunk sizes, overlap, and structure-aware splitting.',
        },
        {
          type: 'article',
          title: 'What is a Vector Database?',
          url: 'https://www.pinecone.io/learn/vector-database/',
          author: 'Pinecone',
          duration: '25 min',
          description: 'ANN indexes (HNSW), metadata filtering, and why brute force stops scaling.',
        },
        {
          type: 'docs',
          title: 'Chroma: Getting Started',
          url: 'https://docs.trychroma.com/getting-started',
          author: 'Chroma',
          duration: '20 min hands-on',
          description: 'Spin up a local vector store and run real queries in 10 lines of Python.',
        },
      ],
      quiz: [
        {
          question: 'Why do chunking strategies include *overlap* between consecutive chunks?',
          options: [
            'So information spanning a chunk boundary appears intact in at least one chunk instead of being split mid-thought',
            'To increase the total number of vectors for better statistics',
            'Because embedding models require minimum input lengths',
            'To make all chunks exactly equal size',
          ],
          correct: 0,
          explanation:
            'A sentence cut in half embeds poorly and retrieves worse. Overlap (typically 10–20%) ensures boundary-spanning facts live wholly inside some chunk.',
        },
        {
          question: 'Very large chunks (e.g., 4,000 tokens) hurt RAG primarily because…',
          options: [
            'Each embedding averages many topics, diluting the signal — queries match the chunk’s overall gist rather than the specific fact inside it',
            'Vector databases cannot store them',
            'They are slower to embed than many small chunks',
            'Large chunks always exceed model context windows',
          ],
          correct: 0,
          explanation:
            'One vector must summarize everything in the chunk. A specific question about one paragraph gets a mediocre similarity score against a 10-topic chunk. Small chunks = precise matching (but less context per hit — hence the tradeoff).',
        },
        {
          question: 'Approximate nearest neighbor (ANN) indexes like HNSW exist because…',
          options: [
            'Exact search compares the query to every vector (O(n)); ANN trades a little recall for sub-linear search over millions of vectors',
            'Exact nearest neighbors are mathematically impossible in high dimensions',
            'They compress vectors to save disk space',
            'Cosine similarity requires graph structures to compute',
          ],
          correct: 0,
          explanation:
            'Brute force over 50M × 1536-dim vectors per query doesn’t meet latency budgets. HNSW navigates a layered graph to find ~the nearest neighbors in milliseconds at 95–99% recall.',
        },
        {
          question: 'For a few thousand documents, the pragmatic first version of retrieval is often…',
          options: [
            'A NumPy array and brute-force cosine similarity — exact, simple, fast enough at this scale',
            'A distributed vector database cluster',
            'Fine-tuning the LLM on the documents instead',
            'An LLM call comparing the query against every document',
          ],
          correct: 0,
          explanation:
            'Thousands of vectors brute-force in milliseconds. Reach for vector DB infrastructure when scale (millions), filtering, or multi-tenancy demands it — not by default. Avoid resume-driven architecture.',
        },
      ],
      challenge: {
        title: 'Text Chunker with Overlap',
        difficulty: 'Easy',
        connection:
          'The chunking-strategies article you just read becomes about ten lines of code: a sliding window with overlap. The overlap rule you implement here is the exact fix for the "fact split across a chunk boundary" failure mode from the quiz — and this function is the first stage of the RAG pipeline you will assemble in the next lesson.',
        description:
          'Implement the document-splitting step of a RAG ingestion pipeline.\n\nWrite `chunk_text(text, chunk_size, overlap)` that splits `text` into chunks of at most `chunk_size` *words*, where consecutive chunks share `overlap` words.\n\nRules: split on whitespace with `text.split()`. The window advances by `chunk_size - overlap` words each step. Each chunk is the words joined by single spaces. The final chunk may be shorter. Return `[]` for empty/whitespace-only text. Assume `0 <= overlap < chunk_size`. Do not emit a trailing chunk whose words are all already contained in the previous chunk.',
        examples: [
          {
            input: 'chunk_text("a b c d e f g", chunk_size=3, overlap=1)',
            output: '["a b c", "c d e", "e f g"]',
            explanation: 'Window of 3 words, advancing by 2; each chunk repeats the previous chunk’s last word.',
          },
        ],
        starterCode:
          'def chunk_text(text, chunk_size, overlap):\n    # Split into word-based chunks of at most chunk_size words,\n    # consecutive chunks sharing `overlap` words.\n    pass\n',
        solution:
          'def chunk_text(text, chunk_size, overlap):\n    words = text.split()\n    if not words:\n        return []\n    step = chunk_size - overlap\n    chunks = []\n    for start in range(0, len(words), step):\n        piece = words[start:start + chunk_size]\n        chunks.append(" ".join(piece))\n        if start + chunk_size >= len(words):\n            break\n    return chunks\n',
        testCode:
          'def t1():\n    out = chunk_text("a b c d e f g", 3, 1)\n    assert out == ["a b c", "c d e", "e f g"], f"got {out}"\n__check("basic overlapping chunks", t1)\n\ndef t2():\n    out = chunk_text("a b c d", 10, 2)\n    assert out == ["a b c d"], f"text shorter than chunk_size -> one chunk; got {out}"\n__check("short text yields a single chunk", t2)\n\ndef t3():\n    assert chunk_text("", 3, 1) == []\n    assert chunk_text("   ", 3, 1) == []\n__check("empty text returns []", t3)\n\ndef t4():\n    out = chunk_text("a b c d e f", 2, 0)\n    assert out == ["a b", "c d", "e f"], f"got {out}"\n__check("zero overlap tiles the text", t4)\n\ndef t5():\n    out = chunk_text("w1 w2 w3 w4 w5 w6 w7 w8", 4, 2)\n    assert out == ["w1 w2 w3 w4", "w3 w4 w5 w6", "w5 w6 w7 w8"], f"got {out}"\n__check("overlap=2: consecutive chunks share two words", t5)\n\ndef t6():\n    text = " ".join(f"w{i}" for i in range(100))\n    out = chunk_text(text, 10, 3)\n    joined = " ".join(out)\n    for i in range(100):\n        assert f"w{i}" in joined, f"word w{i} was lost"\n__check("no words are lost across 100 words", t6)\n',
        hints: [
          'Advance the window start by (chunk_size − overlap) each iteration.',
          'Once a chunk reaches the final word (start + chunk_size >= len(words)), stop — later windows would only repeat covered words.',
        ],
      },
    },
    {
      id: 'rag-architecture',
      title: 'RAG Architecture End to End',
      summary:
        'Assemble the full pipeline: ingest → chunk → embed → index, then query → retrieve → augment prompt → generate with citations. Understand why RAG beats both fine-tuning and long-context stuffing for knowledge-grounding — and where each failure mode (bad retrieval vs bad generation) comes from.',
      objectives: [
        'Diagram the complete RAG request flow',
        'Argue RAG vs fine-tuning vs full-context for a given use case',
        'Attribute a bad answer to its pipeline stage (retrieval miss vs generation error)',
      ],
      resources: [
        {
          type: 'video',
          title: 'What is Retrieval-Augmented Generation (RAG)?',
          url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
          author: 'IBM Technology (Marina Danilevsky)',
          duration: '7 min',
          description: 'The most-watched RAG explainer — the whole architecture in one whiteboard session.',
        },
        {
          type: 'paper',
          title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
          url: 'https://arxiv.org/abs/2005.11401',
          author: 'Lewis et al., 2020',
          duration: 'read §1–2',
          description: 'The paper that named RAG. The modern pattern simplified it: retrieve, stuff prompt, generate.',
        },
        {
          type: 'docs',
          title: 'Retrieval augmented generation guide',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/retrieval-augmented-generation',
          author: 'Anthropic',
          duration: '25 min',
          description: 'Practical RAG with citations and contextual retrieval techniques.',
        },
        {
          type: 'article',
          title: 'Simple RAG notebook (runnable end to end)',
          url: 'https://huggingface.co/learn/cookbook/rag_zephyr_langchain',
          author: 'Hugging Face Cookbook',
          duration: 'hands-on notebook',
          description: 'A runnable end-to-end RAG notebook with open models — do this after the challenge below.',
        },
      ],
      quiz: [
        {
          question: 'For keeping an internal support bot current with weekly policy changes, RAG beats fine-tuning because…',
          options: [
            'Updating knowledge means re-indexing documents (minutes, cheap) instead of retraining (slow, costly), and answers can cite sources',
            'Fine-tuning cannot learn factual content at all',
            'RAG requires no infrastructure',
            'Fine-tuned models cannot be deployed to production',
          ],
          correct: 0,
          explanation:
            'Fine-tuning bakes knowledge into weights — stale the moment policies change, and unable to point to sources. RAG keeps knowledge in a database: updatable, auditable, citable. Fine-tuning is for *behavior*, RAG is for *knowledge*.',
        },
        {
          question: 'Your RAG bot answers wrongly. Tracing shows the right document was never in the retrieved set. The fix belongs in…',
          options: [
            'The retrieval stage — better chunking, embeddings, query rewriting, or hybrid search; no prompt change can surface missing context',
            'The generation prompt — instruct the model to be more accurate',
            'The model — upgrade to a larger one',
            'The temperature setting',
          ],
          correct: 0,
          explanation:
            'Generation cannot use what retrieval didn’t deliver. Always diagnose RAG failures stage by stage — and measure retrieval quality (recall@k) separately from answer quality.',
        },
        {
          question: 'With million-token context windows, why not skip RAG and stuff all documents into every prompt?',
          options: [
            'Cost and latency scale with tokens processed per request, and retrieval quality degrades in huge contexts — selecting relevant content stays more efficient for most corpora',
            'Long contexts are forbidden for commercial use',
            'Models refuse inputs over 100k tokens',
            'There is no reason — RAG is obsolete',
          ],
          correct: 0,
          explanation:
            'Even at $1–3/M input tokens, sending 500k tokens per query is ruinous at scale (caching helps but isn’t free). Long context raises the ceiling and simplifies small corpora; for large or multi-tenant data, retrieval remains the economic answer.',
        },
        {
          question: 'Query rewriting (e.g., turning "what about refunds?" into a standalone question using chat history) helps because…',
          options: [
            'Embedding a context-dependent fragment retrieves poorly — the rewritten query contains the full semantic content to match against documents',
            'Vector databases reject questions with pronouns',
            'It reduces the number of tokens embedded',
            'It prevents prompt injection',
          ],
          correct: 0,
          explanation:
            '"What about refunds?" embeds to something vague without the conversation’s subject. Resolving references before embedding ("what is the refund policy for annual plans?") is one of the highest-ROI RAG upgrades.',
        },
      ],
      challenge: {
        title: 'Build a Mini RAG Pipeline',
        difficulty: 'Medium',
        connection:
          'This is the lesson’s architecture diagram as runnable code. Each function is one box from the video: `build_index` = ingest + embed, `retrieve` = the vector search, `build_prompt` = the augmentation step. The only box missing is the model call itself — one API request you already know how to make from Module 5. Build this and you have built RAG.',
        description:
          'You have read how RAG works; now assemble one. The starter code GIVES you a toy `embed()` (word counts with stopwords removed) and `similarity()` (cosine over those counts) so everything runs offline — in production you would swap `embed()` for an embeddings-API call and the rest of YOUR code would not change.\n\n`build_index(docs)` — `docs` is a list of `{"id": ..., "text": ...}` dicts. Return a list of `{"id", "text", "embedding"}` dicts where `embedding = embed(text)`. This is the ingest step (each doc here is already one chunk — you wrote the chunker in the previous lesson).\n\n`retrieve(index, query, k)` — embed the query, rank index entries by `similarity` to it (highest first), and return the top `k` entries. This is your Top-K search from two lessons ago, now wired into the pipeline.\n\n`build_prompt(query, retrieved)` — the augmentation step. Return exactly these lines joined by newlines: first the instruction `Answer the question using only the sources below. Cite the source number for each claim.`, then a blank line, then one line per retrieved chunk numbered from 1 — `[1] {text}` — then a blank line, then `Question: {query}`.\n\n`rag(docs, query, k=2)` — wire all three stages together and return the final prompt string. Send that string to any chat model and you have a working RAG system with citations.',
        examples: [
          {
            input: 'rag(DOCS, "how do I request a refund", k=1)',
            output: 'a prompt whose [1] source is the refund-policy text and which ends with the question',
            explanation: 'The refund doc shares the words "request"/"refund" with the query, so it wins retrieval.',
          },
        ],
        starterCode:
          'from collections import Counter\nimport re\n\nSTOPWORDS = {"a", "an", "the", "to", "of", "and", "is", "are", "i", "my",\n             "do", "how", "can", "in", "for", "what", "you", "your"}\n\ndef embed(text):\n    """GIVEN: toy embedding — word counts minus stopwords.\n    (Real systems use a neural model; the pipeline around it is identical.)"""\n    words = re.findall(r"[a-z\']+", text.lower())\n    return Counter(w for w in words if w not in STOPWORDS)\n\ndef similarity(a, b):\n    """GIVEN: cosine similarity between two word-count embeddings."""\n    dot = sum(count * b.get(word, 0) for word, count in a.items())\n    na = sum(v * v for v in a.values()) ** 0.5\n    nb = sum(v * v for v in b.values()) ** 0.5\n    return dot / (na * nb) if na and nb else 0.0\n\n\ndef build_index(docs):\n    # docs: list of {"id": str, "text": str}\n    # Return a list of {"id", "text", "embedding"} dicts.\n    pass\n\n\ndef retrieve(index, query, k):\n    # Embed the query, rank entries by similarity (highest first), return top k.\n    pass\n\n\ndef build_prompt(query, retrieved):\n    # Assemble the grounded prompt (exact format in the description).\n    pass\n\n\ndef rag(docs, query, k=2):\n    # The full pipeline: index -> retrieve -> prompt.\n    pass\n',
        solution:
          'from collections import Counter\nimport re\n\nSTOPWORDS = {"a", "an", "the", "to", "of", "and", "is", "are", "i", "my",\n             "do", "how", "can", "in", "for", "what", "you", "your"}\n\ndef embed(text):\n    words = re.findall(r"[a-z\']+", text.lower())\n    return Counter(w for w in words if w not in STOPWORDS)\n\ndef similarity(a, b):\n    dot = sum(count * b.get(word, 0) for word, count in a.items())\n    na = sum(v * v for v in a.values()) ** 0.5\n    nb = sum(v * v for v in b.values()) ** 0.5\n    return dot / (na * nb) if na and nb else 0.0\n\n\ndef build_index(docs):\n    return [{"id": d["id"], "text": d["text"], "embedding": embed(d["text"])} for d in docs]\n\n\ndef retrieve(index, query, k):\n    q = embed(query)\n    ranked = sorted(index, key=lambda e: similarity(q, e["embedding"]), reverse=True)\n    return ranked[:k]\n\n\ndef build_prompt(query, retrieved):\n    lines = ["Answer the question using only the sources below. Cite the source number for each claim.", ""]\n    for i, chunk in enumerate(retrieved, 1):\n        lines.append(f"[{i}] {chunk[\'text\']}")\n    lines.append("")\n    lines.append(f"Question: {query}")\n    return "\\n".join(lines)\n\n\ndef rag(docs, query, k=2):\n    return build_prompt(query, retrieve(build_index(docs), query, k))\n',
        testCode:
          'DOCS = [\n    {"id": "refunds", "text": "You can request a refund within 30 days of purchase. Refund requests are processed in 5 business days."},\n    {"id": "shipping", "text": "Standard shipping takes five business days. Express shipping arrives in two days."},\n    {"id": "passwords", "text": "Reset your password from the account settings page. A reset link expires after one hour."},\n]\n\ndef t1():\n    index = build_index(DOCS)\n    assert len(index) == 3, f"expected 3 entries, got {len(index)}"\n    assert index[0]["id"] == "refunds" and index[0]["text"] == DOCS[0]["text"]\n    assert index[0]["embedding"] == embed(DOCS[0]["text"]), "embedding must be embed(text)"\n__check("build_index: one entry per doc with id, text, embedding", t1)\n\ndef t2():\n    index = build_index(DOCS)\n    top = retrieve(index, "request a refund", 1)\n    assert len(top) == 1, "k=1 must return exactly one entry"\n    assert top[0]["id"] == "refunds", f"expected the refunds doc, got {top[0][\'id\']}"\n__check("retrieve finds the refund doc for a refund question", t2)\n\ndef t3():\n    index = build_index(DOCS)\n    top = retrieve(index, "reset my password", 2)\n    assert top[0]["id"] == "passwords", f"best match must rank first, got {top[0][\'id\']}"\n    assert len(top) == 2, "must respect k"\n__check("retrieve ranks the best match first and respects k", t3)\n\ndef t4():\n    retrieved = [\n        {"id": "a", "text": "First source.", "embedding": {}},\n        {"id": "b", "text": "Second source.", "embedding": {}},\n    ]\n    p = build_prompt("test question?", retrieved)\n    lines = p.split("\\n")\n    assert lines[0] == "Answer the question using only the sources below. Cite the source number for each claim.", f"bad instruction line: {lines[0]!r}"\n    assert lines[1] == "" and lines[4] == "", "blank lines must separate the sections"\n    assert lines[2] == "[1] First source." and lines[3] == "[2] Second source.", f"bad source lines: {lines[2]!r}, {lines[3]!r}"\n    assert lines[5] == "Question: test question?", f"bad question line: {lines[5]!r}"\n__check("build_prompt follows the exact format", t4)\n\ndef t5():\n    p = rag(DOCS, "how long does standard shipping take", k=1)\n    assert "Standard shipping takes five business days" in p, "the shipping knowledge must reach the prompt"\n    assert "password" not in p, "irrelevant chunks must not be stuffed into the prompt"\n    assert p.rstrip().endswith("Question: how long does standard shipping take")\n__check("end to end: the right knowledge reaches the prompt", t5)\n\ndef t6():\n    index = build_index(DOCS)\n    top2 = retrieve(index, "refund", 2)\n    q = embed("refund")\n    sims = [similarity(q, e["embedding"]) for e in top2]\n    assert sims[0] >= sims[1], "results must be ordered most-similar first"\n__check("retrieve orders results by descending similarity", t6)\n',
        hints: [
          'build_index is a one-line list comprehension: copy id and text, add embed(text).',
          'retrieve: embed the query once, then sorted(index, key=lambda e: similarity(q, e["embedding"]), reverse=True)[:k].',
          'build_prompt: collect lines in a list and "\\n".join them — match the format exactly, including both blank lines.',
          'rag is one line: build_prompt(query, retrieve(build_index(docs), query, k)).',
        ],
      },
    },
    {
      id: 'advanced-rag',
      title: 'Production RAG: Hybrid Search, Reranking & Evaluation',
      summary:
        'Demo RAG and production RAG are different sports. Production systems layer lexical + semantic hybrid search, cross-encoder reranking, metadata filtering, and — crucially — retrieval evaluation. Learn the upgrade path and how to measure whether each step actually helps.',
      objectives: [
        'Explain two-stage retrieval: fast recall (bi-encoder) then precise rerank (cross-encoder)',
        'Combine lexical and vector results (e.g., reciprocal rank fusion)',
        'Evaluate retrieval with recall@k / MRR on a labeled query set',
      ],
      resources: [
        {
          type: 'video',
          title: 'Advanced RAG: Hybrid Search, Chunking, and Reranking',
          url: 'https://www.youtube.com/watch?v=xG_NzXLditE',
          author: 'community deep-dive',
          duration: '~45 min',
          description: 'A hands-on tour of the production upgrade path this lesson covers.',
        },
        {
          type: 'article',
          title: 'Patterns for Building LLM-based Systems & Products',
          url: 'https://eugeneyan.com/writing/llm-patterns/',
          author: 'Eugene Yan',
          duration: '60 min',
          description: 'The definitive practitioner survey — RAG, evals, guardrails, caching. Bookmark it.',
        },
        {
          type: 'article',
          title: 'Rerankers and Two-Stage Retrieval',
          url: 'https://www.pinecone.io/learn/series/rag/rerankers/',
          author: 'Pinecone',
          duration: '25 min',
          description: 'Why a cross-encoder second stage lifts precision, with benchmarks.',
        },
        {
          type: 'article',
          title: 'Introducing Contextual Retrieval',
          url: 'https://www.anthropic.com/news/contextual-retrieval',
          author: 'Anthropic',
          duration: '20 min',
          description: 'Prepending chunk context before embedding — large retrieval gains, real numbers included.',
        },
      ],
      quiz: [
        {
          question: 'Two-stage retrieval (retrieve 100 with embeddings → rerank to top 5 with a cross-encoder) works because…',
          options: [
            'Bi-encoders are fast but coarse (vectors computed independently); cross-encoders read query and document *together* for accurate scoring but are too slow to run over the whole corpus',
            'Running any model twice always improves accuracy',
            'Cross-encoders are cheaper than bi-encoders',
            'The first stage removes duplicate documents',
          ],
          correct: 0,
          explanation:
            'Classic recall-then-precision funnel: cheap wide net, expensive careful selection — the same pattern as recommender systems. The cross-encoder sees token-level interaction between query and doc, which independent embeddings cannot capture.',
        },
        {
          question: 'Reciprocal Rank Fusion (RRF) is used to…',
          options: [
            'Merge ranked lists from different retrievers (BM25 + vector) into one ranking using only positions, no score calibration needed',
            'Compress embeddings into lower dimensions',
            'Train embedding models on ranking data',
            'Remove low-quality documents at ingestion',
          ],
          correct: 0,
          explanation:
            'BM25 scores and cosine similarities live on incomparable scales. RRF sidesteps calibration entirely: score = Σ 1/(k + rank) across lists. Simple, robust, and the default hybrid-merge in most stacks.',
        },
        {
          question: 'The right *first* metric suite for a RAG system is…',
          options: [
            'Retrieval recall@k on labeled (query → relevant chunk) pairs, separate from end-to-end answer quality',
            'GPU utilization',
            'Average response length',
            'User thumbs-up rate alone — it captures everything',
          ],
          correct: 0,
          explanation:
            'If recall@k is 60%, no prompt or model upgrade can save 40% of queries. Component metrics localize problems; end-to-end metrics (and user feedback) confirm overall health. You need both, but retrieval first.',
        },
        {
          question: 'Anthropic’s contextual retrieval prepends a short LLM-generated context to each chunk before embedding ("This chunk is from §3 of the 2024 refund policy…"). This helps because…',
          options: [
            'Isolated chunks lose document-level context ("the company", "this section") — restoring it makes embeddings disambiguate references and match queries better',
            'Longer chunks always embed better',
            'It reduces the number of chunks to store',
            'Embedding models require a minimum prefix length',
          ],
          correct: 0,
          explanation:
            'A chunk saying "the fee is waived in these cases" embeds poorly without knowing which fee, which product. Paying a one-time LLM cost at ingestion to contextualize chunks cut retrieval failures substantially in Anthropic’s benchmarks.',
        },
      ],
    },
  ],
};
