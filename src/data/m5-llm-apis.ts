import type { Module } from '../types';

export const m5: Module = {
  id: 'llm-apis',
  title: 'Working with LLMs: APIs, Prompting & Tool Use',
  tagline: 'The day-job skills: prompts, structured output, function calling, and cost control.',
  description:
    'This is where AI engineering becomes your actual job. Most AI products are built on top of frontier model APIs — so mastering the chat interface, prompt engineering as a real discipline, structured outputs, and tool calling delivers immediate value. Everything here applies to Claude, GPT, Gemini, and open models alike.',
  lessons: [
    {
      id: 'api-fundamentals',
      title: 'LLM API Fundamentals',
      summary:
        'Under every chat app is the same call: a list of role-tagged messages in, a completion out, billed by token. Learn the anatomy — system/user/assistant roles, max_tokens, stop sequences, streaming — and the statelessness that surprises everyone: the model remembers nothing; you resend the conversation every time.',
      objectives: [
        'Construct a messages array with system/user/assistant roles',
        'Explain API statelessness and what "context" actually is',
        'Use streaming and understand token-based pricing',
      ],
      resources: [
        {
          type: 'video',
          title: 'OpenAI with Python: A Step-by-Step Guide for Beginners',
          url: 'https://www.youtube.com/watch?v=-A7njXsJl5M',
          author: 'community tutorial',
          duration: '~30 min',
          description: 'Watch one full walkthrough of messages, roles, and parameters in code before reading the docs.',
        },
        {
          type: 'docs',
          title: 'Anthropic API: Getting started & Messages',
          url: 'https://docs.anthropic.com/en/api/getting-started',
          author: 'Anthropic',
          duration: '30 min',
          description: 'The Messages API — roles, system prompts, streaming, vision.',
        },
        {
          type: 'docs',
          title: 'OpenAI API: Text generation guide',
          url: 'https://platform.openai.com/docs/guides/text-generation',
          author: 'OpenAI',
          duration: '30 min',
          description: 'Same concepts, second dialect. Knowing both makes the shared abstraction obvious.',
        },
        {
          type: 'course',
          title: 'Building Systems with the ChatGPT API',
          url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/',
          author: 'DeepLearning.AI',
          duration: '~1.5h, free',
          description: 'Short hands-on course: chaining calls, classification, moderation, evaluation.',
        },
      ],
      quiz: [
        {
          question: 'LLM chat APIs are stateless. What does this mean in practice?',
          options: [
            'The model retains nothing between calls — your application must resend whatever history it wants the model to "remember"',
            'The API cannot handle multi-turn conversations',
            'Responses are cached and identical for identical prompts',
            'You can only send one message per session',
          ],
          correct: 0,
          explanation:
            '"Memory" in chat products is an application-layer illusion: the client accumulates messages and sends the full transcript each turn. This is why long conversations get slower and more expensive.',
        },
        {
          question: 'The system prompt is best used for…',
          options: [
            'Persistent instructions defining the assistant’s role, constraints, and output conventions — separate from user input',
            'The user’s most recent question',
            'Authentication credentials',
            'Storing the model’s previous answers',
          ],
          correct: 0,
          explanation:
            'System prompts set durable behavior and are (by training) weighted as more authoritative than user turns. Keeping instructions out of user content also reduces prompt-injection surface.',
        },
        {
          question: 'Your response gets cut off mid-sentence. The most likely cause is…',
          options: [
            'You hit the max_tokens limit you set on the request',
            'The model got bored',
            'Your prompt contained a stop sequence',
            'The temperature was too low',
          ],
          correct: 0,
          explanation:
            'Check the stop/finish reason on the response: "max_tokens" means truncation. Either raise the limit or design for continuation. (A matched stop sequence is possible but you would have set it yourself.)',
        },
        {
          question: 'Why does virtually every chat product use streaming?',
          options: [
            'Perceived latency: users see tokens immediately instead of waiting the full generation time, even though total time is similar',
            'Streaming reduces the per-token price',
            'Streaming improves the model’s accuracy',
            'Non-streaming APIs are deprecated',
          ],
          correct: 0,
          explanation:
            'Generation takes the same time either way, but time-to-first-token is a fraction of time-to-last-token. Streaming converts a 20-second wait into instant feedback — a pure UX win.',
        },
      ],
    },
    {
      id: 'prompt-engineering',
      title: 'Prompt Engineering as an Engineering Discipline',
      summary:
        'Prompting is not magic incantations — it is interface design backed by empirical iteration. Learn the techniques with measured impact: clear structure, few-shot examples, chain-of-thought, role definition, and output formatting. Treat prompts like code: versioned, tested, and evaluated.',
      objectives: [
        'Apply the core techniques: specificity, examples, structure (XML/markdown), CoT',
        'Explain why few-shot examples and "think step by step" work',
        'Adopt the iterate-and-evaluate workflow instead of one-shot guessing',
      ],
      resources: [
        {
          type: 'video',
          title: 'AI prompt engineering: A deep dive',
          url: 'https://www.youtube.com/watch?v=T9aRN5JkmL8',
          author: 'Anthropic (Amanda Askell, Alex Albert, David Hershey)',
          duration: '76 min',
          description: 'Anthropic’s own prompt experts on what actually works — the best prompting discussion on the internet.',
        },
        {
          type: 'docs',
          title: 'Prompt Engineering Guide',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
          author: 'Anthropic',
          duration: '1h',
          description: 'The full playbook: clarity, examples, XML structure, chaining, long-context tips.',
        },
        {
          type: 'paper',
          title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
          url: 'https://arxiv.org/abs/2201.11903',
          author: 'Wei et al., 2022',
          duration: 'read §1–3',
          description: 'The paper that showed "show your work" prompting unlocks reasoning at scale.',
        },
        {
          type: 'article',
          title: 'Prompt Engineering',
          url: 'https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/',
          author: 'Lilian Weng',
          duration: '45 min',
          description: 'A rigorous survey connecting prompting techniques to the research behind them.',
        },
        {
          type: 'docs',
          title: 'Anthropic Prompt Library & Workbench',
          url: 'https://docs.anthropic.com/en/resources/prompt-library/library',
          author: 'Anthropic',
          duration: 'browse',
          description: 'Production-grade example prompts to steal patterns from.',
        },
      ],
      quiz: [
        {
          question: 'Why does chain-of-thought prompting improve performance on math and logic tasks?',
          options: [
            'Each generated reasoning token gives the model more sequential computation, and intermediate steps condition later ones — the model cannot "think silently" before token one',
            'It increases the model’s parameter count at inference time',
            'It disables sampling randomness',
            'Models are trained to detect the phrase "step by step" as an accuracy command',
          ],
          correct: 0,
          explanation:
            'A transformer does a fixed amount of compute per token. Externalizing intermediate steps as tokens is literally allocating more compute to the problem — the insight that led to reasoning models trained to do this natively.',
        },
        {
          question: 'Few-shot examples in a prompt primarily work by…',
          options: [
            'Demonstrating the task format and decision pattern in-context, which the model imitates — no weight updates involved',
            'Fine-tuning the model on your examples',
            'Caching answers for similar future queries',
            'Increasing the effective context window',
          ],
          correct: 0,
          explanation:
            'In-context learning (the GPT-3 discovery): conditioning on demonstrations changes behavior without changing weights. Examples are often worth more than paragraphs of instructions — especially for format.',
        },
        {
          question: 'Your extraction prompt works on 9 test documents but fails on real traffic. The most professional next step is…',
          options: [
            'Build a larger eval set from real failures, measure baseline accuracy, and iterate on the prompt against the measurement',
            'Add "be very accurate, this is important" to the prompt',
            'Switch providers immediately',
            'Lower the temperature to 0 and ship',
          ],
          correct: 0,
          explanation:
            'Prompt engineering without an eval is guessing. The loop is: collect failures → build eval → change one thing → measure. (Temperature 0 may help consistency but doesn’t address unknown failure modes.)',
        },
        {
          question: 'Why do structured delimiters (XML tags, markdown headers) help in long prompts?',
          options: [
            'They unambiguously separate instructions from data, preventing the model from confusing document content with directives — and they make references precise ("the text in <contract>")',
            'Models parse XML with a built-in validator',
            'They compress the prompt to fewer tokens',
            'They are required by the API schema',
          ],
          correct: 0,
          explanation:
            'Clear boundaries fight both confusion and prompt injection (instructions hidden in pasted content are visibly *data*). Claude is specifically trained to respect XML-style tags.',
        },
      ],
    },
    {
      id: 'structured-tools',
      title: 'Structured Output & Tool Calling',
      summary:
        'The bridge from "chatbot" to "software component": making models emit valid JSON your code can consume, and letting them call functions you define. Tool calling is the foundation of every agent — the model decides *what* to call with *which* arguments; your code executes it and returns results.',
      objectives: [
        'Define tools with JSON Schema and handle the tool-call → execute → respond loop',
        'Make model output reliably machine-parseable',
        'Handle the failure modes: invalid JSON, hallucinated tools, bad arguments',
      ],
      resources: [
        {
          type: 'video',
          title: 'How to Connect an LLM to Python Functions (Tool Calling Tutorial)',
          url: 'https://www.youtube.com/watch?v=liV0bfZ5Wu0',
          author: 'Dataquest',
          duration: '~40 min',
          description: 'Hands-on tool calling in Python — defines tools, handles the call loop, exactly what this lesson’s challenge automates.',
        },
        {
          type: 'docs',
          title: 'Tool use with Claude',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview',
          author: 'Anthropic',
          duration: '45 min',
          description: 'Defining tools, the tool_use/tool_result loop, forcing tool choice.',
        },
        {
          type: 'docs',
          title: 'OpenAI: Function calling & Structured Outputs',
          url: 'https://platform.openai.com/docs/guides/function-calling',
          author: 'OpenAI',
          duration: '30 min',
          description: 'Includes schema-constrained generation that guarantees valid JSON.',
        },
        {
          type: 'paper',
          title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
          url: 'https://arxiv.org/abs/2302.04761',
          author: 'Schick et al., 2023',
          duration: 'skim §1–2',
          description: 'The research lineage of tool use — how models learn when to call APIs.',
        },
      ],
      quiz: [
        {
          question: 'In the tool-calling loop, who actually executes the function?',
          options: [
            'Your application code — the model only emits a structured request (tool name + arguments); you run it and send the result back',
            'The model executes it inside the provider’s datacenter',
            'The API provider runs it in a sandbox automatically',
            'No one — tool calls are simulated text',
          ],
          correct: 0,
          explanation:
            'The model is a planner, not an executor. This separation is also your security boundary: you validate arguments, enforce permissions, and decide what actually runs.',
        },
        {
          question: 'The model calls your `get_weather` tool with `{"city": "Sprinfield"}` — a typo\'d city your API doesn\'t recognize. Best practice is to…',
          options: [
            'Return a structured error as the tool result ("Unknown city: Sprinfield") so the model can correct itself and retry',
            'Crash the request with a 500 error',
            'Silently substitute a default city',
            'Ban the model from using tools for the session',
          ],
          correct: 0,
          explanation:
            'Models are good at self-correcting when errors come back as informative tool results. Design tool errors the way you’d design API errors for a junior developer: specific and actionable.',
        },
        {
          question: 'Why prefer the API’s native tool-calling/structured-output features over "please respond in JSON" in the prompt?',
          options: [
            'Native modes are trained/constrained for the format — some literally guarantee schema-valid output — while prompt-only JSON degrades unpredictably',
            'Prompt-based JSON is against the terms of service',
            'Native tool calls are free of token charges',
            'There is no difference in reliability',
          ],
          correct: 0,
          explanation:
            'Prompted JSON fails in the tail: markdown fences, trailing commas, prose preambles. Constrained decoding masks invalid tokens during sampling, making malformed output impossible — turning a parsing problem into a non-problem.',
        },
        {
          question: 'A good tool description in your schema matters because…',
          options: [
            'The model chooses tools and arguments based on the descriptions — vague descriptions cause wrong tool selection and malformed calls',
            'It is displayed to end users in the chat UI',
            'The API rejects schemas with short descriptions',
            'Descriptions are only for human documentation',
          ],
          correct: 0,
          explanation:
            'Tool descriptions are prompt engineering. "Search the product catalog by keyword; returns top 10 matches with prices" beats "search function." Write them like docs for a sharp colleague who can’t read your code.',
        },
      ],
      challenge: {
        title: 'Tool Call Dispatcher',
        difficulty: 'Medium',
        connection:
          'The lesson’s tool-use loop has two halves: the model emits a structured request ({name, arguments}), and YOUR code executes it safely. This dispatcher is that second half — the validate → execute → report pattern, with structured errors the model can self-correct from. In Module 7 you will plug it into a full agent loop.',
        description:
          'Build the executor side of a tool-use loop — the part of every agent framework you\'d otherwise import as a black box.\n\nImplement `dispatch(tool_calls, registry)` where `tool_calls` is a list of dicts like `{"name": "add", "arguments": {"a": 2, "b": 3}}` and `registry` is a dict mapping tool names to Python functions.\n\nFor each call, return a result dict: `{"name": <name>, "ok": True, "result": <return value>}` on success. If the tool name is not in the registry, return `{"name": <name>, "ok": False, "error": "unknown tool"}`. If calling the function raises any exception, catch it and return `{"name": <name>, "ok": False, "error": str(exception)}`.\n\nCall functions with keyword arguments: `fn(**arguments)`. Process calls in order and return the list of result dicts.',
        examples: [
          {
            input: 'dispatch([{"name": "add", "arguments": {"a": 2, "b": 3}}], {"add": lambda a, b: a + b})',
            output: '[{"name": "add", "ok": True, "result": 5}]',
          },
          {
            input: 'dispatch([{"name": "nope", "arguments": {}}], {})',
            output: '[{"name": "nope", "ok": False, "error": "unknown tool"}]',
          },
        ],
        starterCode:
          'def dispatch(tool_calls, registry):\n    # Execute each tool call against the registry.\n    # Success:        {"name": ..., "ok": True,  "result": ...}\n    # Unknown tool:   {"name": ..., "ok": False, "error": "unknown tool"}\n    # Raised error:   {"name": ..., "ok": False, "error": str(e)}\n    pass\n',
        solution:
          'def dispatch(tool_calls, registry):\n    results = []\n    for call in tool_calls:\n        name = call["name"]\n        if name not in registry:\n            results.append({"name": name, "ok": False, "error": "unknown tool"})\n            continue\n        try:\n            result = registry[name](**call["arguments"])\n            results.append({"name": name, "ok": True, "result": result})\n        except Exception as e:\n            results.append({"name": name, "ok": False, "error": str(e)})\n    return results\n',
        testCode:
          'def t1():\n    out = dispatch([{"name": "add", "arguments": {"a": 2, "b": 3}}], {"add": lambda a, b: a + b})\n    assert out == [{"name": "add", "ok": True, "result": 5}], f"got {out}"\n__check("dispatches a successful call", t1)\n\ndef t2():\n    out = dispatch([{"name": "nope", "arguments": {}}], {"add": lambda a, b: a + b})\n    assert out == [{"name": "nope", "ok": False, "error": "unknown tool"}], f"got {out}"\n__check("unknown tool returns a structured error", t2)\n\ndef t3():\n    def boom():\n        raise ValueError("city not found")\n    out = dispatch([{"name": "boom", "arguments": {}}], {"boom": boom})\n    assert out[0]["ok"] is False and out[0]["error"] == "city not found", f"got {out}"\n__check("raised exceptions are caught and reported", t3)\n\ndef t4():\n    registry = {"add": lambda a, b: a + b, "upper": lambda s: s.upper()}\n    calls = [\n        {"name": "upper", "arguments": {"s": "hi"}},\n        {"name": "missing", "arguments": {}},\n        {"name": "add", "arguments": {"a": 1, "b": 1}},\n    ]\n    out = dispatch(calls, registry)\n    assert len(out) == 3, "one result per call, in order"\n    assert out[0]["result"] == "HI" and out[1]["ok"] is False and out[2]["result"] == 2\n__check("processes multiple calls in order, isolating failures", t4)\n\ndef t5():\n    def add(a, b): return a + b\n    out = dispatch([{"name": "add", "arguments": {"b": 10, "a": 5}}], {"add": add})\n    assert out[0]["result"] == 15, "must call with keyword arguments (fn(**arguments))"\n__check("arguments are passed as keywords", t5)\n\ndef t6():\n    out = dispatch([{"name": "add", "arguments": {"a": 1}}], {"add": lambda a, b: a + b})\n    assert out[0]["ok"] is False, "missing required argument should be caught, not crash"\n__check("bad arguments (hallucinated schema) are caught", t6)\n',
        hints: [
          'Check `name not in registry` before calling; that case gets the literal error "unknown tool".',
          'Wrap only the function call in try/except Exception and use str(e) for the message.',
          'A missing kwarg raises TypeError — your except block already handles it if written generally.',
        ],
      },
    },
    {
      id: 'context-cost',
      title: 'Context Windows, Caching & Cost Engineering',
      summary:
        'Production LLM systems live inside a token budget. Long context is not free attention — models attend unevenly ("lost in the middle"), costs scale linearly with input, and latency with output. Learn prompt caching, model-tier routing, and the arithmetic of an LLM bill.',
      objectives: [
        'Estimate request cost from token counts and per-million pricing',
        'Apply prompt caching and know what makes it effective (stable prefixes)',
        'Recognize long-context failure modes and mitigation strategies',
      ],
      resources: [
        {
          type: 'video',
          title: 'The Secret to Faster & Cheaper LLM Apps — Prompt Caching Explained',
          url: 'https://www.youtube.com/watch?v=etYgu0Q50vI',
          author: 'community explainer',
          duration: '~15 min',
          description: 'How prefix caching works and how to structure prompts to exploit it.',
        },
        {
          type: 'paper',
          title: 'Lost in the Middle: How Language Models Use Long Contexts',
          url: 'https://arxiv.org/abs/2307.03172',
          author: 'Liu et al., 2023',
          duration: 'read §1–3',
          description: 'Models retrieve information best from the start and end of context — with real design implications.',
        },
        {
          type: 'docs',
          title: 'Prompt caching',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
          author: 'Anthropic',
          duration: '20 min',
          description: 'Cache stable prompt prefixes for large cost and latency savings on repeated calls.',
        },
        {
          type: 'article',
          title: 'Building LLM applications for production',
          url: 'https://huyenchip.com/2023/04/11/llm-engineering.html',
          author: 'Chip Huyen',
          duration: '40 min',
          description: 'The classic essay on productionizing LLM apps: cost, latency, and the prompt/finetune tradeoff.',
        },
      ],
      quiz: [
        {
          question: 'A model is priced at $3 per million input tokens and $15 per million output tokens. A request with a 20,000-token context producing a 500-token answer costs about…',
          options: ['$0.0675 — input dominates despite output’s higher rate', '$0.0075', '$0.675', '$7.50'],
          correct: 0,
          explanation:
            '20k × $3/1M = $0.06 input; 500 × $15/1M = $0.0075 output. At 10k requests/day that’s ~$675/day — why context size is an engineering concern, and why caching that 20k context would slash the bill.',
        },
        {
          question: 'Prompt caching gives the biggest savings when…',
          options: [
            'A large, byte-identical prefix (system prompt, docs, tool definitions) repeats across many calls, with variable content placed after it',
            'Every prompt is completely unique',
            'You put the user’s question first and the documents last',
            'Responses are short',
          ],
          correct: 0,
          explanation:
            'Caches match on exact prefixes. Structure prompts as [stable: system + tools + docs] then [variable: user query] — reordering to put volatile content first destroys cacheability.',
        },
        {
          question: 'The "lost in the middle" finding implies that for a RAG prompt with 20 retrieved chunks…',
          options: [
            'The most relevant chunks should be placed at the beginning or end of the context, not buried in the middle',
            'Chunk order is irrelevant to the model',
            'You should always use all 20 chunks',
            'The middle of the context is processed twice',
          ],
          correct: 0,
          explanation:
            'Retrieval accuracy degrades for mid-context information. Practical fixes: rank-order chunks toward the edges, or retrieve fewer/better chunks rather than stuffing the window.',
        },
        {
          question: 'Your pipeline classifies support tickets into 5 categories. The cost-smart architecture is…',
          options: [
            'Use a small/cheap model (or even a classical classifier) for routine routing, escalating to a frontier model only for ambiguous cases',
            'Use the largest model for everything to maximize quality',
            'Always run both models and compare answers',
            'Fine-tune the largest available model first',
          ],
          correct: 0,
          explanation:
            'Model routing/cascading: simple high-volume tasks rarely need frontier capability. A 10–60× per-token price gap between tiers makes triage the highest-ROI cost lever in most LLM systems.',
        },
      ],
    },
  ],
};
