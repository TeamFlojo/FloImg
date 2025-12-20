# Pipeline Execution Engine

How imgflo analyzes dependencies and executes pipeline steps in parallel.

---

## Overview

The pipeline execution engine transforms a linear list of steps into an optimized execution plan. It:

1. **Builds a dependency graph** from input/output variable references
2. **Groups independent steps** into execution "waves"
3. **Executes waves in parallel** with bounded concurrency

This enables maximum throughput while respecting data dependencies.

---

## Dependency Graph

### How Dependencies Are Determined

Each step type has specific input/output patterns:

| Step Type | Inputs | Outputs |
|-----------|--------|---------|
| `generate` | none | `out` variable |
| `transform` | `in` variable | `out` variable |
| `save` | `in` variable | optional `out` variable |

Example pipeline:

```yaml
steps:
  - kind: generate
    generator: shapes
    params: { shape: circle }
    out: circle

  - kind: generate
    generator: qr
    params: { text: "hello" }
    out: qrcode

  - kind: transform
    in: circle
    op: resize
    params: { width: 200 }
    out: small_circle

  - kind: transform
    in: qrcode
    op: blur
    params: { sigma: 2 }
    out: blurred_qr

  - kind: composite
    in: small_circle
    overlay: blurred_qr
    out: combined

  - kind: save
    in: combined
    destination: output.png
```

The dependency graph:

```
generate(circle) ──────► transform(small_circle) ──┐
                                                   ├──► composite(combined) ──► save
generate(qrcode) ──────► transform(blurred_qr) ────┘
```

### StepNode Structure

Each step becomes a node in the dependency graph:

```typescript
interface StepNode {
  index: number;              // Original position in steps array
  step: PipelineStep;         // The step definition
  dependencies: Set<string>;  // Variable names this step requires
  outputs: string[];          // Variable names this step produces
}
```

---

## Execution Waves

### Wave Computation

Steps are grouped into waves based on when their dependencies become available:

1. **Wave 0**: Steps with no dependencies (all `generate` steps)
2. **Wave N**: Steps whose dependencies are satisfied by waves 0 through N-1

For the example above:

```
Wave 0: generate(circle), generate(qrcode)
Wave 1: transform(small_circle), transform(blurred_qr)
Wave 2: composite(combined)
Wave 3: save
```

### Algorithm

```typescript
function computeExecutionWaves(nodes: StepNode[]): ExecutionWave[] {
  const waves: ExecutionWave[] = [];
  const satisfiedOutputs = new Set<string>();
  const remainingNodes = [...nodes];

  while (remainingNodes.length > 0) {
    // Find all nodes whose dependencies are satisfied
    const ready = remainingNodes.filter(node =>
      [...node.dependencies].every(dep => satisfiedOutputs.has(dep))
    );

    if (ready.length === 0) {
      throw new Error('Circular dependency or missing input');
    }

    // Add ready nodes to current wave
    waves.push({ steps: ready });

    // Mark outputs as satisfied
    for (const node of ready) {
      for (const output of node.outputs) {
        satisfiedOutputs.add(output);
      }
    }

    // Remove processed nodes
    for (const node of ready) {
      const idx = remainingNodes.indexOf(node);
      remainingNodes.splice(idx, 1);
    }
  }

  return waves;
}
```

---

## Concurrent Execution

### Concurrency Control

Within each wave, steps execute with bounded concurrency:

```typescript
interface Pipeline {
  steps: PipelineStep[];
  concurrency?: number;  // Max parallel operations (default: Infinity)
}
```

**Examples:**

```typescript
// Unlimited parallelism (default)
client.run({ steps: [...] });

// Limit to 3 concurrent operations
client.run({ steps: [...], concurrency: 3 });

// Sequential execution
client.run({ steps: [...], concurrency: 1 });
```

### executeWithConcurrency

The core utility for bounded parallel execution:

