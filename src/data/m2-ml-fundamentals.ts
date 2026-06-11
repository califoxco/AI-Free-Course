import type { Module } from '../types';

export const m2: Module = {
  id: 'ml-fundamentals',
  title: 'Machine Learning Fundamentals',
  tagline: 'Loss functions, training loops, and the vocabulary of every ML conversation.',
  description:
    'Before transformers, learn the mental model that all of ML shares: define a model, define a loss, optimize. This module covers supervised learning, regression and classification, overfitting, and evaluation metrics — concepts you will use daily even if you never train a classical model.',
  lessons: [
    {
      id: 'what-is-ml',
      title: 'The ML Mindset: Learning from Data',
      summary:
        'Software engineering is writing rules; machine learning is letting data write the rules. This lesson establishes the core framing — model, parameters, loss, optimization — and the taxonomy (supervised, unsupervised, reinforcement) you need to navigate the field.',
      objectives: [
        'Contrast rule-based programming with learned functions',
        'Define model, parameters, loss, and training in one sentence each',
        'Classify problems as supervised / unsupervised / reinforcement learning',
      ],
      resources: [
        {
          type: 'course',
          title: 'Machine Learning Specialization, Course 1 (Week 1)',
          url: 'https://www.coursera.org/specializations/machine-learning-introduction',
          author: 'Andrew Ng / DeepLearning.AI',
          duration: 'free to audit',
          description: 'The canonical gentle introduction. Week 1 covers exactly this lesson’s scope.',
        },
        {
          type: 'video',
          title: 'StatQuest: A Gentle Introduction to Machine Learning',
          url: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI',
          author: 'StatQuest',
          duration: '12 min',
          description: 'The big picture in 12 minutes.',
        },
        {
          type: 'article',
          title: 'Rules of Machine Learning',
          url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
          author: 'Martin Zinkevich (Google)',
          duration: '45 min',
          description: 'Battle-tested engineering wisdom — read Phase I now, the rest later in your journey.',
        },
      ],
      quiz: [
        {
          question: 'What fundamentally distinguishes machine learning from traditional programming?',
          options: [
            'The mapping from inputs to outputs is learned from data rather than hand-coded as rules',
            'ML programs run on GPUs while traditional programs run on CPUs',
            'ML can only solve classification problems',
            'ML programs do not require any code',
          ],
          correct: 0,
          explanation:
            'In traditional code you write f(x) explicitly. In ML you choose a parameterized family of functions and let optimization find the parameters that fit example (x, y) pairs.',
        },
        {
          question: 'Predicting a house price from its features, given a dataset of past sales with prices, is…',
          options: [
            'Supervised learning (regression)',
            'Supervised learning (classification)',
            'Unsupervised learning',
            'Reinforcement learning',
          ],
          correct: 0,
          explanation:
            'Labels (prices) are provided → supervised. The target is a continuous number → regression. If you predicted "will sell above asking: yes/no" it would be classification.',
        },
        {
          question: 'Which statement about the loss function is true?',
          options: [
            'It quantifies how wrong the model is, giving optimization a target to minimize',
            'It measures how long training takes',
            'It is only used at inference time',
            'It must always be between 0 and 1',
          ],
          correct: 0,
          explanation:
            'The loss turns "being wrong" into a differentiable number. Training is just: adjust parameters to make this number smaller on the training data.',
        },
        {
          question: 'LLM pretraining (predict the next token in web text) is best described as…',
          options: [
            'Self-supervised learning — the labels come from the data itself',
            'Reinforcement learning — the model gets rewards from users',
            'Unsupervised clustering of documents',
            'Supervised learning with human-written labels for every token',
          ],
          correct: 0,
          explanation:
            'No human labels the data: the "label" for each position is simply the next token already present in the text. That trick is what lets LLMs train on internet-scale data.',
        },
      ],
    },
    {
      id: 'regression-loss',
      title: 'Linear Models, Loss Functions & Gradient Descent',
      summary:
        'Linear regression is the "hello world" of trainable models, and it contains the entire deep learning workflow in miniature: forward pass, loss, gradients, update loop. Internalize it here at small scale — GPT training is this exact loop with a fancier model.',
      objectives: [
        'Write the MSE loss and derive its gradient for a linear model',
        'Implement a full training loop from scratch',
        'Recognize that deep learning reuses this loop unchanged',
      ],
      resources: [
        {
          type: 'video',
          title: 'StatQuest: Linear Regression, Clearly Explained',
          url: 'https://www.youtube.com/watch?v=nk2CQITm_eo',
          author: 'StatQuest',
          duration: '27 min',
          description: 'Least squares and R² with zero hand-waving.',
        },
        {
          type: 'video',
          title: 'StatQuest: Gradient Descent, Step-by-Step',
          url: 'https://www.youtube.com/watch?v=sDv4f4s2SB8',
          author: 'StatQuest',
          duration: '23 min',
          description: 'Walks the exact algorithm you will implement in this lesson’s challenge.',
        },
        {
          type: 'course',
          title: 'CS229 Lecture Notes: Supervised Learning & LMS',
          url: 'https://cs229.stanford.edu/main_notes.pdf',
          author: 'Stanford CS229',
          duration: 'ch. 1, ~20 pages',
          description: 'The rigorous version, if you want the math spelled out.',
        },
      ],
      quiz: [
        {
          question: 'For linear regression with MSE loss, the gradient ∂L/∂w for prediction ŷ = wx + b is proportional to…',
          options: [
            'the error (ŷ − y) times the input x, averaged over examples',
            'the error (ŷ − y) alone, ignoring x',
            'the input x alone, ignoring the error',
            'the second derivative of the loss',
          ],
          correct: 0,
          explanation:
            'L = (wx + b − y)²; chain rule gives ∂L/∂w = 2(ŷ − y)·x. The "error × input" pattern reappears in backprop through every linear layer.',
        },
        {
          question: 'Why is MSE a poor loss for classification, leading us to cross-entropy instead?',
          options: [
            'Cross-entropy treats outputs as probabilities and penalizes confident wrong answers much more sharply, giving better-behaved gradients',
            'MSE cannot be differentiated',
            'Cross-entropy is faster to compute than MSE',
            'MSE only works when inputs are images',
          ],
          correct: 0,
          explanation:
            'With sigmoid/softmax outputs, MSE produces tiny gradients exactly when the model is confidently wrong (saturation). Cross-entropy’s log term keeps the gradient strong, so learning doesn’t stall.',
        },
        {
          question: 'During training the loss decreases for a while and then plateaus at a high value. Which is NOT a plausible cause?',
          options: [
            'The test set is too small',
            'The learning rate is too low to make further progress',
            'The model lacks capacity to fit the data pattern',
            'The features don’t contain enough signal to predict the target',
          ],
          correct: 0,
          explanation:
            'A plateauing *training* loss is about optimization and model capacity — the test set isn’t involved in training at all. The other three directly limit how low training loss can go.',
        },
      ],
      challenge: {
        title: 'Train Linear Regression with Gradient Descent',
        difficulty: 'Medium',
        connection:
          'The lesson described the training loop: predict → loss → gradient → update. Now implement it end to end. This is not a toy — GPT training is this exact loop with a bigger model inside. Internalize it here, where you can see every moving part.',
        description:
          'Implement the complete training loop — the same loop that trains GPT, at 1/1,000,000,000 scale.\n\nWrite `train(xs, ys, lr, steps)` that fits `y = w*x + b` by gradient descent on MSE loss and returns the tuple `(w, b)`.\n\nStart from `w = 0.0, b = 0.0`. For each step, compute predictions, then the gradients over the full dataset:\n\n`dw = (2/n) * sum((pred_i - y_i) * x_i)`\n\n`db = (2/n) * sum(pred_i - y_i)`\n\nthen update `w -= lr * dw` and `b -= lr * db`.',
        examples: [
          {
            input: 'train([0, 1, 2, 3], [1, 3, 5, 7], lr=0.05, steps=2000)',
            output: '(≈2.0, ≈1.0)',
            explanation: 'The data follows y = 2x + 1.',
          },
        ],
        starterCode:
          'def train(xs, ys, lr, steps):\n    w, b = 0.0, 0.0\n    n = len(xs)\n    for _ in range(steps):\n        # 1. predictions: w * x + b for each x\n        # 2. gradients dw, db (formulas in the description)\n        # 3. update w and b\n        pass\n    return w, b\n',
        solution:
          'def train(xs, ys, lr, steps):\n    w, b = 0.0, 0.0\n    n = len(xs)\n    for _ in range(steps):\n        preds = [w * x + b for x in xs]\n        errs = [p - y for p, y in zip(preds, ys)]\n        dw = (2 / n) * sum(e * x for e, x in zip(errs, xs))\n        db = (2 / n) * sum(errs)\n        w -= lr * dw\n        b -= lr * db\n    return w, b\n',
        testCode:
          'def t1():\n    w, b = train([0, 1, 2, 3], [1, 3, 5, 7], lr=0.05, steps=2000)\n    assert abs(w - 2.0) < 0.05, f"w should be ~2.0, got {w}"\n    assert abs(b - 1.0) < 0.05, f"b should be ~1.0, got {b}"\n__check("fits y = 2x + 1", t1)\n\ndef t2():\n    w, b = train([1, 2, 3, 4, 5], [5, 5, 5, 5, 5], lr=0.05, steps=2000)\n    assert abs(w) < 0.05, f"w should be ~0, got {w}"\n    assert abs(b - 5.0) < 0.1, f"b should be ~5, got {b}"\n__check("fits a constant function y = 5", t2)\n\ndef t3():\n    w, b = train([0, 1, 2], [4, 1, -2], lr=0.05, steps=3000)\n    assert abs(w - (-3.0)) < 0.05, f"w should be ~-3, got {w}"\n    assert abs(b - 4.0) < 0.05, f"b should be ~4, got {b}"\n__check("fits a negative slope y = -3x + 4", t3)\n\ndef t4():\n    w, b = train([0, 1], [0, 1], lr=0.1, steps=0)\n    assert w == 0.0 and b == 0.0, "with 0 steps, parameters must stay at initialization"\n__check("zero steps leaves parameters at init", t4)\n',
        hints: [
          'Compute all predictions first, then the shared error terms (pred − y), then both gradients from those.',
          'Make sure you update w and b *after* computing both gradients — updating w first would corrupt db.',
        ],
      },
    },
    {
      id: 'overfitting',
      title: 'Overfitting, Generalization & the Train/Val/Test Split',
      summary:
        'A model that memorizes training data and fails on new data is worthless — and this failure mode is the central villain of all ML. Learn to detect it (train/validation gap), prevent it (regularization, more data, early stopping), and never leak test data into training decisions.',
      objectives: [
        'Diagnose overfitting vs underfitting from loss curves',
        'Explain why a held-out validation set is needed for hyperparameter tuning',
        'Name the standard mitigations: regularization, dropout, early stopping, more data',
      ],
      resources: [
        {
          type: 'video',
          title: 'StatQuest: Machine Learning Fundamentals — Bias and Variance',
          url: 'https://www.youtube.com/watch?v=EuBBz3bI-aA',
          author: 'StatQuest',
          duration: '6 min',
          description: 'The bias/variance tradeoff in 6 minutes.',
        },
        {
          type: 'article',
          title: 'A Recipe for Training Neural Networks',
          url: 'https://karpathy.github.io/2019/04/25/recipe/',
          author: 'Andrej Karpathy',
          duration: '25 min',
          description: 'Legendary practical guide — overfit a single batch first, regularize later. Read it twice.',
        },
        {
          type: 'course',
          title: 'Machine Learning Specialization, Course 2: Advice for Applying ML',
          url: 'https://www.coursera.org/learn/advanced-learning-algorithms',
          author: 'Andrew Ng / DeepLearning.AI',
          duration: 'free to audit',
          description: 'Week 3 covers diagnostics: learning curves, bias/variance, error analysis.',
        },
      ],
      quiz: [
        {
          question: 'Training loss keeps decreasing but validation loss starts rising. This is…',
          options: [
            'Overfitting — the model is memorizing training data instead of generalizing',
            'Underfitting — the model lacks capacity',
            'A learning rate that is too low',
            'Normal and desirable behavior',
          ],
          correct: 0,
          explanation:
            'The growing train/validation gap is the textbook signature of overfitting. Fixes: more data, regularization, dropout, early stopping, or a smaller model.',
        },
        {
          question: 'Why do you need a validation set separate from the test set?',
          options: [
            'Tuning hyperparameters against the test set leaks information into your choices, making the final test score an overestimate',
            'The test set is usually too small to compute a loss on',
            'Validation sets must contain only training examples',
            'You don’t — they are interchangeable terms',
          ],
          correct: 0,
          explanation:
            'Every time you pick a model because it scored better on a dataset, you have fit to that dataset a little. The test set must stay untouched until the very end to give an honest estimate.',
        },
        {
          question: 'Karpathy’s training recipe recommends first overfitting a single small batch. Why?',
          options: [
            'If the model can’t drive loss to ~zero on a few examples, there’s a bug — this isolates implementation errors from generalization issues',
            'Overfitting small batches is how production models are trained',
            'It makes the model converge faster on the full dataset later',
            'It estimates the final test accuracy',
          ],
          correct: 0,
          explanation:
            'A correct model+loss+optimizer should easily memorize a tiny batch. Failure means a bug (wrong labels, broken loss, frozen weights) — cheaper to find now than after a full training run.',
        },
        {
          question: 'Which of these is an example of data leakage?',
          options: [
            'Normalizing features using statistics computed over the full dataset *before* splitting into train/test',
            'Using dropout during training',
            'Shuffling the training set between epochs',
            'Evaluating the model on the test set exactly once',
          ],
          correct: 0,
          explanation:
            'The test rows influenced the mean/std used to transform training data — information flowed from test to train. Compute normalization stats on the training split only, then apply them to test.',
        },
      ],
    },
    {
      id: 'metrics',
      title: 'Evaluation Metrics: Precision, Recall & Friends',
      summary:
        'Choosing the right metric is an engineering decision with product consequences: optimizing recall on a spam filter floods inboxes; optimizing precision on a cancer screen misses patients. Master the confusion matrix — these exact metrics return later when you evaluate LLM outputs and RAG retrieval.',
      objectives: [
        'Compute precision, recall, and F1 from a confusion matrix',
        'Choose the right metric for a given product tradeoff',
        'Explain why accuracy fails under class imbalance',
      ],
      resources: [
        {
          type: 'video',
          title: 'StatQuest: The Confusion Matrix',
          url: 'https://www.youtube.com/watch?v=Kdsp6soqA7o',
          author: 'StatQuest',
          duration: '7 min',
          description: 'TP/FP/TN/FN, finally memorable.',
        },
        {
          type: 'video',
          title: 'StatQuest: ROC and AUC, Clearly Explained',
          url: 'https://www.youtube.com/watch?v=4jRBRDbJemM',
          author: 'StatQuest',
          duration: '16 min',
          description: 'Threshold-free evaluation of classifiers.',
        },
        {
          type: 'article',
          title: 'Classification: Accuracy, recall, precision, and related metrics',
          url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall',
          author: 'Google ML Crash Course',
          duration: '15 min',
          description: 'Crisp reference with worked examples.',
        },
      ],
      quiz: [
        {
          question: 'Precision answers the question…',
          options: [
            '"Of everything I flagged positive, how much was actually positive?"',
            '"Of all actual positives, how many did I find?"',
            '"How many predictions were correct overall?"',
            '"How well are probabilities calibrated?"',
          ],
          correct: 0,
          explanation:
            'Precision = TP / (TP + FP) — purity of your positive predictions. Recall = TP / (TP + FN) — coverage of actual positives. Memorize the pair.',
        },
        {
          question: 'For an early-stage cancer screening test, which error is usually more costly, and what should you prioritize?',
          options: [
            'False negatives are more costly → prioritize recall',
            'False positives are more costly → prioritize precision',
            'Both are equally costly → prioritize accuracy',
            'Neither matters → prioritize F1',
          ],
          correct: 0,
          explanation:
            'Missing a cancer (FN) is far worse than a follow-up test for a healthy patient (FP). Screening favors recall; the follow-up diagnostic stage can restore precision.',
        },
        {
          question: 'F1 is the harmonic (not arithmetic) mean of precision and recall. Why harmonic?',
          options: [
            'The harmonic mean is dragged toward the smaller value, so a model can’t score well by maxing one metric and ignoring the other',
            'It is computationally cheaper than the arithmetic mean',
            'It always equals accuracy on balanced datasets',
            'Harmonic means are required for probabilities',
          ],
          correct: 0,
          explanation:
            'Arithmetic mean of (precision=1.0, recall=0.02) is 0.51 — looks fine. Harmonic mean is ~0.04 — correctly terrible. F1 forces balance.',
        },
      ],
      challenge: {
        title: 'Precision, Recall & F1 from Scratch',
        difficulty: 'Easy',
        connection:
          'The confusion-matrix metrics from the StatQuest videos, turned into code. You will reuse these exact functions to evaluate retrieval quality in the RAG module and LLM outputs in the evals module — precision vs recall is the vocabulary of every evaluation conversation you will have at work.',
        description:
          'Implement the three classification metrics you will use for the rest of your AI career (including for evaluating RAG retrieval and LLM judges).\n\nGiven two equal-length lists of 0/1 integers, `y_true` and `y_pred`, implement `precision(y_true, y_pred)`, `recall(y_true, y_pred)`, and `f1(y_true, y_pred)`.\n\nConvention: 1 is the positive class. If a denominator is zero, return `0.0` (standard zero-division convention).',
        examples: [
          {
            input: 'y_true=[1, 0, 1, 1], y_pred=[1, 1, 0, 1]',
            output: 'precision=0.667, recall=0.667, f1=0.667',
            explanation: 'TP=2, FP=1, FN=1.',
          },
        ],
        starterCode:
          'def precision(y_true, y_pred):\n    # TP / (TP + FP); return 0.0 if no positive predictions\n    pass\n\n\ndef recall(y_true, y_pred):\n    # TP / (TP + FN); return 0.0 if no actual positives\n    pass\n\n\ndef f1(y_true, y_pred):\n    # Harmonic mean: 2*P*R / (P + R); return 0.0 if P + R == 0\n    pass\n',
        solution:
          'def precision(y_true, y_pred):\n    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)\n    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)\n    return tp / (tp + fp) if (tp + fp) > 0 else 0.0\n\n\ndef recall(y_true, y_pred):\n    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)\n    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)\n    return tp / (tp + fn) if (tp + fn) > 0 else 0.0\n\n\ndef f1(y_true, y_pred):\n    p, r = precision(y_true, y_pred), recall(y_true, y_pred)\n    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0\n',
        testCode:
          'def t1():\n    yt, yp = [1, 0, 1, 1], [1, 1, 0, 1]\n    assert abs(precision(yt, yp) - 2 / 3) < 1e-9, f"got {precision(yt, yp)}"\n__check("precision: TP=2, FP=1 -> 2/3", t1)\n\ndef t2():\n    yt, yp = [1, 0, 1, 1], [1, 1, 0, 1]\n    assert abs(recall(yt, yp) - 2 / 3) < 1e-9, f"got {recall(yt, yp)}"\n__check("recall: TP=2, FN=1 -> 2/3", t2)\n\ndef t3():\n    yt, yp = [1, 0, 1, 1], [1, 1, 0, 1]\n    assert abs(f1(yt, yp) - 2 / 3) < 1e-9, f"got {f1(yt, yp)}"\n__check("f1 of (2/3, 2/3) is 2/3", t3)\n\ndef t4():\n    yt, yp = [0, 0, 1, 1], [0, 0, 0, 0]\n    assert precision(yt, yp) == 0.0, "no positive predictions -> precision 0.0"\n    assert recall(yt, yp) == 0.0, "all positives missed -> recall 0.0"\n    assert f1(yt, yp) == 0.0\n__check("zero-division convention returns 0.0", t4)\n\ndef t5():\n    yt, yp = [1, 1, 0, 0], [1, 1, 0, 0]\n    assert precision(yt, yp) == 1.0 and recall(yt, yp) == 1.0 and f1(yt, yp) == 1.0\n__check("perfect predictions -> all metrics 1.0", t5)\n\ndef t6():\n    yt = [1, 0, 0, 0, 0]\n    yp = [1, 1, 1, 1, 1]\n    assert abs(precision(yt, yp) - 0.2) < 1e-9\n    assert recall(yt, yp) == 1.0\n__check("predict-everything-positive: recall 1.0, low precision", t6)\n',
        hints: [
          'Count TP, FP, FN by zipping y_true and y_pred.',
          'Guard each division: if the denominator is 0, return 0.0.',
        ],
      },
    },
  ],
};
