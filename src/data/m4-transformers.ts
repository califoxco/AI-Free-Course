import type { Module } from '../types';

export const m4: Module = {
  id: 'transformers',
  title: 'Transformers & LLM Internals',
  tagline: 'Tokenizers, attention, GPT from scratch, and how models are actually trained.',
  description:
    'The transformer is the architecture behind every frontier model. This module takes you from tokenization through attention to building GPT from scratch with Karpathy, then covers the full training pipeline (pretraining → instruction tuning → RLHF) and how inference actually works. After this, model behavior stops being mysterious.',
  lessons: [
    {
      id: 'tokenization',
      title: 'Tokenization & Embeddings',
      summary:
        'LLMs never see words — they see token IDs from a learned vocabulary, each mapped to an embedding vector. Tokenization explains many quirky LLM behaviors (bad spelling/arithmetic, why "strawberry" has trouble). Byte-Pair Encoding (BPE) is the algorithm behind nearly every modern tokenizer.',
      objectives: [
        'Explain BPE: iteratively merge the most frequent adjacent pair',
        'Connect tokenization to model failure modes (counting letters, arithmetic, rare languages)',
        'Describe what an embedding table is: a learned lookup from token ID to vector',
      ],
      resources: [
        {
          type: 'video',
          title: "Let's build the GPT Tokenizer",
          url: 'https://www.youtube.com/watch?v=zduSFxRajkE',
          author: 'Andrej Karpathy',
          duration: '2h 13min',
          description: 'BPE from scratch, plus a tour of every weird LLM behavior caused by tokenization.',
        },
        {
          type: 'article',
          title: 'The Illustrated Word2Vec',
          url: 'https://jalammar.github.io/illustrated-word2vec/',
          author: 'Jay Alammar',
          duration: '25 min',
          description: 'The classic visual intro to embeddings — words as vectors with meaningful geometry.',
        },
        {
          type: 'docs',
          title: 'Tiktokenizer playground',
          url: 'https://tiktokenizer.vercel.app/',
          author: 'community tool',
          duration: 'interactive',
          description: 'Paste text and watch it tokenize live. Try code, numbers, non-English text, and whitespace.',
        },
      ],
      quiz: [
        {
          question: 'Byte-Pair Encoding builds its vocabulary by…',
          options: [
            'Repeatedly finding the most frequent adjacent symbol pair and merging it into a new single token',
            'Splitting text on whitespace and keeping the most common words',
            'Hashing each character into a fixed-size table',
            'Asking an LLM to propose useful subwords',
          ],
          correct: 0,
          explanation:
            'Start from bytes/characters, count adjacent pairs, merge the winner into a new symbol, repeat for N merges. Frequent strings become single tokens; rare strings stay as multiple pieces.',
        },
        {
          question: 'Why do LLMs often miscount the letters in a word like "strawberry"?',
          options: [
            'The model sees token IDs, not characters — "strawberry" may be 1–3 opaque tokens, so it has no direct access to letters',
            'The attention mechanism cannot process fruit names',
            'Letter counting requires recurrence, which transformers lack',
            'Training data never contains letter counts',
          ],
          correct: 0,
          explanation:
            'Character-level questions force the model to recall sub-token structure it never directly observes. Same root cause as digit-by-digit arithmetic errors.',
        },
        {
          question: 'An embedding table for a 50,000-token vocabulary with d_model=768 is…',
          options: [
            'A learned 50,000 × 768 matrix; tokenizing then embedding means looking up rows by token ID',
            'A fixed (non-learned) hash function into 768 buckets',
            'A 768 × 768 attention matrix',
            'A compression codec for the training data',
          ],
          correct: 0,
          explanation:
            'One learned row per token. "Looking up" row i is the first operation of the forward pass — and these rows are trained by backprop like any other weight.',
        },
        {
          question: 'Languages poorly represented in training data tokenize into many more tokens per sentence. The practical consequences include…',
          options: [
            'Higher API cost, slower generation, and less effective context window for those languages',
            'No consequences — token count doesn’t affect anything',
            'The model refuses to process them',
            'Embeddings are not available for those tokens',
          ],
          correct: 0,
          explanation:
            'Cost and latency scale with token count, and the context window is a token budget. Inefficient tokenization literally taxes some languages 2–4× — a real product consideration.',
        },
      ],
      challenge: {
        title: 'BPE Merge Step',
        difficulty: 'Medium',
        connection:
          'Karpathy’s tokenizer video builds exactly these two functions: find the most frequent adjacent pair, merge it, repeat. Run your merge loop a few thousand rounds over real text and you have a GPT-style tokenizer. This is also the root cause of the "strawberry letter-counting" failures from the quiz.',
        description:
          'Implement the two core operations of Byte-Pair Encoding, as built in Karpathy\'s tokenizer video.\n\n`most_frequent_pair(ids)` — given a list of integer token IDs, return the adjacent pair (as a tuple) that occurs most often. Break ties by choosing the pair that appears earliest in the list. If the list has fewer than 2 elements, return `None`.\n\n`merge(ids, pair, new_id)` — return a new list where every non-overlapping occurrence of `pair` (scanning left to right) is replaced by `new_id`.',
        examples: [
          {
            input: 'most_frequent_pair([1, 2, 3, 1, 2])',
            output: '(1, 2)',
            explanation: '(1,2) appears twice; every other pair appears once.',
          },
          {
            input: 'merge([1, 2, 3, 1, 2], (1, 2), 99)',
            output: '[99, 3, 99]',
          },
        ],
        starterCode:
          'def most_frequent_pair(ids):\n    # Return the most common adjacent pair as a tuple.\n    # Tie-break: earliest first occurrence in the list. Return None if len(ids) < 2.\n    pass\n\n\ndef merge(ids, pair, new_id):\n    # Replace each non-overlapping occurrence of pair with new_id (left to right).\n    pass\n',
        solution:
          'def most_frequent_pair(ids):\n    if len(ids) < 2:\n        return None\n    counts = {}\n    for p in zip(ids, ids[1:]):\n        counts[p] = counts.get(p, 0) + 1\n    best = max(counts.values())\n    for p in zip(ids, ids[1:]):  # first occurrence order for tie-break\n        if counts[p] == best:\n            return p\n\n\ndef merge(ids, pair, new_id):\n    out, i = [], 0\n    while i < len(ids):\n        if i < len(ids) - 1 and (ids[i], ids[i + 1]) == tuple(pair):\n            out.append(new_id)\n            i += 2\n        else:\n            out.append(ids[i])\n            i += 1\n    return out\n',
        testCode:
          'def t1():\n    assert most_frequent_pair([1, 2, 3, 1, 2]) == (1, 2), f"got {most_frequent_pair([1,2,3,1,2])}"\n__check("finds the most frequent pair", t1)\n\ndef t2():\n    assert most_frequent_pair([5]) is None and most_frequent_pair([]) is None\n__check("returns None for lists shorter than 2", t2)\n\ndef t3():\n    assert most_frequent_pair([7, 8, 9, 7]) == (7, 8), "tie-break should pick earliest first occurrence"\n__check("tie-break: earliest first occurrence wins", t3)\n\ndef t4():\n    assert merge([1, 2, 3, 1, 2], (1, 2), 99) == [99, 3, 99]\n__check("merge replaces all occurrences", t4)\n\ndef t5():\n    assert merge([1, 1, 1], (1, 1), 9) == [9, 1], "non-overlapping, left to right: [1,1,1] -> [9,1]"\n__check("overlapping pairs merge left-to-right", t5)\n\ndef t6():\n    assert merge([4, 5, 6], (1, 2), 9) == [4, 5, 6]\n__check("merge with absent pair is a no-op", t6)\n\ndef t7():\n    ids = [104, 101, 108, 108, 111, 104, 101]  # "hellohe"\n    p = most_frequent_pair(ids)\n    assert p == (104, 101), f"(h,e) appears twice; got {p}"\n    merged = merge(ids, p, 256)\n    assert merged == [256, 108, 108, 111, 256]\n__check("one full BPE round on byte values", t7)\n',
        hints: [
          'zip(ids, ids[1:]) yields all adjacent pairs.',
          'For merge, walk an index manually: if ids[i:i+2] matches, append new_id and jump i by 2; else copy one element.',
          'For the tie-break, find the max count first, then scan pairs in order and return the first one with that count.',
        ],
      },
    },
    {
      id: 'attention',
      title: 'The Attention Mechanism',
      summary:
        'Attention lets every token gather information from every other token via learned queries, keys, and values — it replaced recurrence and made the transformer possible. Read the paper that started it all, absorb the visual explanations, then implement scaled dot-product attention yourself.',
      objectives: [
        'Explain Q, K, V and the formula softmax(QKᵀ/√d)V',
        'State why the √d scaling matters',
        'Describe causal masking and why decoders need it',
      ],
      resources: [
        {
          type: 'paper',
          title: 'Attention Is All You Need',
          url: 'https://arxiv.org/abs/1706.03762',
          author: 'Vaswani et al., 2017',
          duration: '11 pages',
          description: 'The transformer paper. Read §3 (architecture) carefully; skim the rest.',
        },
        {
          type: 'article',
          title: 'The Illustrated Transformer',
          url: 'https://jalammar.github.io/illustrated-transformer/',
          author: 'Jay Alammar',
          duration: '30 min',
          description: 'The most-read transformer explainer ever. Read before the paper to make it land.',
        },
        {
          type: 'video',
          title: 'Attention in transformers, visually explained',
          url: 'https://www.youtube.com/watch?v=eMlx5fFNoYc',
          author: '3Blue1Brown',
          duration: '26 min',
          description: 'Stunning animation of QKV attention. Watch "But what is a GPT?" first if you haven’t.',
        },
      ],
      quiz: [
        {
          question: 'In attention, the roles of Q, K, and V are best described as…',
          options: [
            'Q: what I’m looking for; K: what I contain (for matching); V: what I’ll hand over if matched',
            'Q: the input; K: the output; V: the loss',
            'Three copies of the same vector for redundancy',
            'Q and K are learned, V is the raw token embedding',
          ],
          correct: 0,
          explanation:
            'Each token emits all three (via learned projections). Score = q·k says how relevant token j is to token i; the output is a relevance-weighted sum of the v vectors.',
        },
        {
          question: 'Why divide QKᵀ by √d_k before the softmax?',
          options: [
            'Dot products grow with dimension; unscaled, the softmax saturates into near one-hot weights with tiny gradients',
            'To keep the result an integer',
            'To normalize the output to unit length',
            'It’s an arbitrary historical convention with no effect',
          ],
          correct: 0,
          explanation:
            'For random d-dim vectors, q·k has variance ∝ d. Dividing by √d keeps logits in a regime where softmax stays soft and gradients flow — the paper calls this scaled dot-product attention.',
        },
        {
          question: 'Causal (masked) attention in GPT-style decoders means…',
          options: [
            'Each position can only attend to itself and earlier positions — future tokens are masked to −∞ before the softmax',
            'Only the first token attends to anything',
            'Attention weights must be causal in the statistical sense',
            'The model attends only to tokens it generated, not the prompt',
          ],
          correct: 0,
          explanation:
            'Setting future scores to −∞ zeroes them after softmax. Without this, next-token prediction could cheat by peeking at the answer during training.',
        },
        {
          question: 'Why multiple attention heads instead of one big one?',
          options: [
            'Each head learns a different relationship type (syntax, coreference, position…) in its own subspace, then outputs are concatenated',
            'More heads always means a bigger context window',
            'One head would be too slow on GPUs',
            'Heads are redundant copies for fault tolerance',
          ],
          correct: 0,
          explanation:
            'Heads attend with independent learned projections in parallel. Interpretability work consistently finds specialized heads — e.g., heads tracking subject-verb agreement or copying repeated text.',
        },
        {
          question: 'Self-attention over a sequence of length n has compute/memory cost…',
          options: [
            'O(n²) — every token scores against every other token, which is why long context is expensive',
            'O(n) — linear like an RNN',
            'O(log n) — like a binary tree',
            'O(1) — independent of length',
          ],
          correct: 0,
          explanation:
            'QKᵀ is an n×n matrix. This quadratic cost drives a whole research area (FlashAttention, sliding windows, sparse/linear attention) and explains long-context pricing.',
        },
      ],
      challenge: {
        title: 'Scaled Dot-Product Attention',
        difficulty: 'Medium',
        connection:
          'The equation you just read in the paper — softmax(QKᵀ/√d)V — implemented line by line. The causal mask you add is the single line that makes GPT autoregressive. Once this function is yours, the transformer block diagram becomes plumbing around code you have written.',
        description:
          'Implement the equation at the heart of every LLM: `Attention(Q, K, V) = softmax(QKᵀ / √d_k) V`.\n\nWrite `attention(Q, K, V, causal=False)` where Q, K, V are NumPy arrays of shape `(seq_len, d)`.\n\nSteps: (1) scores = `Q @ K.T / sqrt(d)`. (2) If `causal`, set every score where the key position is *after* the query position to `-1e9` (so it softmaxes to ~0). (3) Apply softmax row-wise (each row of scores must be handled with the stable max-subtraction trick). (4) Return `weights @ V`.',
        examples: [
          {
            input: 'Q=K=V of shape (3, 4), causal=True',
            output: 'row 0 of the output equals V[0] exactly',
            explanation: 'Position 0 can only attend to itself.',
          },
        ],
        starterCode:
          'import numpy as np\n\ndef attention(Q, K, V, causal=False):\n    # Q, K, V: (seq_len, d) numpy arrays.\n    # Returns: (seq_len, d) output.\n    pass\n',
        solution:
          'import numpy as np\n\ndef attention(Q, K, V, causal=False):\n    d = Q.shape[-1]\n    scores = Q @ K.T / np.sqrt(d)\n    if causal:\n        n = scores.shape[0]\n        mask = np.triu(np.ones((n, n), dtype=bool), k=1)\n        scores = np.where(mask, -1e9, scores)\n    z = scores - scores.max(axis=-1, keepdims=True)\n    e = np.exp(z)\n    weights = e / e.sum(axis=-1, keepdims=True)\n    return weights @ V\n',
        testCode:
          'import numpy as np\n\ndef t1():\n    Q = np.zeros((3, 4))\n    K = np.random.RandomState(0).randn(3, 4)\n    V = np.array([[1.0, 0, 0, 0], [0, 1.0, 0, 0], [0, 0, 1.0, 0]])\n    out = attention(Q, K, V)\n    expected = V.mean(axis=0)\n    assert np.allclose(out[0], expected, atol=1e-6), f"zero queries -> uniform weights -> mean of V; got {out[0]}"\n__check("uniform attention when all scores are equal", t1)\n\ndef t2():\n    rng = np.random.RandomState(1)\n    Q, K, V = rng.randn(4, 8), rng.randn(4, 8), rng.randn(4, 8)\n    out = attention(Q, K, V, causal=True)\n    expected_row0 = V[0]\n    assert np.allclose(out[0], expected_row0, atol=1e-5), "with causal mask, position 0 attends only to itself"\n__check("causal: position 0 output equals V[0]", t2)\n\ndef t3():\n    rng = np.random.RandomState(2)\n    Q, K, V = rng.randn(5, 8), rng.randn(5, 8), rng.randn(5, 8)\n    V2 = V.copy(); V2[4] = 999.0  # mutate the LAST value vector\n    a = attention(Q, K, V, causal=True)\n    b = attention(Q, K, V2, causal=True)\n    assert np.allclose(a[:4], b[:4], atol=1e-5), "earlier positions must not see later values under causal mask"\n__check("causal: future tokens cannot leak backward", t3)\n\ndef t4():\n    rng = np.random.RandomState(3)\n    Q, K, V = rng.randn(4, 16), rng.randn(4, 16), rng.randn(4, 16)\n    out = attention(Q, K, V)\n    assert out.shape == (4, 16), f"expected (4,16), got {out.shape}"\n__check("output shape matches (seq_len, d)", t4)\n\ndef t5():\n    K = np.array([[10.0, 0.0], [0.0, 10.0]])\n    Q = np.array([[10.0, 0.0]])  # strongly matches key 0\n    V = np.array([[1.0, 2.0], [100.0, 200.0]])\n    out = attention(Q, K, V)\n    assert np.allclose(out[0], V[0], atol=1e-2), f"query matching key 0 should retrieve ~V[0]; got {out[0]}"\n__check("sharp attention retrieves the matching value", t5)\n\ndef t6():\n    Q = np.full((2, 4), 1000.0)\n    K = np.full((2, 4), 1000.0)\n    V = np.eye(2, 4)\n    out = attention(Q, K, V)\n    assert not np.any(np.isnan(out)), "softmax overflowed — subtract the row max before exp"\n__check("numerically stable softmax (no NaN on large scores)", t6)\n',
        packages: ['numpy'],
        hints: [
          'np.triu(np.ones((n, n), dtype=bool), k=1) is True exactly at future positions (j > i).',
          'Row-wise stable softmax: subtract scores.max(axis=-1, keepdims=True) before exp, then divide by sum(axis=-1, keepdims=True).',
          'keepdims=True is essential for broadcasting to work in both steps.',
        ],
      },
    },
    {
      id: 'build-gpt',
      title: 'Build GPT from Scratch',
      summary:
        'The capstone of LLM internals: follow Karpathy in building and training a small GPT character by character — token embeddings, positional embeddings, multi-head causal attention, MLP blocks, residuals, layernorm. After coding along, you will know exactly what the 175 billion parameters of GPT-3 are doing.',
      objectives: [
        'Assemble attention + MLP + residuals + layernorm into a transformer block',
        'Explain why position information must be injected explicitly',
        'Train a small language model end to end and sample from it',
      ],
      resources: [
        {
          type: 'video',
          title: "Let's build GPT: from scratch, in code, spelled out",
          url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
          author: 'Andrej Karpathy',
          duration: '1h 57min',
          description: 'The most-watched deep learning lecture in history. Code along — pause and type every line.',
        },
        {
          type: 'article',
          title: 'GPT in 60 Lines of NumPy',
          url: 'https://jaykmody.com/blog/gpt-from-scratch/',
          author: 'Jay Mody',
          duration: '45 min',
          description: 'A complete, runnable GPT-2 forward pass in NumPy. Perfect compact reference after the video.',
        },
        {
          type: 'article',
          title: 'nanoGPT repository',
          url: 'https://github.com/karpathy/nanoGPT',
          author: 'Andrej Karpathy',
          duration: 'code reading',
          description: 'The grown-up version: ~300 lines of model code that reproduces GPT-2. Read model.py.',
        },
        {
          type: 'paper',
          title: 'Language Models are Few-Shot Learners (GPT-3)',
          url: 'https://arxiv.org/abs/2005.14165',
          author: 'Brown et al., 2020',
          duration: 'read §1–3',
          description: 'Scale the architecture you just built to 175B and in-context learning emerges.',
        },
      ],
      quiz: [
        {
          question: 'Why do transformers need positional embeddings (or similar mechanisms like RoPE)?',
          options: [
            'Attention is permutation-invariant — without injected position info, "dog bites man" and "man bites dog" look identical',
            'To increase the vocabulary size',
            'Positions are needed to compute the loss',
            'They prevent overflow in the softmax',
          ],
          correct: 0,
          explanation:
            'Attention is a weighted sum over a *set* of tokens — order doesn’t exist unless you add it. Hence learned position embeddings (GPT-2), sinusoids (original paper), or rotary embeddings (modern models).',
        },
        {
          question: 'A standard transformer block consists of…',
          options: [
            'x + Attention(LayerNorm(x)), then x + MLP(LayerNorm(x)) — attention then feed-forward, each with a residual',
            'Attention only, repeated twice',
            'A convolution followed by max-pooling',
            'An encoder followed by a decoder in every block',
          ],
          correct: 0,
          explanation:
            'Two sub-layers per block: attention (tokens communicate) then MLP (each token computes independently). Karpathy summarizes: "attention is communication, MLP is computation."',
        },
        {
          question: 'GPT is trained on next-token prediction. At training time, how many predictions does one sequence of length n yield?',
          options: [
            'n predictions — every position predicts its next token in parallel, thanks to the causal mask',
            '1 prediction — only the final token',
            'n² predictions — one per token pair',
            'Zero during training; predictions only happen at inference',
          ],
          correct: 0,
          explanation:
            'The causal mask lets every position train simultaneously without seeing its own future. This parallelism over both batch and sequence is why transformers train so much faster than RNNs.',
        },
        {
          question: 'During text generation, GPT produces tokens…',
          options: [
            'Autoregressively — one at a time, each appended to the context for the next step',
            'All at once in a single forward pass',
            'In reverse order, then flipped',
            'By searching a database of training sentences',
          ],
          correct: 0,
          explanation:
            'Training is parallel, but generation is inherently sequential: sample a token, append, run again. This is why output length dominates latency — and why KV caching exists (next lesson).',
        },
      ],
    },
    {
      id: 'llm-training',
      title: 'How LLMs Are Trained: Pretraining → SFT → RLHF',
      summary:
        'A raw pretrained model is a document completer, not an assistant. This lesson covers the full pipeline that produces a chat model: internet-scale pretraining (governed by scaling laws), supervised fine-tuning on demonstrations, and preference optimization (RLHF/DPO) — plus the vocabulary to discuss it all credibly.',
      objectives: [
        'Describe the three training stages and what each contributes',
        'Explain scaling laws and the Chinchilla compute-optimal result at a high level',
        'Distinguish base models from instruct/chat models',
      ],
      resources: [
        {
          type: 'video',
          title: 'Deep Dive into LLMs like ChatGPT',
          url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI',
          author: 'Andrej Karpathy',
          duration: '3h 31min',
          description: 'The definitive end-to-end walkthrough: data, pretraining, SFT, RLHF, hallucinations. Worth every minute.',
        },
        {
          type: 'paper',
          title: 'Training language models to follow instructions (InstructGPT)',
          url: 'https://arxiv.org/abs/2203.02155',
          author: 'Ouyang et al., 2022',
          duration: 'read §1–3',
          description: 'The recipe that turned GPT-3 into ChatGPT: SFT + reward model + PPO.',
        },
        {
          type: 'paper',
          title: 'Training Compute-Optimal Large Language Models (Chinchilla)',
          url: 'https://arxiv.org/abs/2203.15556',
          author: 'Hoffmann et al., 2022',
          duration: 'skim §1, fig. 1–3',
          description: 'Why model size alone isn’t the answer — tokens matter as much as parameters.',
        },
        {
          type: 'paper',
          title: 'Constitutional AI: Harmlessness from AI Feedback',
          url: 'https://arxiv.org/abs/2212.08073',
          author: 'Bai et al. (Anthropic), 2022',
          duration: 'skim §1–2',
          description: 'Alignment via AI feedback against written principles — the technique behind Claude.',
        },
      ],
      quiz: [
        {
          question: 'What does a *base* (pretrained-only) model do when you type a question at it?',
          options: [
            'Continues the text like a document — it might answer, list more questions, or write a forum thread, because it was trained to predict the next token, not to assist',
            'Refuses to respond without a system prompt',
            'Always answers correctly but rudely',
            'Returns an error — base models can’t process questions',
          ],
          correct: 0,
          explanation:
            'Base models model the distribution of internet text. Assistant behavior (answering, following instructions, refusing harm) is sculpted in afterward by SFT and preference training.',
        },
        {
          question: 'In RLHF, the reward model is…',
          options: [
            'A separate model trained on human preference comparisons (A vs B), used to score outputs during RL optimization',
            'The pretrained model’s loss function',
            'A rule-based grammar checker',
            'A human rating every output in real time',
          ],
          correct: 0,
          explanation:
            'Humans can’t rate millions of RL samples, so their pairwise preferences train a reward model that scales the judgment. The policy then optimizes against that learned proxy (with a KL leash to stay close to the SFT model).',
        },
        {
          question: 'The Chinchilla result showed that many earlier LLMs were…',
          options: [
            'Undertrained for their size — for fixed compute, a smaller model on more tokens beats a bigger one on fewer (~20 tokens per parameter)',
            'Overtrained — they had seen too much data',
            'Too small to show emergent abilities',
            'Trained with the wrong optimizer',
          ],
          correct: 0,
          explanation:
            'Compute-optimal training balances parameters and data. This reshaped industry practice — and inference economics push even further toward smaller models trained on far more tokens (e.g., Llama-class models).',
        },
        {
          question: 'DPO (Direct Preference Optimization) differs from classic RLHF by…',
          options: [
            'Optimizing directly on preference pairs with a classification-style loss — no separate reward model or RL loop needed',
            'Using human feedback collected after deployment',
            'Replacing gradient descent with evolutionary search',
            'Only working on models under 1B parameters',
          ],
          correct: 0,
          explanation:
            'DPO (Rafailov et al., 2023) derives a loss that gets the same effect as RLHF’s reward-model-plus-PPO pipeline from preference pairs directly — far simpler to implement and now widely used.',
        },
        {
          question: 'Why do LLMs hallucinate plausible-sounding falsehoods?',
          options: [
            'Training optimizes next-token plausibility, so a confident-sounding completion is rewarded even when no grounded fact backs it',
            'Their training data contains only fiction',
            'Hallucination is deliberately added for creativity',
            'Floating point errors corrupt their knowledge',
          ],
          correct: 0,
          explanation:
            'The pretraining objective rewards what *looks* like the training distribution. Saying "I don’t know" is rare in confident internet prose, so models must be explicitly post-trained toward calibrated refusals — and grounding (RAG, tools) helps fill the gap.',
        },
      ],
    },
    {
      id: 'inference-sampling',
      title: 'Inference & Sampling: Temperature, Top-k/p, KV Cache',
      summary:
        'Every API parameter you will ever tune — temperature, top_p, max_tokens — is a decoding-time choice about how to pick from the model’s next-token distribution. Plus the systems side: why the KV cache exists, why output tokens cost more than input tokens, and what actually drives latency.',
      objectives: [
        'Implement temperature scaling and top-k/top-p filtering',
        'Predict the effect of sampling parameters on output behavior',
        'Explain the KV cache and prefill vs decode phases',
      ],
      resources: [
        {
          type: 'article',
          title: 'How to generate text: decoding methods for language models',
          url: 'https://huggingface.co/blog/how-to-generate',
          author: 'Hugging Face',
          duration: '25 min',
          description: 'Greedy, beam search, top-k, top-p with code and intuition. The canonical reference.',
        },
        {
          type: 'video',
          title: 'Intro to Large Language Models',
          url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
          author: 'Andrej Karpathy',
          duration: '60 min',
          description: 'The famous "busy person’s intro" — inference, scaling, jailbreaks, and the LLM-as-OS analogy.',
        },
        {
          type: 'article',
          title: 'Transformer Inference Arithmetic',
          url: 'https://kipp.ly/transformer-inference-arithmetic/',
          author: 'Kipply',
          duration: '40 min',
          description: 'Back-of-envelope math for latency and memory: KV cache sizes, bandwidth limits. Advanced but eye-opening.',
        },
      ],
      quiz: [
        {
          question: 'Temperature 0 (or greedy decoding) means…',
          options: [
            'Always pick the highest-probability token — deterministic-ish, focused, but can be repetitive',
            'The model picks tokens uniformly at random',
            'Generation stops immediately',
            'The model thinks for longer before answering',
          ],
          correct: 0,
          explanation:
            'Temperature divides the logits before softmax; as T→0 the distribution collapses onto the argmax. Higher T flattens it: more diversity, more risk of derailing.',
        },
        {
          question: 'Top-p (nucleus) sampling with p=0.9 means…',
          options: [
            'Sample only from the smallest set of tokens whose cumulative probability exceeds 0.9',
            'Keep exactly the top 90 tokens',
            'Each token needs at least 0.9 probability to be chosen',
            'Use 90% of the model’s layers',
          ],
          correct: 0,
          explanation:
            'The candidate set adapts to the distribution’s shape: when the model is confident the nucleus may be 2 tokens; when uncertain, hundreds. That adaptivity is its advantage over fixed top-k.',
        },
        {
          question: 'What does the KV cache store, and what does it buy you?',
          options: [
            'The key and value vectors of all previous tokens, so each new token only computes attention against cached entries instead of re-processing the whole sequence',
            'The model weights compressed for faster loading',
            'Previously generated full responses for reuse across users',
            'The tokenizer vocabulary in GPU memory',
          ],
          correct: 0,
          explanation:
            'Without the cache, generating token n re-runs the full forward pass over all n−1 previous tokens. With it, each step is O(n) attention against cached K/V. Cost: significant GPU memory per sequence — the central constraint of serving.',
        },
        {
          question: 'Why is the time-to-first-token (prefill) phase fast per-token relative to the rest of generation (decode)?',
          options: [
            'Prefill processes all prompt tokens in parallel (compute-bound); decode emits one token at a time, bottlenecked by reading weights from memory each step',
            'The prompt is cached on the API provider’s CDN',
            'Prefill skips the attention layers',
            'It isn’t — first tokens are always slowest',
          ],
          correct: 0,
          explanation:
            'Prefill is one big parallel pass — GPUs love it. Decode is sequential and memory-bandwidth-bound. This is why input tokens are cheaper than output tokens on every API price sheet.',
        },
      ],
      challenge: {
        title: 'Temperature & Top-k Sampling',
        difficulty: 'Medium',
        connection:
          'Every API’s `temperature` and `top_k` parameters are literally these two functions applied to the model’s output logits. After implementing them you will know exactly what you are tuning when you set temperature in the next module — and why temp=0 makes output (nearly) deterministic.',
        description:
          'Implement the two most common decoding controls, operating on raw logits.\n\n`apply_temperature(logits, temp)` — divide logits by `temp`, then apply stable softmax and return the probability array. For `temp <= 0`, return a one-hot array on the argmax (greedy).\n\n`top_k_probs(logits, k)` — keep only the k highest logits, convert them to probabilities with softmax, and return a full-size array where non-top-k positions are exactly 0.0 and the kept entries sum to 1.',
        examples: [
          {
            input: 'apply_temperature(np.array([1.0, 2.0, 3.0]), 0.5)',
            output: 'sharper than softmax([1,2,3]) — top token gains probability',
          },
          {
            input: 'top_k_probs(np.array([1.0, 3.0, 2.0, 0.5]), 2)',
            output: '[0.0, 0.731, 0.269, 0.0]',
            explanation: 'Only indices 1 and 2 survive; their probs renormalize.',
          },
        ],
        starterCode:
          'import numpy as np\n\ndef apply_temperature(logits, temp):\n    # Return softmax(logits / temp). For temp <= 0, return one-hot argmax.\n    pass\n\n\ndef top_k_probs(logits, k):\n    # Zero out everything except the k highest logits, softmax over the survivors,\n    # and return a full-size probability array.\n    pass\n',
        solution:
          'import numpy as np\n\ndef _softmax(x):\n    z = x - np.max(x)\n    e = np.exp(z)\n    return e / e.sum()\n\n\ndef apply_temperature(logits, temp):\n    if temp <= 0:\n        out = np.zeros_like(logits, dtype=float)\n        out[np.argmax(logits)] = 1.0\n        return out\n    return _softmax(np.asarray(logits, dtype=float) / temp)\n\n\ndef top_k_probs(logits, k):\n    logits = np.asarray(logits, dtype=float)\n    keep = np.argsort(logits)[-k:]\n    probs = np.zeros_like(logits)\n    probs[keep] = _softmax(logits[keep])\n    return probs\n',
        testCode:
          'import numpy as np\n\ndef t1():\n    p = apply_temperature(np.array([1.0, 2.0, 3.0]), 1.0)\n    expected = np.array([0.09003057, 0.24472847, 0.66524096])\n    assert np.allclose(p, expected, atol=1e-6), f"temp=1 should equal plain softmax; got {p}"\n__check("temp=1.0 is plain softmax", t1)\n\ndef t2():\n    base = apply_temperature(np.array([1.0, 2.0, 3.0]), 1.0)\n    sharp = apply_temperature(np.array([1.0, 2.0, 3.0]), 0.5)\n    assert sharp[2] > base[2], "lower temperature must concentrate probability on the top token"\n__check("low temperature sharpens the distribution", t2)\n\ndef t3():\n    flat = apply_temperature(np.array([1.0, 2.0, 3.0]), 100.0)\n    assert np.all(np.abs(flat - 1 / 3) < 0.01), f"very high temp should be near uniform; got {flat}"\n__check("high temperature flattens toward uniform", t3)\n\ndef t4():\n    p = apply_temperature(np.array([1.0, 5.0, 3.0]), 0)\n    assert np.array_equal(p, np.array([0.0, 1.0, 0.0])), f"temp=0 -> one-hot argmax; got {p}"\n__check("temp=0 is greedy one-hot", t4)\n\ndef t5():\n    p = top_k_probs(np.array([1.0, 3.0, 2.0, 0.5]), 2)\n    assert p[0] == 0.0 and p[3] == 0.0, "non-top-k entries must be exactly 0"\n    assert abs(p.sum() - 1.0) < 1e-9, f"must renormalize to 1; sums to {p.sum()}"\n    assert p[1] > p[2], "higher logit keeps higher probability"\n__check("top-k keeps 2 tokens and renormalizes", t5)\n\ndef t6():\n    logits = np.array([4.0, 1.0, 2.0, 3.0])\n    p = top_k_probs(logits, 4)\n    z = logits - logits.max(); e = np.exp(z)\n    assert np.allclose(p, e / e.sum(), atol=1e-9), "k = vocab size should equal plain softmax"\n__check("top-k with k=n is plain softmax", t6)\n',
        packages: ['numpy'],
        hints: [
          'np.argsort(logits)[-k:] gives the indices of the k largest logits.',
          'Build a zeros array and fill only the kept indices with softmax over the kept logits.',
          'For temp=0, np.argmax + a one-hot avoids dividing by zero.',
        ],
      },
    },
  ],
};
