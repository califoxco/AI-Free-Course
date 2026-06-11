import type { Module } from '../types';

export const m7: Module = {
  id: 'agents',
  title: 'AI Agents',
  tagline: 'From single calls to autonomous loops: ReAct, tool loops, MCP, multi-agent systems.',
  description:
    'An agent is an LLM in a loop with tools: it observes, decides, acts, and incorporates results until the task is done. This is the frontier of AI engineering — and also where overengineering runs rampant. Learn the core loop (by building one), the protocols standardizing the ecosystem, and the judgment to know when a simple workflow beats an agent.',
  lessons: [
    {
      id: 'agent-fundamentals',
      title: 'Agent Fundamentals: Reasoning + Acting',
      summary:
        'The conceptual foundations: ReAct showed that interleaving reasoning ("thought") with tool calls ("action") and feedback ("observation") lets models solve multi-step tasks. Anthropic’s "Building Effective Agents" then gives the engineering counterweight: most problems need a workflow, not an agent — start simple.',
      objectives: [
        'Describe the ReAct loop: thought → action → observation → repeat',
        'Distinguish workflows (predefined steps) from agents (model-directed control flow)',
        'Identify when agentic autonomy is and isn’t warranted',
      ],
      resources: [
        {
          type: 'video',
          title: 'How We Build Effective Agents',
          url: 'https://www.youtube.com/watch?v=D7_ipDqhtwk',
          author: 'Barry Zhang (Anthropic), AI Engineer Summit',
          duration: '19 min',
          description: 'The companion talk to the essay below, from the team that wrote it.',
        },
        {
          type: 'article',
          title: 'Building Effective Agents',
          url: 'https://www.anthropic.com/engineering/building-effective-agents',
          author: 'Anthropic',
          duration: '30 min',
          description: 'The most influential engineering essay on agents: patterns, anti-patterns, and "use the simplest thing that works."',
        },
        {
          type: 'paper',
          title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
          url: 'https://arxiv.org/abs/2210.03629',
          author: 'Yao et al., 2022',
          duration: 'read §1–3',
          description: 'The paper behind the thought/action/observation pattern every framework copies.',
        },
        {
          type: 'article',
          title: 'LLM Powered Autonomous Agents',
          url: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
          author: 'Lilian Weng',
          duration: '45 min',
          description: 'The classic survey: planning, memory, tool use — the agent design space mapped.',
        },
      ],
      quiz: [
        {
          question: 'Per Anthropic’s definitions, the key difference between a *workflow* and an *agent* is…',
          options: [
            'Workflows orchestrate LLM calls through predefined code paths; agents let the model dynamically direct its own process and tool use',
            'Agents use more than one tool; workflows use exactly one',
            'Workflows run offline; agents run in real time',
            'Agents require multiple models; workflows use one',
          ],
          correct: 0,
          explanation:
            'The distinction is who controls the control flow. A fixed chain of prompt → extract → classify is a workflow, however many LLM calls it makes. Autonomy over "what to do next" is what makes an agent — and what makes it harder to test.',
        },
        {
          question: 'Why does the ReAct pattern interleave explicit reasoning ("thoughts") between actions?',
          options: [
            'Reasoning tokens let the model interpret the last observation and plan the next action, reducing impulsive or repetitive tool calls',
            'Thoughts are required by the API schema',
            'It makes transcripts shorter',
            'Thoughts are executed as code',
          ],
          correct: 0,
          explanation:
            'Same mechanism as chain-of-thought: externalized intermediate state improves the next decision. In agents it also gives you an audit trail of *why* the model did what it did — invaluable for debugging.',
        },
        {
          question: 'A task needs: fetch a ticket, summarize it, post the summary to Slack. Same three steps every time. You should build…',
          options: [
            'A workflow — fixed steps in code with LLM calls where needed; an agent adds nondeterminism and cost for zero benefit here',
            'A full autonomous agent with 20 tools',
            'A multi-agent system with a planner and executor',
            'Nothing — LLMs can’t post to Slack',
          ],
          correct: 0,
          explanation:
            '"Building Effective Agents" is blunt about this: agents are for open-ended tasks where you can’t enumerate the steps. Known steps → write code. Your future self debugging production will thank you.',
        },
        {
          question: 'The most reliable predictor of agent success on a task domain is…',
          options: [
            'Clear, checkable feedback signals (tests pass, query returns data) the agent can use to verify its own progress',
            'The number of tools available',
            'The length of the system prompt',
            'Using the word "autonomous" in the prompt',
          ],
          correct: 0,
          explanation:
            'Agents thrive where the environment tells them when they’re wrong — code (tests), search (results), data (queries). Without verifiable feedback, errors compound silently across turns. Design the feedback loop before the agent.',
        },
      ],
    },
    {
      id: 'agent-loop',
      title: 'Building the Agent Loop',
      summary:
        'Strip away the frameworks: an agent is ~30 lines of code. Model returns either a tool call or a final answer; you execute tools, append results to the transcript, and call again. Build it yourself in this lesson’s challenge — after this, LangChain and friends become conveniences, not magic.',
      objectives: [
        'Implement the complete agent loop from scratch',
        'Manage the growing message transcript across turns',
        'Add the safety rails: iteration limits and error feedback',
      ],
      resources: [
        {
          type: 'video',
          title: 'Building AI Agents in Pure Python',
          url: 'https://www.youtube.com/watch?v=bZzyPscbtI8',
          author: 'Dave Ebbelaar',
          duration: '~1h',
          description: 'No frameworks — raw API calls, tool loops, and structured outputs. The same philosophy as this lesson’s challenge.',
        },
        {
          type: 'docs',
          title: 'Building agents with the Claude API (tool use loop)',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview',
          author: 'Anthropic',
          duration: '30 min',
          description: 'The official loop: assistant tool_use → your code → tool_result → repeat.',
        },
        {
          type: 'course',
          title: 'AI Agents Course',
          url: 'https://huggingface.co/learn/agents-course',
          author: 'Hugging Face',
          duration: 'multi-unit, free',
          description: 'Free hands-on course building agents from raw loops to frameworks.',
        },
        {
          type: 'article',
          title: 'How to Build an Agent',
          url: 'https://ampcode.com/how-to-build-an-agent',
          author: 'Thorsten Ball',
          duration: '30 min',
          description: 'A working code-editing agent in ~300 lines of Go — proof there is no moat in the loop itself.',
        },
      ],
      quiz: [
        {
          question: 'Why must every tool result be appended to the message history before the next model call?',
          options: [
            'The API is stateless — the model only knows what’s in the transcript you send; omitting results means it never learns what its action did',
            'For billing purposes',
            'Tool results train the model between calls',
            'The history is only needed for logging',
          ],
          correct: 0,
          explanation:
            'The transcript IS the agent’s memory. Forget to append an observation and the model will repeat the same tool call forever — the most common beginner agent bug.',
        },
        {
          question: 'Every production agent loop needs a maximum-iteration limit because…',
          options: [
            'Models can loop indefinitely (retrying failed approaches, oscillating between tools), and each iteration costs money and time',
            'APIs enforce a 5-call maximum',
            'More iterations reduce answer quality',
            'The KV cache overflows after 10 turns',
          ],
          correct: 0,
          explanation:
            'An agent stuck re-trying a broken approach burns tokens at full price. Cap iterations, surface the partial transcript on hitting the cap, and treat it as a signal that the task or tools need redesign.',
        },
        {
          question: 'A long-running agent’s transcript approaches the context limit. Common mitigations include all of these EXCEPT…',
          options: [
            'Increasing temperature so the model finishes faster',
            'Summarizing/compacting older turns into a shorter form',
            'Truncating bulky tool results (keep what matters)',
            'Storing details externally (files, scratchpads) and keeping references in context',
          ],
          correct: 0,
          explanation:
            'Temperature changes sampling randomness, not transcript length. The other three are the standard context-management toolkit — Claude Code and similar tools use exactly these.',
        },
      ],
      challenge: {
        title: 'Implement an Agent Loop',
        difficulty: 'Medium',
        connection:
          'The lesson claimed an agent is ~30 lines of code around an LLM call — here are those 30 lines. The mock LLM stands in for a real API so the tests are deterministic; swap it for an actual Claude/GPT call and you have a working agent. Notice as you build it: the growing transcript IS the agent’s memory, and the iteration cap is what stands between you and an infinite API bill.',
        description:
          'Build the heart of every AI agent — a loop driving a (mock) LLM with tools.\n\nImplement `run_agent(llm, tools, user_message, max_iters=10)`:\n\n1. Start a transcript: `messages = [{"role": "user", "content": user_message}]`.\n\n2. Loop: call `response = llm(messages)`. The mock LLM returns either `{"type": "tool_call", "name": ..., "arguments": {...}}` or `{"type": "final", "content": "..."}`.\n\n3. If `final`: return its `content`.\n\n4. If `tool_call`: append `{"role": "assistant", "content": response}` to messages, execute `tools[name](**arguments)` — if the name is unknown, use the string `"error: unknown tool"` as the result — then append `{"role": "tool", "content": result}` and continue the loop.\n\n5. If `max_iters` is reached without a final answer, return the string `"max iterations reached"`.',
        examples: [
          {
            input: 'Mock LLM that requests add(2, 3), then returns final answer using the tool result',
            output: '"The answer is 5"',
          },
        ],
        starterCode:
          'def run_agent(llm, tools, user_message, max_iters=10):\n    messages = [{"role": "user", "content": user_message}]\n    # Loop up to max_iters times:\n    #   response = llm(messages)\n    #   final -> return content\n    #   tool_call -> append assistant msg, run tool (or "error: unknown tool"),\n    #                append {"role": "tool", "content": result}, continue\n    # If the loop exhausts: return "max iterations reached"\n    pass\n',
        solution:
          'def run_agent(llm, tools, user_message, max_iters=10):\n    messages = [{"role": "user", "content": user_message}]\n    for _ in range(max_iters):\n        response = llm(messages)\n        if response["type"] == "final":\n            return response["content"]\n        messages.append({"role": "assistant", "content": response})\n        name = response["name"]\n        if name in tools:\n            result = tools[name](**response["arguments"])\n        else:\n            result = "error: unknown tool"\n        messages.append({"role": "tool", "content": result})\n    return "max iterations reached"\n',
        testCode:
          'def t1():\n    def llm(messages):\n        return {"type": "final", "content": "hello"}\n    assert run_agent(llm, {}, "hi") == "hello"\n__check("direct final answer (no tools)", t1)\n\ndef t2():\n    calls = {"n": 0}\n    def llm(messages):\n        if calls["n"] == 0:\n            calls["n"] += 1\n            return {"type": "tool_call", "name": "add", "arguments": {"a": 2, "b": 3}}\n        last = messages[-1]\n        assert last["role"] == "tool", "tool result must be appended as role=tool"\n        return {"type": "final", "content": f"The answer is {last[\'content\']}"}\n    out = run_agent(llm, {"add": lambda a, b: a + b}, "what is 2+3?")\n    assert out == "The answer is 5", f"got {out!r}"\n__check("one tool call: result fed back to the LLM", t2)\n\ndef t3():\n    def llm(messages):\n        return {"type": "tool_call", "name": "spin", "arguments": {}}\n    out = run_agent(llm, {"spin": lambda: "ok"}, "loop forever", max_iters=4)\n    assert out == "max iterations reached", f"got {out!r}"\n__check("iteration cap stops infinite loops", t3)\n\ndef t4():\n    seen = []\n    def llm(messages):\n        seen.append(len(messages))\n        if len(messages) >= 5:\n            return {"type": "final", "content": "done"}\n        return {"type": "tool_call", "name": "ping", "arguments": {}}\n    out = run_agent(llm, {"ping": lambda: "pong"}, "go")\n    assert out == "done"\n    assert seen == [1, 3, 5], f"transcript should grow by 2 per tool turn (assistant + tool); got {seen}"\n__check("transcript grows correctly across turns", t4)\n\ndef t5():\n    calls = {"n": 0}\n    def llm(messages):\n        if calls["n"] == 0:\n            calls["n"] += 1\n            return {"type": "tool_call", "name": "no_such_tool", "arguments": {}}\n        assert messages[-1]["content"] == "error: unknown tool", f"got {messages[-1][\'content\']!r}"\n        return {"type": "final", "content": "recovered"}\n    out = run_agent(llm, {}, "try a bad tool")\n    assert out == "recovered"\n__check("unknown tool returns an error the LLM can react to", t5)\n',
        hints: [
          'The loop body has exactly three branches: final → return; known tool → execute; unknown tool → error string.',
          'Append the assistant message BEFORE the tool result — the transcript must alternate assistant/tool.',
          'Use for _ in range(max_iters) and put the fallback return after the loop.',
        ],
      },
    },
    {
      id: 'mcp',
      title: 'MCP & the Agent Ecosystem',
      summary:
        'The Model Context Protocol (MCP) standardizes how AI applications connect to tools and data — "USB-C for AI": build a server once, every MCP client (Claude, IDEs, custom agents) can use it. Learn the architecture (hosts, clients, servers; tools, resources, prompts) and where protocols are taking the ecosystem.',
      objectives: [
        'Explain the problem MCP solves (M×N integrations → M+N)',
        'Describe MCP primitives: tools, resources, prompts',
        'Evaluate when to expose capabilities as an MCP server',
      ],
      resources: [
        {
          type: 'video',
          title: 'Model Context Protocol (MCP), clearly explained (why it matters)',
          url: 'https://www.youtube.com/watch?v=7j_NE6Pjv-E',
          author: 'community explainer',
          duration: '~20 min',
          description: 'The M×N integration problem and how MCP solves it, with concrete examples.',
        },
        {
          type: 'docs',
          title: 'Model Context Protocol — Introduction',
          url: 'https://modelcontextprotocol.io/introduction',
          author: 'Anthropic / MCP project',
          duration: '30 min',
          description: 'The official spec site: concepts, architecture, quickstarts.',
        },
        {
          type: 'article',
          title: 'Introducing the Model Context Protocol',
          url: 'https://www.anthropic.com/news/model-context-protocol',
          author: 'Anthropic',
          duration: '10 min',
          description: 'The announcement explaining the motivation and design.',
        },
        {
          type: 'docs',
          title: 'MCP server examples & SDK',
          url: 'https://github.com/modelcontextprotocol/servers',
          author: 'MCP project',
          duration: 'code reading',
          description: 'Reference servers (filesystem, GitHub, databases) — read one, then build your own.',
        },
      ],
      quiz: [
        {
          question: 'The core problem MCP addresses is…',
          options: [
            'Every AI app integrating every tool bespoke (M×N combinations) — a standard protocol makes it M clients + N servers',
            'LLMs generating syntactically invalid JSON',
            'GPU memory fragmentation during inference',
            'Models being too large to download',
          ],
          correct: 0,
          explanation:
            'Before MCP, a Slack integration written for one AI app didn’t transfer to another. With a standard protocol, one Slack MCP server serves every compliant client — the same economics as LSP for editors.',
        },
        {
          question: 'In MCP, *tools* vs *resources* differ in that…',
          options: [
            'Tools are model-invoked actions with side effects; resources are application-controlled data (files, records) provided as context',
            'Tools are free, resources are paid',
            'Resources can only contain images',
            'Tools run on the client, resources on the model',
          ],
          correct: 0,
          explanation:
            'Tools = "things the model may do" (search, write, execute). Resources = "things the app exposes for reading." The split keeps dangerous actions distinguishable from passive context.',
        },
        {
          question: 'Your company has an internal customer-data API that several AI tools (Claude, an internal agent, an IDE assistant) should access. The MCP-shaped answer is…',
          options: [
            'Build one MCP server wrapping the API; each AI tool connects as a client with consistent auth and tool definitions',
            'Re-implement the integration separately inside each AI tool',
            'Fine-tune a model on the customer database',
            'Email CSV exports to each team',
          ],
          correct: 0,
          explanation:
            'Write once, connect everywhere — plus a single choke point for permissions, logging, and updating tool definitions when the API changes.',
        },
      ],
    },
    {
      id: 'multi-agent',
      title: 'Multi-Agent Systems & Orchestration Patterns',
      summary:
        'When one context window can’t hold a task, orchestrate several: a lead agent decomposing work for parallel subagents, evaluator-optimizer loops, routing. Study the patterns through Anthropic’s published multi-agent research system — including the honest accounting of when multi-agent is worth 15× the tokens.',
      objectives: [
        'Name the canonical patterns: chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer',
        'Explain when parallel subagents genuinely help (wide read-heavy tasks) vs hurt (tightly coupled edits)',
        'Account for the cost/reliability tradeoffs of added autonomy',
      ],
      resources: [
        {
          type: 'video',
          title: 'How we built our multi-agent research system (walkthrough)',
          url: 'https://www.youtube.com/watch?v=F-hsQROzSms',
          author: 'community breakdown',
          duration: '~25 min',
          description: 'A guided walkthrough of the Anthropic engineering post below — watch first, then read.',
        },
        {
          type: 'article',
          title: 'How we built our multi-agent research system',
          url: 'https://www.anthropic.com/engineering/built-multi-agent-research-system',
          author: 'Anthropic',
          duration: '30 min',
          description: 'Rare production detail: orchestrator-worker design, prompt lessons, eval strategy, token economics.',
        },
        {
          type: 'paper',
          title: 'Generative Agents: Interactive Simulacra of Human Behavior',
          url: 'https://arxiv.org/abs/2304.03442',
          author: 'Park et al., 2023',
          duration: 'skim',
          description: 'The famous "Smallville" paper — agents with memory and reflection interacting in a simulated town.',
        },
        {
          type: 'docs',
          title: 'Claude Agent SDK / building agents documentation',
          url: 'https://docs.anthropic.com/en/docs/agents-and-tools',
          author: 'Anthropic',
          duration: '30 min',
          description: 'Production agent building blocks: subagents, hooks, sessions, permissions.',
        },
      ],
      quiz: [
        {
          question: 'In Anthropic’s research system, multi-agent architecture shines for research tasks because…',
          options: [
            'Research is read-heavy and parallelizable — subagents explore different directions simultaneously with separate context windows, then synthesize',
            'Multiple agents are always cheaper than one',
            'Each agent uses a different provider for redundancy',
            'Research requires no coordination between findings',
          ],
          correct: 0,
          explanation:
            'Breadth-first exploration distributes naturally; each subagent burns its own context on one thread of investigation. Contrast with coding, where parallel writers conflict — the task’s structure decides the architecture.',
        },
        {
          question: 'The evaluator-optimizer pattern is…',
          options: [
            'One model generates while another critiques against criteria, looping until quality passes — useful when you can articulate what "good" looks like',
            'Hyperparameter tuning for the optimizer',
            'Two models trained adversarially like a GAN',
            'A model evaluating its own response in the same call',
          ],
          correct: 0,
          explanation:
            'Generator → critic → revised generation. It trades tokens for quality and works when evaluation criteria are expressible. A separate critic context avoids the generator grading its own homework.',
        },
        {
          question: 'The biggest practical *costs* of multi-agent systems, per Anthropic’s writeup, include…',
          options: [
            'Token usage ~15× a single chat, plus hard-to-debug emergent coordination failures',
            'Models refusing to work together',
            'Legal restrictions on running multiple agents',
            'GPU clusters required on-premises',
          ],
          correct: 0,
          explanation:
            'Every subagent re-reads context and explores (sometimes redundantly). The economics only work when task value justifies it — and nondeterministic multi-step systems need new debugging and eval approaches (trace everything).',
        },
        {
          question: 'You need an LLM pipeline to handle customer emails: classify intent, then route to one of three specialized prompts. This is the ______ pattern.',
          options: ['Routing — a workflow pattern, no agent autonomy required', 'Orchestrator-workers', 'Evaluator-optimizer', 'Autonomous multi-agent swarm'],
          correct: 0,
          explanation:
            'A classifier call followed by a branch is routing — fixed control flow, fully testable. Reach for orchestrator-workers only when subtask decomposition itself must be dynamic.',
        },
      ],
    },
  ],
};
