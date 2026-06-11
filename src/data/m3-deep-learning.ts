import type { Module } from '../types';

export const m3: Module = {
  id: 'deep-learning',
  title: 'Neural Networks & Deep Learning',
  tagline: 'Build neural networks from scratch — backprop included.',
  description:
    'This is where you stop treating neural networks as magic. Following Karpathy’s Zero-to-Hero path, you will build backpropagation by hand, understand what training actually does, and then map it all onto PyTorch. The payoff: every architecture you meet later (including transformers) is just these pieces rearranged.',
  lessons: [
    {
      id: 'neural-nets',
      title: 'Neural Networks from First Principles',
      summary:
        'A neural network is layers of "matrix multiply + nonlinearity" stacked. That is the whole secret. This lesson builds the picture visually with 3Blue1Brown, then mathematically with the first half of Karpathy’s micrograd video — the single best deep learning lecture ever recorded.',
      objectives: [
        'Describe a multi-layer perceptron as composed linear maps with nonlinearities',
        'Explain why nonlinear activations are necessary',
        'Trace a forward pass by hand for a tiny network',
      ],
      resources: [
        {
          type: 'video',
          title: 'But what is a neural network?',
          url: 'https://www.youtube.com/watch?v=aircAruvnKk',
          author: '3Blue1Brown',
          duration: '19 min',
          description: 'Chapter 1 of the famous visual series. Watch chapters 1–2 for this lesson.',
        },
        {
          type: 'video',
          title: 'The spelled-out intro to neural networks and backpropagation: building micrograd (first half)',
          url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
          author: 'Andrej Karpathy',
          duration: '2h 25min total',
          description: 'Build a tiny autograd engine from scratch. Watch up to the backprop section now; finish it in the next lesson.',
        },
        {
          type: 'article',
          title: 'CS231n notes: Neural Networks Part 1',
          url: 'https://cs231n.github.io/neural-networks-1/',
          author: 'Stanford CS231n',
          duration: '30 min',
          description: 'Written reference covering architecture, activations, and representational power.',
        },
      ],
      quiz: [
        {
          question: 'Why does a neural network need nonlinear activation functions between layers?',
          options: [
            'Without them, stacked linear layers collapse into a single linear transformation — depth would add nothing',
            'Nonlinearities make the network run faster',
            'They prevent the weights from becoming negative',
            'They are only needed for image data',
          ],
          correct: 0,
          explanation:
            'W₂(W₁x) = (W₂W₁)x — still linear. The nonlinearity between layers is what lets depth compose simple functions into arbitrarily complex ones.',
        },
        {
          question: 'A "neuron" in an MLP computes…',
          options: [
            'A weighted sum of its inputs plus a bias, passed through an activation function',
            'The maximum of its inputs',
            'A probability via Bayes’ rule',
            'A comparison against a learned threshold, outputting exactly 0 or 1',
          ],
          correct: 0,
          explanation:
            'activation(w·x + b). A full layer is just many neurons in parallel — which is exactly a matrix multiply followed by an elementwise activation.',
        },
        {
          question: 'ReLU (max(0, x)) largely replaced sigmoid as the default hidden activation because…',
          options: [
            'Sigmoid saturates at both ends, producing near-zero gradients that stall learning in deep networks',
            'ReLU outputs are always between 0 and 1',
            'Sigmoid cannot be computed on GPUs',
            'ReLU guarantees the network converges to a global minimum',
          ],
          correct: 0,
          explanation:
            'For |x| large, sigmoid’s derivative ≈ 0, and multiplying many such derivatives (chain rule) vanishes the gradient. ReLU’s derivative is 1 for positive inputs, keeping gradients flowing.',
        },
        {
          question: 'A network has layers sized 784 → 128 → 10 (no biases). How many weights does it have?',
          options: ['784·128 + 128·10 = 101,632', '784 + 128 + 10 = 922', '784·128·10 ≈ 1M', '128·128 = 16,384'],
          correct: 0,
          explanation:
            'Each layer is a weight matrix sized (in × out): 784×128 plus 128×10. Counting parameters like this becomes second nature — it’s how you estimate model memory and compute.',
        },
      ],
    },
    {
      id: 'backprop',
      title: 'Backpropagation: The Engine of Learning',
      summary:
        'Backprop is the chain rule applied systematically over a computation graph. Finish the micrograd video and then prove you understand it by implementing a working autograd engine in this lesson’s challenge — the hardest and most valuable exercise in the course.',
      objectives: [
        'Explain backprop as reverse-mode chain rule over a computation graph',
        'Hand-derive gradients for + , × , and ReLU nodes',
        'Implement backward() with topological ordering',
      ],
      resources: [
        {
          type: 'video',
          title: 'Building micrograd (complete)',
          url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
          author: 'Andrej Karpathy',
          duration: '2h 25min',
          description: 'Finish the video. Code along — do not just watch.',
        },
        {
          type: 'video',
          title: 'What is backpropagation really doing?',
          url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U',
          author: '3Blue1Brown',
          duration: '14 min',
          description: 'The visual companion: what the gradient computation means.',
        },
        {
          type: 'article',
          title: 'micrograd source code',
          url: 'https://github.com/karpathy/micrograd',
          author: 'Andrej Karpathy',
          duration: '~150 lines',
          description: 'The whole engine in one readable file. Read engine.py line by line.',
        },
        {
          type: 'article',
          title: 'Yes you should understand backprop',
          url: 'https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b',
          author: 'Andrej Karpathy',
          duration: '10 min',
          description: 'Why this matters even in the age of autograd: vanishing gradients, dead ReLUs, exploding losses.',
        },
      ],
      quiz: [
        {
          question: 'In backprop through c = a * b, the gradient flowing to a is…',
          options: [
            'b times the gradient flowing into c (the local derivative routes the upstream gradient)',
            'a times the gradient flowing into c',
            'always equal to the gradient flowing into c',
            'zero unless a > 0',
          ],
          correct: 0,
          explanation:
            '∂c/∂a = b, so a.grad += b * c.grad. Multiplication "swaps" the operands when routing gradients. Addition routes the gradient through unchanged; multiplication scales it by the other operand.',
        },
        {
          question: 'Why must nodes be processed in reverse topological order during backward()?',
          options: [
            'A node’s gradient must be fully accumulated from all its consumers before it propagates to its own inputs',
            'It reduces memory usage',
            'Python dictionaries require sorted keys',
            'Forward order would compute the same result but slower',
          ],
          correct: 0,
          explanation:
            'If a value feeds into two later operations, both contributions must be summed into its grad before that grad is pushed further back. Reverse topological order guarantees this.',
        },
        {
          question: 'Why do gradients *accumulate* (+=) rather than assign (=) in autograd engines?',
          options: [
            'A value used in multiple places receives gradient contributions from each use, which must sum (multivariate chain rule)',
            'Assignment is slower than addition',
            'It prevents floating point underflow',
            'Accumulation is only needed for recurrent networks',
          ],
          correct: 0,
          explanation:
            'If x appears twice in an expression, ∂L/∂x is the sum of both paths’ contributions. This is also why PyTorch makes you call zero_grad() — grads keep accumulating across backward calls.',
        },
        {
          question: 'A ReLU neuron’s input is negative for every training example ("dead ReLU"). What happens to its incoming weights during training?',
          options: [
            'They stop updating — the ReLU’s zero gradient blocks all learning signal',
            'They grow without bound',
            'They update normally using the upstream gradient',
            'They are automatically re-initialized',
          ],
          correct: 0,
          explanation:
            'ReLU’s derivative is 0 for negative input, so no gradient flows to anything upstream of it. The neuron can never recover — one practical reason to monitor activations and use careful initialization.',
        },
      ],
      challenge: {
        title: 'Build a Tiny Autograd Engine',
        difficulty: 'Hard',
        connection:
          'You just watched Karpathy build micrograd. Now rebuild its core from memory — the closures, the topological sort, the += accumulation. If you can write Value.backward() yourself, loss.backward() in PyTorch stops being magic forever. This is the hardest exercise in the course, and the most valuable.',
        description:
          'Implement micrograd’s core: a `Value` class that builds a computation graph during the forward pass and computes gradients on `.backward()`.\n\nRequirements:\n\n1. `Value(data)` stores `.data` (float) and `.grad` (float, starts at 0.0).\n\n2. Support `a + b` and `a * b` between Value objects (you don\'t need to handle raw numbers).\n\n3. `relu()` returns a new Value with `data = max(0, data)`.\n\n4. `.backward()` on the output node sets `.grad` for every node in the graph: build a topological order of the graph, set the output node\'s grad to 1.0, then propagate in reverse.\n\nLocal derivatives: for `c = a + b`: both get `1 * c.grad`. For `c = a * b`: `a.grad += b.data * c.grad` and vice versa. For `r = a.relu()`: `a.grad += (1 if a.data > 0 else 0) * r.grad`. Remember to ACCUMULATE with `+=`.',
        examples: [
          {
            input: 'a = Value(2.0); b = Value(3.0); c = a * b + a; c.backward()',
            output: 'a.grad == 4.0, b.grad == 2.0',
            explanation: 'c = a*b + a → ∂c/∂a = b + 1 = 4, ∂c/∂b = a = 2.',
          },
        ],
        starterCode:
          'class Value:\n    def __init__(self, data, _children=()):\n        self.data = data\n        self.grad = 0.0\n        self._backward = lambda: None\n        self._prev = set(_children)\n\n    def __add__(self, other):\n        out = Value(self.data + other.data, (self, other))\n        def _backward():\n            # accumulate grads into self and other\n            pass\n        out._backward = _backward\n        return out\n\n    def __mul__(self, other):\n        out = Value(self.data * other.data, (self, other))\n        def _backward():\n            pass\n        out._backward = _backward\n        return out\n\n    def relu(self):\n        out = Value(max(0.0, self.data), (self,))\n        def _backward():\n            pass\n        out._backward = _backward\n        return out\n\n    def backward(self):\n        # 1. build topological order of the graph ending at self\n        # 2. self.grad = 1.0\n        # 3. call _backward() on each node in reverse topological order\n        pass\n',
        solution:
          'class Value:\n    def __init__(self, data, _children=()):\n        self.data = data\n        self.grad = 0.0\n        self._backward = lambda: None\n        self._prev = set(_children)\n\n    def __add__(self, other):\n        out = Value(self.data + other.data, (self, other))\n        def _backward():\n            self.grad += out.grad\n            other.grad += out.grad\n        out._backward = _backward\n        return out\n\n    def __mul__(self, other):\n        out = Value(self.data * other.data, (self, other))\n        def _backward():\n            self.grad += other.data * out.grad\n            other.grad += self.data * out.grad\n        out._backward = _backward\n        return out\n\n    def relu(self):\n        out = Value(max(0.0, self.data), (self,))\n        def _backward():\n            self.grad += (1.0 if self.data > 0 else 0.0) * out.grad\n        out._backward = _backward\n        return out\n\n    def backward(self):\n        topo, visited = [], set()\n        def build(v):\n            if v not in visited:\n                visited.add(v)\n                for child in v._prev:\n                    build(child)\n                topo.append(v)\n        build(self)\n        self.grad = 1.0\n        for node in reversed(topo):\n            node._backward()\n',
        testCode:
          'def t1():\n    a, b = Value(2.0), Value(3.0)\n    c = a + b\n    assert c.data == 5.0, f"forward add: expected 5.0, got {c.data}"\n    d = a * b\n    assert d.data == 6.0, f"forward mul: expected 6.0, got {d.data}"\n__check("forward pass: add and mul", t1)\n\ndef t2():\n    a = Value(-2.0)\n    r = a.relu()\n    assert r.data == 0.0, f"relu(-2) should be 0, got {r.data}"\n    b = Value(3.0)\n    assert b.relu().data == 3.0\n__check("forward pass: relu clamps negatives", t2)\n\ndef t3():\n    a, b = Value(2.0), Value(3.0)\n    c = a * b\n    c.backward()\n    assert a.grad == 3.0, f"a.grad should be b.data=3.0, got {a.grad}"\n    assert b.grad == 2.0, f"b.grad should be a.data=2.0, got {b.grad}"\n__check("backward through mul swaps operands", t3)\n\ndef t4():\n    a, b = Value(2.0), Value(3.0)\n    c = a * b + a  # dc/da = b + 1 = 4, dc/db = a = 2\n    c.backward()\n    assert a.grad == 4.0, f"a.grad should be 4.0 (b + 1), got {a.grad} — are you accumulating with +=?"\n    assert b.grad == 2.0, f"b.grad should be 2.0, got {b.grad}"\n__check("value reused twice: gradients accumulate", t4)\n\ndef t5():\n    a = Value(-1.0)\n    b = Value(5.0)\n    out = (a * b).relu()  # forward: relu(-5) = 0; grad blocked\n    out.backward()\n    assert a.grad == 0.0 and b.grad == 0.0, "dead relu must block all gradient"\n__check("relu blocks gradient when input is negative", t5)\n\ndef t6():\n    x = Value(3.0)\n    y = ((x * x) + x).relu()  # y = x^2 + x = 12; dy/dx = 2x + 1 = 7\n    y.backward()\n    assert abs(x.grad - 7.0) < 1e-9, f"expected 7.0, got {x.grad}"\n__check("chain: relu(x*x + x) at x=3 has grad 7", t6)\n',
        hints: [
          'Each op creates the output Value and a closure _backward that pushes out.grad into the inputs’ grads. The closures do the work; backward() just orders the calls.',
          'Topological sort: recursive DFS over _prev, appending each node after visiting its children.',
          'If test 4 fails with a.grad == 1.0 or 3.0, you are assigning (=) instead of accumulating (+=).',
        ],
      },
    },
    {
      id: 'training-dynamics',
      title: 'Training Dynamics: Optimizers, Batches & Stability',
      summary:
        'Real training uses minibatches, momentum-based optimizers like Adam, learning-rate schedules, and normalization layers. These aren’t academic details — they are the knobs you will actually turn when a fine-tuning run diverges. Karpathy’s makemore series shows them in action.',
      objectives: [
        'Explain SGD with minibatches and why batch size matters',
        'Describe what Adam adds over vanilla SGD',
        'Recognize the purpose of normalization layers and residual connections',
      ],
      resources: [
        {
          type: 'video',
          title: 'The spelled-out intro to language modeling: building makemore',
          url: 'https://www.youtube.com/watch?v=PaCmpygFfXo',
          author: 'Andrej Karpathy',
          duration: '1h 57min',
          description: 'Bigram models to MLPs — watch training behavior emerge on real data.',
        },
        {
          type: 'video',
          title: 'Building makemore Part 3: Activations & Gradients, BatchNorm',
          url: 'https://www.youtube.com/watch?v=P6sfmUTpUmc',
          author: 'Andrej Karpathy',
          duration: '1h 55min',
          description: 'The best practical treatment of training stability: saturations, initialization, normalization.',
        },
        {
          type: 'paper',
          title: 'Adam: A Method for Stochastic Optimization',
          url: 'https://arxiv.org/abs/1412.6980',
          author: 'Kingma & Ba, 2014',
          duration: 'skim — read §2',
          description: 'The default optimizer of deep learning. Read the algorithm box; the intuition is momentum + per-parameter adaptive scaling.',
        },
      ],
      quiz: [
        {
          question: 'Why train on minibatches instead of the full dataset each step?',
          options: [
            'Full-dataset gradients are prohibitively expensive per step, and noisy minibatch gradients are good enough (sometimes even helping generalization)',
            'Minibatch gradients are exact while full-batch gradients are approximate',
            'GPUs cannot hold more than 32 examples',
            'Minibatches prevent overfitting entirely',
          ],
          correct: 0,
          explanation:
            'A minibatch gradient is an unbiased estimate of the full gradient at a fraction of the cost — many cheap noisy steps beat few exact ones. The noise also acts as a mild regularizer.',
        },
        {
          question: 'Adam differs from vanilla SGD primarily by…',
          options: [
            'Maintaining per-parameter running averages of gradients (momentum) and squared gradients (adaptive scale)',
            'Computing exact second derivatives',
            'Using a different loss function',
            'Updating only a random subset of parameters each step',
          ],
          correct: 0,
          explanation:
            'Adam tracks first and second moment estimates per parameter, so each weight gets its own effective learning rate. That robustness to scale is why it’s the default for transformers.',
        },
        {
          question: 'What problem do residual (skip) connections primarily solve in deep networks?',
          options: [
            'They give gradients a direct path through the network, making very deep models trainable',
            'They reduce parameter count',
            'They eliminate the need for activation functions',
            'They quantize the activations',
          ],
          correct: 0,
          explanation:
            'With x + f(x), the gradient of the identity branch is 1 — signal reaches early layers undiminished no matter the depth. Transformers are towers of residual blocks for exactly this reason.',
        },
        {
          question: 'Your loss curve shows a sudden spike to NaN mid-training. Which is the LEAST likely cause?',
          options: [
            'The validation set contains examples not seen in training',
            'Learning rate too high causing divergence',
            'Numerical overflow (e.g., exp of a huge logit) somewhere in the loss',
            'A bad batch with corrupted/extreme values',
          ],
          correct: 0,
          explanation:
            'Unseen validation examples are normal and don’t affect the training loss at all. The other three are classic NaN sources: divergence, overflow, and data issues.',
        },
      ],
    },
    {
      id: 'pytorch',
      title: 'PyTorch in Practice',
      summary:
        'Map everything you built by hand onto the framework the industry uses. Tensors are NumPy arrays with gradients; nn.Module packages your layers; the training loop is the one you already wrote. After this lesson you can read most open-source model code.',
      objectives: [
        'Translate the manual training loop into idiomatic PyTorch',
        'Explain what loss.backward() and optimizer.step() do under the hood (you built them!)',
        'Read an nn.Module definition and predict tensor shapes through it',
      ],
      resources: [
        {
          type: 'docs',
          title: 'Learn the Basics — official PyTorch tutorial',
          url: 'https://pytorch.org/tutorials/beginner/basics/intro.html',
          author: 'PyTorch',
          duration: '2–3h hands-on',
          description: 'Tensors → datasets → model → autograd → optimization. Do all of it.',
        },
        {
          type: 'video',
          title: 'Building makemore Part 2: MLP',
          url: 'https://www.youtube.com/watch?v=TCH_1BHY58I',
          author: 'Andrej Karpathy',
          duration: '1h 15min',
          description: 'Implements a paper (Bengio et al. 2003) in PyTorch from scratch — the workflow you’re aiming for.',
        },
        {
          type: 'course',
          title: 'Practical Deep Learning for Coders',
          url: 'https://course.fast.ai/',
          author: 'fast.ai (Jeremy Howard)',
          duration: 'full course — optional track',
          description: 'A top-down alternative: train state-of-the-art models first, dig into theory later. Excellent if you learn by doing.',
        },
      ],
      quiz: [
        {
          question: 'What does loss.backward() do in PyTorch?',
          options: [
            'Runs reverse-mode autodiff through the recorded computation graph, populating .grad on every parameter',
            'Applies the optimizer update to the weights',
            'Computes the loss on the validation set',
            'Resets the model to its previous checkpoint',
          ],
          correct: 0,
          explanation:
            'Exactly what your micrograd backward() did: topological sort + chain rule, filling param.grad. The optimizer step is separate — optimizer.step() consumes those grads.',
        },
        {
          question: 'Why must you call optimizer.zero_grad() each iteration?',
          options: [
            'Because .grad accumulates across backward() calls by design — without zeroing, you’d apply stale summed gradients',
            'To free GPU memory used by activations',
            'To reset the learning rate schedule',
            'To detach the computation graph from the previous epoch',
          ],
          correct: 0,
          explanation:
            'You proved this in the micrograd challenge: grads use +=. Accumulation is a feature (e.g., gradient accumulation for large effective batches) but means you must explicitly zero between steps.',
        },
        {
          question: 'model.eval() and torch.no_grad() differ in that…',
          options: [
            'eval() switches layer behavior (dropout off, batchnorm uses running stats) while no_grad() disables gradient tracking — you typically want both at inference',
            'They are aliases for the same operation',
            'eval() disables gradients and no_grad() disables dropout',
            'no_grad() can only be used during training',
          ],
          correct: 0,
          explanation:
            'Two orthogonal switches: one changes module semantics, the other stops autograd bookkeeping (saving memory and compute). Forgetting eval() is a classic source of nondeterministic inference bugs.',
        },
        {
          question: 'nn.Linear(512, 256) applied to a tensor of shape (batch=8, seq=10, 512) produces shape…',
          options: ['(8, 10, 256) — Linear applies to the last dimension', '(8, 256)', '(8, 10, 512)', 'an error — Linear requires 2-D input'],
          correct: 0,
          explanation:
            'nn.Linear acts on the final dimension and broadcasts over all leading dimensions. This is why the same Linear works for batched sequences in transformers.',
        },
      ],
    },
  ],
};