```typescript
async function executeWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  if (concurrency === Infinity) {
    return Promise.all(tasks.map(task => task()));
  }

  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, task] of tasks.entries()) {
    const p = task().then(result => {
      results[index] = result;
    });

    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed promises
      for (let i = executing.length - 1; i >= 0; i--) {
        // Check if promise is settled by racing with resolved promise
        const settled = await Promise.race([
          executing[i].then(() => true),
          Promise.resolve(false)
        ]);
        if (settled) executing.splice(i, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}
```

---

## Execution Flow

### Full Pipeline Execution

```typescript
async run(pipeline: Pipeline): Promise<PipelineResult[]> {
  const variables = new Map<string, ImageBlob>();
  const results: PipelineResult[] = [];

  // Build dependency graph
  const nodes = buildDependencyGraph(pipeline.steps);

  // Compute execution waves
  const waves = computeExecutionWaves(nodes);

  // Execute wave by wave
  for (const wave of waves) {
    const waveResults = await executeWithConcurrency(
      wave.steps.map(node => () => this.executeStep(node.step, variables)),
      pipeline.concurrency ?? Infinity
    );

    // Collect results and update variables
    for (let i = 0; i < wave.steps.length; i++) {
      const result = waveResults[i];
      results.push(result);

      // Store output variables for later steps
      if (result.outputVariable && result.blob) {
        variables.set(result.outputVariable, result.blob);
      }
    }
  }

  return results;
}
```

### Error Detection

The wave computation algorithm detects:

**Missing inputs:**

```yaml
- kind: transform
  in: nonexistent  # Error: no step produces 'nonexistent'
  op: resize
```

**Circular dependencies:**

```yaml
- kind: transform
  in: b
  op: resize
  out: a

- kind: transform
  in: a
  op: blur
  out: b
```

Both cases throw: `Circular dependency or missing input detected in pipeline`

---

## Performance Characteristics

### Best Case

Independent operations (e.g., batch processing):

```yaml
steps:
  - kind: generate, generator: qr, params: {text: "1"}, out: qr1
  - kind: generate, generator: qr, params: {text: "2"}, out: qr2
  - kind: generate, generator: qr, params: {text: "3"}, out: qr3
```

**Result:** All 3 execute simultaneously (1 wave, 3 parallel operations)

### Worst Case

Sequential dependencies:

```yaml
steps:
  - kind: generate, out: img1
  - kind: transform, in: img1, out: img2
  - kind: transform, in: img2, out: img3
  - kind: save, in: img3
```

**Result:** 4 waves, no parallelism possible

### Common Case

Fan-out pattern:

```yaml
steps:
  - kind: generate, out: original
  - kind: transform, in: original, op: resize, params: {width: 100}, out: thumb
  - kind: transform, in: original, op: resize, params: {width: 500}, out: medium
  - kind: transform, in: original, op: resize, params: {width: 1000}, out: large
  - kind: save, in: thumb
  - kind: save, in: medium
  - kind: save, in: large
```

**Result:** 3 waves: generate → 3 transforms → 3 saves

---

## Design Decisions

### Waves vs Task Queue

**Chosen: Wave-based execution**

Waves provide predictable execution ordering and simpler mental model. Each wave completes before the next starts.

Alternative (rejected): A task queue would allow starting step 3 as soon as step 1 finishes, even if step 2 is still running. This adds complexity for marginal gain in typical workflows.

### Concurrency at Pipeline Level

Concurrency is set per-pipeline, not per-wave. This provides:

- Simple API surface
- Predictable resource usage
- Easy to reason about limits

### No Step-Level Timeouts

Individual steps do not have timeouts. Long-running operations (like AI generation) proceed until completion or provider-level timeout.

---

## Related Documents

- [[Workflow-Abstraction]] — The generate→transform→save model
- [[Schema-Capability-System]] — Discovering available operations
- [[Plugin-Architecture]] — Creating custom generators/transforms
