# @teamflojo/floimg-studio-shared

Shared TypeScript types for FloImg Studio frontend and backend.

## Installation

```bash
npm install @teamflojo/floimg-studio-shared
```

## Usage

```typescript
import type {
  StudioNode,
  StudioEdge,
  StudioWorkflow,
  ExecutionResult,
  NodeDefinition,
} from "@teamflojo/floimg-studio-shared";
```

## Exports

### Node Types

- `StudioNode` — A node in the visual editor
- `StudioEdge` — A connection between nodes
- `StudioNodeType` — Node type enum: `generator`, `transform`, `save`, `input`, `vision`, `text`
- `GeneratorNodeData`, `TransformNodeData`, `SaveNodeData`, `InputNodeData`, `VisionNodeData`, `TextNodeData`

### Workflow Types

- `StudioWorkflow` — A complete workflow definition
- `GalleryTemplate` — A bundled workflow template

### Execution Types

- `ExecutionResult` — Full execution result
- `ExecutionStepResult` — Result from a single step
- `ExecutionStatus` — Status enum: `pending`, `running`, `completed`, `error`, `cancelled`

### WebSocket Events

- `WSEvent`, `WSExecutionStarted`, `WSExecutionStep`, `WSExecutionCompleted`, `WSExecutionError`

### API Types

- `CreateWorkflowRequest`, `ExecuteRequest`, `ExecuteResponse`
- `GenerateWorkflowRequest`, `GenerateWorkflowResponse` — AI workflow generation

### Schema Types

- `NodeDefinition` — Node definition for the palette
- `ParamSchema`, `ParamField` — Parameter schemas for dynamic forms
- `OutputSchema`, `OutputProperty` — Output schemas for structured JSON

## Related Packages

- [@teamflojo/floimg-studio-ui](https://www.npmjs.com/package/@teamflojo/floimg-studio-ui) — React components

## License

MIT
