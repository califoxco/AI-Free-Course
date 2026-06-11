import type { Module } from '../types';

export const m8: Module = {
  id: 'finetuning',
  title: 'Fine-tuning & Model Customization',
  tagline: 'LoRA, quantization, preference tuning — and the judgment of when not to.',
  description:
    'Sometimes prompting isn’t enough: you need a model that consistently speaks your format, your domain, your tone — or a small model that punches above its cost class. This module covers the decision framework (fine-tune vs RAG vs prompt), the techniques that make tuning affordable (LoRA, QLoRA), and preference optimization. Equally important: recognizing when fine-tuning is the wrong tool.',
  lessons: [
    {
      id: 'when-to-finetune',
      title: 'The Decision: Prompt vs RAG vs Fine-tune',
      summary:
        'The most expensive mistake in applied AI is fine-tuning when a better prompt would do. Build the decision framework: prompting for capability the model already has, RAG for knowledge, fine-tuning for *behavior* — format consistency, style, domain dialect, or distilling a frontier model into a cheap one.',
      objectives: [
        'Apply the prompt → RAG → fine-tune escalation ladder',
        'List valid fine-tuning use cases (format, style, distillation, latency/cost) vs invalid ones (fresh facts)',
        'Estimate the real costs: data curation, training, evaluation, maintenance',
      ],
      resources: [
        {
          type: 'article',
          title: 'Fine-tuning vs RAG vs prompt engineering (To fine-tune or not to fine-tune)',
          url: 'https://huyenchip.com/2023/04/11/llm-engineering.html#part_3_prompt_tuning_vs_finetuning_vs_alternatives',
          author: 'Chip Huyen',
          duration: '20 min',
          description: 'The decision framework section of the production LLM essay.',
        },
        {
          type: 'docs',
          title: 'OpenAI fine-tuning guide: when to use it',
          url: 'https://platform.openai.com/docs/guides/fine-tuning',
          author: 'OpenAI',
          duration: '25 min',
          description: 'Note their own advice: try prompting and few-shot first. The use-case list is the valuable part.',
        },
        {
          type: 'video',
          title: 'Finetuning Large Language Models (short course)',
          url: 'https://www.deeplearning.ai/short-courses/finetuning-large-language-models/',
          author: 'DeepLearning.AI',
          duration: '~1h, free',
          description: 'Hands-on walkthrough of the full fine-tuning workflow on open models.',
        },
      ],
      quiz: [
        {
          question: 'Your bot must answer questions about products launched last week. Fine-tuning is the wrong tool because…',
          options: [
            'Knowledge in weights is stale on arrival and expensive to refresh — retrieval handles changing facts; fine-tuning is for behavior',
            'Fine-tuning cannot affect what a model says',
            'New products are too complex for any model',
            'Fine-tuning only works on images',
          ],
          correct: 0,
          explanation:
            'You’d retrain weekly, forever, with no citations and uncertain recall. The heuristic: facts → RAG; behavior/format/style → fine-tune; both → both.',
        },
        {
          question: 'A genuinely good fine-tuning use case among these is…',
          options: [
            'Distillation: training a small cheap model on a frontier model’s outputs for one narrow task, cutting cost 10–50× at similar task quality',
            'Teaching the model your company’s org chart',
            'Fixing one specific bad answer the CEO noticed',
            'Making the model aware of today’s date',
          ],
          correct: 0,
          explanation:
            'Narrow-task distillation is the classic win: an 8B model fine-tuned on 10k frontier-labeled examples often matches the teacher on that task. The others are retrieval/prompt problems (and one bad answer is an eval case, not a training run).',
        },
        {
          question: 'The usually-underestimated cost of fine-tuning in practice is…',
          options: [
            'Curating and maintaining high-quality training data, plus regression-evaluating every new base model release',
            'The GPU bill for training runs',
            'The disk space for storing adapters',
            'API fees for inference',
          ],
          correct: 0,
          explanation:
            'Compute is cheap and getting cheaper; a clean, representative, deduplicated dataset is weeks of work. And when the next base model drops, your tuned model needs re-evaluation — possibly retraining. Data and evals are the real product.',
        },
      ],
    },
    {
      id: 'lora-peft',
      title: 'LoRA & Parameter-Efficient Fine-Tuning',
      summary:
        'Full fine-tuning of a 70B model needs a GPU cluster; LoRA needs a gaming card. The trick: freeze the weights, learn tiny low-rank update matrices (W + BA) that capture the adaptation. Add quantization (QLoRA) and fine-tuning becomes accessible to everyone. Implement the LoRA forward pass to see how simple it really is.',
      objectives: [
        'Explain the low-rank decomposition: ΔW = B·A with rank r ≪ d',
        'Calculate the parameter savings for a given layer and rank',
        'Describe QLoRA (4-bit base + LoRA) and adapter deployment (swap/merge)',
      ],
      resources: [
        {
          type: 'video',
          title: 'What is Low-Rank Adaptation (LoRA)? — explained by the inventor',
          url: 'https://www.youtube.com/watch?v=DhRoTONcyZE',
          author: 'Edward Hu',
          duration: '20 min',
          description: 'The author of the LoRA paper explains his own technique. Watch before reading.',
        },
        {
          type: 'paper',
          title: 'LoRA: Low-Rank Adaptation of Large Language Models',
          url: 'https://arxiv.org/abs/2106.09685',
          author: 'Hu et al., 2021',
          duration: 'read §1–4',
          description: 'Remarkably readable. The method is two matrices and one scaling factor.',
        },
        {
          type: 'paper',
          title: 'QLoRA: Efficient Finetuning of Quantized LLMs',
          url: 'https://arxiv.org/abs/2305.14314',
          author: 'Dettmers et al., 2023',
          duration: 'skim §1–3',
          description: '4-bit quantization + LoRA = 65B fine-tuning on one 48GB GPU.',
        },
        {
          type: 'docs',
          title: 'Hugging Face PEFT documentation',
          url: 'https://huggingface.co/docs/peft/index',
          author: 'Hugging Face',
          duration: '30 min + hands-on',
          description: 'The library you’ll actually use: LoRA configs, adapter loading, merging.',
        },
      ],
      quiz: [
        {
          question: 'A 4096×4096 weight matrix is adapted with LoRA at rank r=8. The trainable parameter count for this layer goes from ~16.8M to…',
          options: [
            '~65.5k (4096×8 + 8×4096) — about 0.4% of the original',
            '~8.4M — half the original',
            'Exactly 8 parameters',
            '~16.8M — LoRA doesn’t change parameter count',
          ],
          correct: 0,
          explanation:
            'A is r×d, B is d×r: 2·4096·8 = 65,536 trainable values while W stays frozen. Across a whole model LoRA typically trains 0.1–1% of parameters — that’s the entire memory/compute win.',
        },
        {
          question: 'Why is initializing B to zeros (so BA = 0) important in LoRA?',
          options: [
            'Training starts exactly at the pretrained model’s behavior — the adaptation grows from zero instead of starting with random damage',
            'Zero matrices use no memory',
            'It makes the model deterministic',
            'B must be zero for the math to be invertible',
          ],
          correct: 0,
          explanation:
            'With ΔW = 0 at step one, the model is initially unchanged, and gradient descent carves only the needed adaptation. Random init for both A and B would start by corrupting the pretrained function.',
        },
        {
          question: 'A deployment advantage unique to adapters (vs full fine-tunes) is…',
          options: [
            'Many per-customer adapters can share one loaded base model, swapped in cheaply — instead of serving N full model copies',
            'Adapters eliminate the need for GPUs at inference',
            'Adapters cannot overfit',
            'Adapters automatically update with new base models',
          ],
          correct: 0,
          explanation:
            'A LoRA adapter is megabytes. Multi-tenant serving with hot-swappable (or batched, e.g. S-LoRA) adapters over one base model transforms the economics of customized deployments.',
        },
        {
          question: 'QLoRA’s headline contribution is…',
          options: [
            'Fine-tuning on top of a 4-bit-quantized frozen base model with LoRA adapters in higher precision — slashing memory with minimal quality loss',
            'Quantizing the gradients to 1 bit',
            'A new attention mechanism',
            'Training without any labeled data',
          ],
          correct: 0,
          explanation:
            'The frozen base, which dominates memory, is stored in 4-bit NF4; the small trainable adapters stay in bf16. This dropped 65B fine-tuning from a cluster to a single workstation card.',
        },
      ],
      challenge: {
        title: 'LoRA Forward Pass',
        difficulty: 'Medium',
        connection:
          'This is equation (3) from the paper you just read, as code: W stays frozen, B@A is the small trainable detour, alpha/r scales its contribution. The zero-init test demonstrates the paper’s key design decision (training starts exactly at the pretrained model), and count_lora_params shows the ~99.6% parameter saving that makes fine-tuning affordable on one GPU.',
        description:
          'Implement the LoRA-adapted linear layer — the actual equation from the paper.\n\nWrite `lora_forward(W, A, B, x, alpha)` computing `y = W @ x + (alpha / r) * (B @ (A @ x))` where:\n\n- `W` is the frozen weight matrix, shape `(d_out, d_in)`\n- `A` is the down-projection, shape `(r, d_in)`\n- `B` is the up-projection, shape `(d_out, r)`\n- `x` is the input vector, shape `(d_in,)`\n- `r = A.shape[0]` is the rank, and `alpha / r` is the standard LoRA scaling\n\nAlso write `count_lora_params(d_in, d_out, r)` returning the number of trainable parameters (the elements of A and B).',
        examples: [
          {
            input: 'B initialized to zeros',
            output: 'lora_forward(...) == W @ x exactly',
            explanation: 'The zero-init property: adaptation starts as identity.',
          },
          { input: 'count_lora_params(4096, 4096, 8)', output: '65536' },
        ],
        starterCode:
          'import numpy as np\n\ndef lora_forward(W, A, B, x, alpha):\n    # y = W @ x + (alpha / r) * (B @ (A @ x)),  r = A.shape[0]\n    pass\n\n\ndef count_lora_params(d_in, d_out, r):\n    # Trainable params: elements of A (r x d_in) plus B (d_out x r)\n    pass\n',
        solution:
          'import numpy as np\n\ndef lora_forward(W, A, B, x, alpha):\n    r = A.shape[0]\n    return W @ x + (alpha / r) * (B @ (A @ x))\n\n\ndef count_lora_params(d_in, d_out, r):\n    return r * d_in + d_out * r\n',
        testCode:
          'import numpy as np\n\ndef t1():\n    rng = np.random.RandomState(0)\n    W = rng.randn(6, 4); x = rng.randn(4)\n    A = rng.randn(2, 4); B = np.zeros((6, 2))\n    out = lora_forward(W, A, B, x, alpha=16)\n    assert np.allclose(out, W @ x), "with B=0 the output must equal the frozen layer exactly"\n__check("zero-init B leaves the model unchanged", t1)\n\ndef t2():\n    W = np.zeros((2, 2))\n    A = np.array([[1.0, 0.0]])      # r=1, d_in=2\n    B = np.array([[2.0], [0.0]])    # d_out=2, r=1\n    x = np.array([3.0, 5.0])\n    out = lora_forward(W, A, B, x, alpha=1)\n    # (alpha/r)=1; A@x = [3]; B@[3] = [6, 0]\n    assert np.allclose(out, [6.0, 0.0]), f"got {out}"\n__check("low-rank path computes (alpha/r) * B @ A @ x", t2)\n\ndef t3():\n    W = np.zeros((2, 2))\n    A = np.ones((2, 2)); B = np.ones((2, 2)); x = np.array([1.0, 1.0])\n    out8 = lora_forward(W, A, B, x, alpha=8)\n    out16 = lora_forward(W, A, B, x, alpha=16)\n    assert np.allclose(out16, 2 * out8), "scaling must be linear in alpha (divided by r)"\n__check("alpha/r scaling applied correctly", t3)\n\ndef t4():\n    assert count_lora_params(4096, 4096, 8) == 65536, f"got {count_lora_params(4096, 4096, 8)}"\n    assert count_lora_params(768, 768, 4) == 6144\n__check("trainable parameter count", t4)\n\ndef t5():\n    full = 4096 * 4096\n    lora = count_lora_params(4096, 4096, 8)\n    assert lora / full < 0.005, "LoRA should train <0.5% of the layer’s parameters"\n__check("sanity: LoRA is a tiny fraction of full fine-tuning", t5)\n',
        packages: ['numpy'],
        hints: [
          'Watch the order: A @ x first (down to rank r), then B @ result (up to d_out).',
          'The scaling factor is alpha divided by the rank, applied to the low-rank path only.',
        ],
      },
    },
    {
      id: 'alignment',
      title: 'Preference Optimization: RLHF, DPO & Alignment',
      summary:
        'How do you train "be helpful, don’t make things up, refuse harmful requests" when there’s no loss function for it? Answer: learn from human (or AI) preferences. Go deeper than Module 4’s overview: reward models, the KL-leash, DPO’s simplification, Constitutional AI — and the practical knowledge of how alignment shapes the models you build on.',
      objectives: [
        'Explain the full RLHF pipeline and the role of the KL penalty',
        'Contrast PPO-based RLHF with DPO',
        'Describe Constitutional AI / RLAIF and why preference data is the bottleneck',
      ],
      resources: [
        {
          type: 'video',
          title: 'Reinforcement Learning with Human Feedback (RLHF), Clearly Explained!!!',
          url: 'https://www.youtube.com/watch?v=qPN_XZcJf_s',
          author: 'StatQuest',
          duration: '20 min',
          description: 'The full RLHF pipeline in StatQuest style — reward models, comparisons, and the RL step.',
        },
        {
          type: 'paper',
          title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
          url: 'https://arxiv.org/abs/2305.18290',
          author: 'Rafailov et al., 2023',
          duration: 'read §1–4',
          description: 'The elegant insight that collapsed the RLHF pipeline into a single loss.',
        },
        {
          type: 'article',
          title: 'Illustrating Reinforcement Learning from Human Feedback',
          url: 'https://huggingface.co/blog/rlhf',
          author: 'Hugging Face',
          duration: '30 min',
          description: 'The visual walkthrough of the three-stage RLHF pipeline.',
        },
        {
          type: 'paper',
          title: 'Constitutional AI: Harmlessness from AI Feedback',
          url: 'https://arxiv.org/abs/2212.08073',
          author: 'Bai et al. (Anthropic), 2022',
          duration: 'read §1–3',
          description: 'Scaling alignment with AI feedback guided by explicit written principles.',
        },
      ],
      quiz: [
        {
          question: 'The KL-divergence penalty in RLHF keeps the policy close to the SFT model because…',
          options: [
            'Unconstrained optimization against a learned reward model gets exploited — the policy finds degenerate outputs the reward model wrongly scores high (reward hacking)',
            'KL divergence speeds up training',
            'The API requires bounded weight changes',
            'It prevents the model from learning anything new',
          ],
          correct: 0,
          explanation:
            'The reward model is an imperfect proxy. Push too hard and you get gibberish that games it. The KL leash bounds how far generation can drift from the (sensible) SFT distribution while reward improves.',
        },
        {
          question: 'DPO removes the need for a separate reward model by…',
          options: [
            'Deriving a closed-form loss on preference pairs directly — the language model’s own logits implicitly define the reward',
            'Having humans write the gradients',
            'Using a larger SFT dataset instead of preferences',
            'Sampling many outputs and keeping the longest',
          ],
          correct: 0,
          explanation:
            'The paper’s title is the insight: under the RLHF objective, the optimal policy and reward are mathematically linked, so you can optimize preferences as a classification-style loss on (chosen, rejected) pairs. No RL loop, far less infrastructure.',
        },
        {
          question: 'Constitutional AI reduces dependence on human labelers by…',
          options: [
            'Having the model critique and revise its own outputs against written principles, and using AI preference judgments (RLAIF) for harmlessness training',
            'Eliminating the need for any feedback signal',
            'Crowdsourcing labels from end users without consent',
            'Hard-coding refusal rules into the decoder',
          ],
          correct: 0,
          explanation:
            'Humans write the constitution (the principles); AI applies it at scale to generate critiques, revisions, and preference labels. This made harmlessness training scalable and more transparent about its criteria.',
        },
        {
          question: 'As an engineer building on aligned chat models, preference training explains why…',
          options: [
            'Models exhibit consistent stylistic tendencies (hedging, structured answers, refusal patterns) that prompting can shape but not fully override',
            'Models cannot output JSON',
            'Temperature has no effect on aligned models',
            'Context windows are limited to 8k tokens',
          ],
          correct: 0,
          explanation:
            'Much of a model’s "personality" — verbosity, caution, formatting habits — comes from what raters rewarded. Knowing behavior lives in post-training (not just prompts) helps you set realistic expectations for prompt engineering vs needing a different model or fine-tune.',
        },
      ],
    },
  ],
};
