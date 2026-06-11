import type { Module } from '../types';

export const m1: Module = {
  id: 'foundations',
  title: 'Foundations: Math & Python for ML',
  tagline: 'The minimum math and tooling you need — no PhD required.',
  description:
    'You do not need a math degree to be an AI engineer, but you do need intuition for vectors, gradients, and probability — they are the vocabulary of every model you will touch. This module builds that intuition visually, then gets you fluent in NumPy, the lingua franca of ML code.',
  lessons: [
    {
      id: 'linear-algebra',
      title: 'Linear Algebra Essentials',
      summary:
        'Everything in ML is a tensor: embeddings are vectors, weights are matrices, and a forward pass is just matrix multiplication. This lesson builds geometric intuition for vectors, dot products, and matrix transforms — the single highest-leverage math topic for understanding neural networks.',
      objectives: [
        'Interpret vectors as points/directions and matrices as transformations',
        'Explain what a dot product measures and why it shows up in attention and embeddings',
        'Trace the shapes through a matrix multiplication (the #1 practical skill)',
      ],
      resources: [
        {
          type: 'video',
          title: 'Essence of Linear Algebra (chapters 1–4 minimum)',
          url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
          author: '3Blue1Brown',
          duration: '~3h playlist',
          description: 'The gold-standard visual intuition for vectors, span, matrices, and matrix multiplication.',
        },
        {
          type: 'article',
          title: 'Linear Algebra Review and Reference',
          url: 'https://cs229.stanford.edu/section/cs229-linalg.pdf',
          author: 'Stanford CS229',
          duration: '30 pages',
          description: 'A dense written reference — skim now, return to it whenever notation trips you up.',
        },
        {
          type: 'article',
          title: 'The Matrix Calculus You Need For Deep Learning',
          url: 'https://explained.ai/matrix-calculus/',
          author: 'Terence Parr & Jeremy Howard',
          duration: '60 min',
          description: 'Optional deeper dive; sections 1–3 are enough at this stage.',
        },
      ],
      quiz: [
        {
          question: 'The dot product of two vectors is large and positive when the vectors…',
          options: [
            'point in similar directions',
            'are perpendicular',
            'point in opposite directions',
            'have different numbers of dimensions',
          ],
          correct: 0,
          explanation:
            'a·b = |a||b|cos(θ). When vectors align, cos(θ) ≈ 1 and the product is large and positive. This is exactly why dot products measure similarity between embeddings.',
        },
        {
          question: 'You multiply a (32, 768) matrix by a (768, 4096) matrix. What is the output shape?',
          options: ['(32, 4096)', '(768, 768)', '(4096, 32)', 'The shapes are incompatible'],
          correct: 0,
          explanation:
            '(m, k) @ (k, n) → (m, n). The inner dimensions (768) must match and disappear. Shape-tracing like this is how you debug 90% of model code.',
        },
        {
          question: 'In a neural network layer y = Wx, what is the matrix W conceptually doing?',
          options: [
            'Applying a linear transformation that maps the input space to a new space',
            'Sorting the input values',
            'Storing the training data',
            'Normalizing the input to sum to 1',
          ],
          correct: 0,
          explanation:
            'A matrix is a linear map: it rotates/scales/shears the input space. Learning = finding the transformation that makes the data separable or predictable.',
        },
        {
          question: 'Why do embedding similarity systems often use cosine similarity instead of the raw dot product?',
          options: [
            'Cosine similarity ignores vector magnitude, so document length doesn’t dominate the score',
            'Cosine similarity is faster to compute',
            'Dot products can’t be computed on floats',
            'Cosine similarity works on matrices, dot product only on vectors',
          ],
          correct: 0,
          explanation:
            'Cosine similarity is the dot product of normalized vectors — it measures direction only, so a long document and a short query can still match well.',
        },
      ],
      challenge: {
        title: 'Dot Product & Matrix Multiply',
        difficulty: 'Easy',
        connection:
          'The lesson’s core claim is that neural networks are matrix multiplication. Prove it to yourself: these ten lines are the same operations PyTorch dispatches to a GPU — every attention score and layer output later in this course is built from the dot products you write here.',
        description:
          'Implement the two operations that power every neural network, in pure Python.\n\nWrite `dot(a, b)` that returns the dot product of two equal-length lists of numbers.\n\nWrite `matmul(A, B)` that multiplies matrix A (list of rows) by matrix B and returns the result as a list of rows. You may assume the shapes are compatible: A is (m, k) and B is (k, n).',
        examples: [
          { input: 'dot([1, 2, 3], [4, 5, 6])', output: '32', explanation: '1*4 + 2*5 + 3*6 = 32' },
          {
            input: 'matmul([[1, 2]], [[3], [4]])',
            output: '[[11]]',
            explanation: '(1,2) @ (2,1) -> (1,1): 1*3 + 2*4 = 11',
          },
        ],
        starterCode:
          'def dot(a, b):\n    # Return the dot product of two equal-length lists.\n    pass\n\n\ndef matmul(A, B):\n    # A is (m, k) as a list of rows; B is (k, n) as a list of rows.\n    # Return the (m, n) product as a list of rows.\n    pass\n',
        solution:
          'def dot(a, b):\n    return sum(x * y for x, y in zip(a, b))\n\n\ndef matmul(A, B):\n    m, k, n = len(A), len(B), len(B[0])\n    out = [[0] * n for _ in range(m)]\n    for i in range(m):\n        for j in range(n):\n            out[i][j] = sum(A[i][p] * B[p][j] for p in range(k))\n    return out\n',
        testCode:
          'def t1():\n    assert dot([1, 2, 3], [4, 5, 6]) == 32, f"expected 32, got {dot([1,2,3],[4,5,6])}"\n__check("dot([1,2,3],[4,5,6]) == 32", t1)\n\ndef t2():\n    assert dot([0, 0], [5, 7]) == 0\n__check("dot with zero vector == 0", t2)\n\ndef t3():\n    assert abs(dot([0.5, -1.5], [2.0, 2.0]) - (-2.0)) < 1e-9\n__check("dot works with floats and negatives", t3)\n\ndef t4():\n    assert matmul([[1, 2]], [[3], [4]]) == [[11]]\n__check("matmul (1,2)@(2,1) == [[11]]", t4)\n\ndef t5():\n    A = [[1, 2], [3, 4]]\n    B = [[5, 6], [7, 8]]\n    assert matmul(A, B) == [[19, 22], [43, 50]]\n__check("matmul 2x2 case", t5)\n\ndef t6():\n    A = [[1, 0, 2], [-1, 3, 1]]\n    B = [[3, 1], [2, 1], [1, 0]]\n    assert matmul(A, B) == [[5, 1], [4, 2]]\n__check("matmul (2,3)@(3,2) case", t6)\n',
        hints: [
          'dot: pair elements with zip(a, b), multiply each pair, sum the results.',
          'matmul: out[i][j] is the dot product of row i of A with column j of B. Column j of B is [B[p][j] for p in range(len(B))].',
        ],
      },
    },
    {
      id: 'calculus-gradients',
      title: 'Calculus & Gradients',
      summary:
        'Training a model means minimizing a loss function, and gradients tell you which direction to move. You need exactly one idea from calculus: the derivative as "how much does the output change if I nudge this input" — plus the chain rule, which is all backpropagation is.',
      objectives: [
        'Read a derivative as sensitivity: ∂loss/∂w = "how much loss changes per unit of w"',
        'Apply the chain rule through composed functions',
        'Explain gradient descent in one sentence',
      ],
      resources: [
        {
          type: 'video',
          title: 'Essence of Calculus (chapters 1–4)',
          url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr',
          author: '3Blue1Brown',
          duration: '~1.5h for ch. 1–4',
          description: 'Visual derivatives and the chain rule — the only parts of calculus that deep learning uses daily.',
        },
        {
          type: 'video',
          title: 'Gradient descent, how neural networks learn',
          url: 'https://www.youtube.com/watch?v=IHZwWFHWa-w',
          author: '3Blue1Brown',
          duration: '21 min',
          description: 'Chapter 2 of the neural networks series — gradient descent explained visually.',
        },
      ],
      quiz: [
        {
          question: 'If ∂loss/∂w = -3.0 for some weight w, what does gradient descent do to w?',
          options: [
            'Increases w, because moving against a negative gradient decreases the loss',
            'Decreases w, because the gradient is negative',
            'Sets w to zero',
            'Leaves w unchanged until the gradient is positive',
          ],
          correct: 0,
          explanation:
            'Update rule: w ← w − lr·grad. With grad = −3, w ← w + 3·lr, so w increases. Negative gradient means "increasing w decreases loss," so we increase w.',
        },
        {
          question: 'You have y = f(g(x)). The chain rule says dy/dx equals…',
          options: [
            "f'(g(x)) · g'(x)",
            "f'(x) + g'(x)",
            "f'(x) · g(x)",
            "f(g'(x))",
          ],
          correct: 0,
          explanation:
            'Derivatives of composed functions multiply: the local derivative of the outer function (evaluated at the inner value) times the derivative of the inner. Backprop is just this, applied through every layer.',
        },
        {
          question: 'Why does deep learning use the *gradient* (vector of partial derivatives) rather than trying all weight perturbations?',
          options: [
            'The gradient gives the locally steepest descent direction for all millions of weights in one backward pass',
            'Random perturbation cannot decrease a loss function',
            'Gradients are exact while perturbations are approximate, and exactness is required',
            'GPUs cannot generate random numbers efficiently',
          ],
          correct: 0,
          explanation:
            'Perturbing each of N weights separately costs N forward passes. Backprop computes all N partial derivatives in roughly one forward + one backward pass — that efficiency is why deep learning is feasible at all.',
        },
        {
          question: 'The learning rate is too high. What do you most likely observe?',
          options: [
            'The loss oscillates or diverges instead of steadily decreasing',
            'Training is slow but stable',
            'The model underfits but the loss curve is smooth',
            'Nothing — learning rate only affects memory usage',
          ],
          correct: 0,
          explanation:
            'Big steps overshoot the minimum, so the loss bounces around or explodes. Too-low learning rates give the opposite symptom: smooth but painfully slow descent.',
        },
      ],
      challenge: {
        title: 'Numerical Gradient',
        difficulty: 'Easy',
        connection:
          '3Blue1Brown showed gradient descent as "roll downhill". Here you compute that slope numerically — the exact technique (gradient checking) engineers use to verify backprop implementations, and the brute-force version of what autograd will do analytically when you build it in Module 3.',
        description:
          'Before trusting backprop, engineers verify it against the numerical gradient — a brute-force estimate from the definition of the derivative.\n\nImplement `numerical_gradient(f, x, h=1e-5)` using the central difference formula: `(f(x + h) - f(x - h)) / (2 * h)`, where `f` is a function of a single float `x`.\n\nThen implement `gradient_descent_step(f, x, lr)` that returns `x` after one gradient-descent update using your numerical gradient.',
        examples: [
          { input: 'numerical_gradient(lambda x: x**2, 3.0)', output: '≈ 6.0', explanation: 'd/dx of x² is 2x = 6 at x=3' },
          { input: 'gradient_descent_step(lambda x: x**2, 3.0, lr=0.1)', output: '≈ 2.4', explanation: 'x − lr·grad = 3 − 0.1·6' },
        ],
        starterCode:
          'def numerical_gradient(f, x, h=1e-5):\n    # Central difference: (f(x+h) - f(x-h)) / (2h)\n    pass\n\n\ndef gradient_descent_step(f, x, lr):\n    # Return x after one update: x - lr * gradient\n    pass\n',
        solution:
          'def numerical_gradient(f, x, h=1e-5):\n    return (f(x + h) - f(x - h)) / (2 * h)\n\n\ndef gradient_descent_step(f, x, lr):\n    return x - lr * numerical_gradient(f, x)\n',
        testCode:
          'import math\n\ndef t1():\n    g = numerical_gradient(lambda x: x ** 2, 3.0)\n    assert abs(g - 6.0) < 1e-3, f"expected ~6.0, got {g}"\n__check("gradient of x^2 at x=3 is ~6", t1)\n\ndef t2():\n    g = numerical_gradient(math.sin, 0.0)\n    assert abs(g - 1.0) < 1e-3, f"expected ~1.0, got {g}"\n__check("gradient of sin at 0 is ~1", t2)\n\ndef t3():\n    g = numerical_gradient(lambda x: 5.0, 2.0)\n    assert abs(g) < 1e-6, f"expected ~0, got {g}"\n__check("gradient of a constant is 0", t3)\n\ndef t4():\n    x = gradient_descent_step(lambda x: x ** 2, 3.0, lr=0.1)\n    assert abs(x - 2.4) < 1e-3, f"expected ~2.4, got {x}"\n__check("one GD step on x^2 from x=3, lr=0.1 -> ~2.4", t4)\n\ndef t5():\n    x = 3.0\n    for _ in range(200):\n        x = gradient_descent_step(lambda v: (v - 1.0) ** 2, x, lr=0.1)\n    assert abs(x - 1.0) < 1e-3, f"expected convergence to 1.0, got {x}"\n__check("repeated GD steps converge to the minimum", t5)\n',
        hints: [
          'The central difference is more accurate than the one-sided (f(x+h) − f(x)) / h.',
          'A gradient descent step is literally one line: x − lr · gradient.',
        ],
      },
    },
    {
      id: 'probability',
      title: 'Probability & Statistics for ML',
      summary:
        'Models output probability distributions — an LLM is literally a next-token distribution. This lesson covers the handful of concepts you will meet constantly: distributions, expectation, conditional probability, and why "maximizing likelihood" is the training objective behind cross-entropy loss.',
      objectives: [
        'Read P(y|x) as "distribution over outputs given input" — the type signature of most models',
        'Explain expectation and variance informally',
        'Connect maximum likelihood to minimizing cross-entropy / negative log-likelihood',
      ],
      resources: [
        {
          type: 'video',
          title: 'StatQuest: Statistics Fundamentals',
          url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9',
          author: 'StatQuest (Josh Starmer)',
          duration: 'playlist — pick what you need',
          description: 'Short, friendly explainers. Watch: distributions, expected values, and maximum likelihood.',
        },
        {
          type: 'article',
          title: 'Probability Theory Review',
          url: 'https://cs229.stanford.edu/section/cs229-prob.pdf',
          author: 'Stanford CS229',
          duration: '12 pages',
          description: 'Compact reference for notation: random variables, conditional probability, expectation.',
        },
        {
          type: 'video',
          title: 'But what is the Central Limit Theorem?',
          url: 'https://www.youtube.com/watch?v=zeJD6dqJ5lo',
          author: '3Blue1Brown',
          duration: '31 min',
          description: 'Optional but excellent — why Gaussians appear everywhere.',
        },
      ],
      quiz: [
        {
          question: 'A language model computes P(next token | previous tokens). What kind of object is its output for one step?',
          options: [
            'A probability distribution over the entire vocabulary',
            'A single word',
            'A boolean indicating if the sentence is grammatical',
            'An unbounded score with no constraints',
          ],
          correct: 0,
          explanation:
            'The model outputs one probability per vocabulary token (tens of thousands of values summing to 1). Decoding strategies like sampling or greedy pick from this distribution.',
        },
        {
          question: 'Cross-entropy loss for classification is equivalent to…',
          options: [
            'Maximizing the likelihood of the correct labels (minimizing negative log-likelihood)',
            'Minimizing the squared distance between logits and labels',
            'Maximizing the entropy of the model’s predictions',
            'Counting the number of misclassified examples',
          ],
          correct: 0,
          explanation:
            'Cross-entropy = −log P(correct class). Minimizing it pushes the model to assign high probability to observed data — exactly maximum likelihood estimation.',
        },
        {
          question: 'Your model is 99% accurate on a dataset where 99% of examples are class "negative." What should you check first?',
          options: [
            'Whether it just predicts "negative" for everything — accuracy is misleading under class imbalance',
            'Whether the learning rate is too low',
            'Whether the model has too many parameters',
            'Nothing — 99% accuracy means the model is excellent',
          ],
          correct: 0,
          explanation:
            'A constant "negative" predictor also scores 99% here. Under imbalance, look at precision, recall, and the confusion matrix instead of raw accuracy.',
        },
      ],
    },
    {
      id: 'numpy-vectorization',
      title: 'NumPy & Vectorization',
      summary:
        'NumPy array manipulation is the dialect that PyTorch, JAX, and TensorFlow all inherit. If you can think in shapes, broadcasting, and vectorized operations instead of for-loops, every ML codebase becomes readable. This is the most directly transferable skill in the module.',
      objectives: [
        'Manipulate arrays by shape: reshape, transpose, sum along an axis',
        'Predict broadcasting behavior between mismatched shapes',
        'Replace explicit loops with vectorized expressions',
      ],
      resources: [
        {
          type: 'video',
          title: 'Python NumPy Tutorial for Beginners',
          url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
          author: 'freeCodeCamp',
          duration: '~1h',
          description: 'Hands-on walkthrough of arrays, indexing, reshaping, and broadcasting. Code along.',
        },
        {
          type: 'docs',
          title: 'NumPy: the absolute basics for beginners',
          url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
          author: 'NumPy',
          duration: '45 min',
          description: 'Official tutorial — arrays, indexing, broadcasting.',
        },
        {
          type: 'article',
          title: 'From Python to NumPy',
          url: 'https://www.labri.fr/perso/nrougier/from-python-to-numpy/',
          author: 'Nicolas Rougier',
          duration: 'book, skim ch. 1–3',
          description: 'The art of vectorization — turning loops into array expressions.',
        },
        {
          type: 'course',
          title: 'CS231n Python/NumPy tutorial',
          url: 'https://cs231n.github.io/python-numpy-tutorial/',
          author: 'Stanford CS231n',
          duration: '30 min',
          description: 'The classic crash course used by Stanford’s deep learning class.',
        },
      ],
      quiz: [
        {
          question: 'You have `a` with shape (3, 4) and `b` with shape (4,). What does `a + b` do?',
          options: [
            'Broadcasts b across each of the 3 rows of a, giving shape (3, 4)',
            'Raises an error because the shapes differ',
            'Concatenates them into shape (3, 5)',
            'Adds only the first 4 elements of a',
          ],
          correct: 0,
          explanation:
            'Broadcasting aligns trailing dimensions: (3,4) + (4,) → b is treated as a row repeated 3 times. This pattern (adding a bias vector to a batch) is everywhere in ML code.',
        },
        {
          question: '`x.sum(axis=0)` on a (batch=32, features=768) array returns shape…',
          options: ['(768,) — it sums over the batch dimension', '(32,) — it sums over features', '() — a single scalar', '(32, 768) — unchanged'],
          correct: 0,
          explanation:
            'axis=0 collapses the first dimension (the batch), leaving one summed value per feature. Remember: the axis you pass is the axis that disappears.',
        },
        {
          question: 'Why is vectorized NumPy code typically 10–100x faster than equivalent Python loops?',
          options: [
            'The work happens in optimized compiled C/SIMD code over contiguous memory instead of the Python interpreter',
            'NumPy automatically runs on a GPU',
            'NumPy caches the result of every operation',
            'Python loops are re-parsed on every iteration',
          ],
          correct: 0,
          explanation:
            'Each Python loop iteration pays interpreter and object overhead. NumPy executes one compiled routine over a contiguous buffer — the same reason PyTorch ops are fast, and on GPUs the gap grows even larger.',
        },
      ],
      challenge: {
        title: 'Numerically Stable Softmax',
        difficulty: 'Medium',
        connection:
          'This is the vectorization lesson applied: no loops, just array operations and broadcasting. Softmax is also a function you will reuse twice in Module 4 (inside attention, and again in sampling) — and the max-subtraction trick is the canonical example of why numerical stability matters in ML code.',
        description:
          'Softmax converts raw model scores (logits) into a probability distribution — it is the final step of every classifier and every LLM\'s next-token prediction.\n\nImplement `softmax(x)` for a 1-D NumPy array: `softmax(x)[i] = exp(x[i]) / sum(exp(x))`.\n\nThe catch: `np.exp(1000)` overflows to infinity. Use the standard stability trick — subtract `max(x)` from every element first (this doesn\'t change the result, since softmax is invariant to constant shifts).',
        examples: [
          { input: 'softmax(np.array([1.0, 2.0, 3.0]))', output: '[0.0900, 0.2447, 0.6652]' },
          { input: 'softmax(np.array([1000.0, 1000.0]))', output: '[0.5, 0.5]', explanation: 'Must not overflow to NaN.' },
        ],
        starterCode:
          'import numpy as np\n\ndef softmax(x):\n    # x: 1-D numpy array of logits.\n    # Return a same-shape array of probabilities that sums to 1.\n    # Must be numerically stable for large values.\n    pass\n',
        solution:
          'import numpy as np\n\ndef softmax(x):\n    z = x - np.max(x)\n    e = np.exp(z)\n    return e / e.sum()\n',
        testCode:
          'import numpy as np\n\ndef t1():\n    out = softmax(np.array([1.0, 2.0, 3.0]))\n    expected = np.array([0.09003057, 0.24472847, 0.66524096])\n    assert np.allclose(out, expected, atol=1e-6), f"got {out}"\n__check("softmax([1,2,3]) matches expected values", t1)\n\ndef t2():\n    out = softmax(np.array([5.0, 5.0, 5.0, 5.0]))\n    assert np.allclose(out, 0.25), f"got {out}"\n__check("equal logits give uniform distribution", t2)\n\ndef t3():\n    out = softmax(np.array([1000.0, 1000.0]))\n    assert not np.any(np.isnan(out)), "overflowed to NaN — subtract max(x) first"\n    assert np.allclose(out, [0.5, 0.5]), f"got {out}"\n__check("stable for huge logits (no NaN)", t3)\n\ndef t4():\n    out = softmax(np.array([3.0, -1.0, 0.5, 2.2]))\n    assert abs(out.sum() - 1.0) < 1e-9, f"sums to {out.sum()}"\n    assert np.all(out > 0)\n__check("output is a valid probability distribution", t4)\n\ndef t5():\n    a = softmax(np.array([1.0, 2.0]))\n    b = softmax(np.array([101.0, 102.0]))\n    assert np.allclose(a, b, atol=1e-9), "softmax should be shift-invariant"\n__check("shift invariance: softmax(x) == softmax(x + c)", t5)\n',
        packages: ['numpy'],
        hints: [
          'exp(x − max(x)) keeps every exponent ≤ 0, so nothing overflows.',
          'Three lines: shift, exponentiate, normalize by the sum.',
        ],
      },
    },
  ],
};
