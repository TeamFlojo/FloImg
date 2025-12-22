---
description: Generate a Mermaid diagram (flowcharts, sequence diagrams, class diagrams, etc.)
allowed-tools: mcp__floimg__generate_image, mcp__floimg__save_image
---

# Diagram Generation

Generate a Mermaid diagram based on: "$ARGUMENTS"

## Instructions

1. **Determine diagram type** from the request:
   - Process flow / workflow -> flowchart (graph TD/LR)
   - API calls / interactions -> sequence diagram
   - Object relationships -> class diagram
   - Lifecycle / states -> state diagram
   - Timeline / schedule -> Gantt chart
   - Concept relationships -> mindmap

2. **Write valid Mermaid code** and call `generate_image` with:
   - `intent`: "diagram" or "flowchart"
   - `params`: `{ "code": "<mermaid code>" }`

## Mermaid Syntax Quick Reference

### Flowchart

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant D as Database
    U->>A: Request
    A->>D: Query
    D-->>A: Results
    A-->>U: Response
```

### Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

### State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Published
    Review --> Draft
    Published --> [*]
```

## Node Shapes

| Syntax      | Shape              |
| ----------- | ------------------ |
| `A[Text]`   | Rectangle          |
| `B{Text}`   | Diamond (decision) |
| `C((Text))` | Circle             |
| `D([Text])` | Stadium            |
| `E[[Text]]` | Subroutine         |
| `F[(Text)]` | Database           |

## Edge Types

| Syntax      | Style            |
| ----------- | ---------------- |
| `-->`       | Arrow            |
| `---`       | Line             |
| `-.->`      | Dotted arrow     |
| `==>`       | Thick arrow      |
| `--text-->` | Arrow with label |

## Diagram Types

| Type      | Start Syntax            | Use Case          |
| --------- | ----------------------- | ----------------- |
| Flowchart | `graph TD` / `graph LR` | Process flows     |
| Sequence  | `sequenceDiagram`       | API interactions  |
| Class     | `classDiagram`          | OOP relationships |
| State     | `stateDiagram-v2`       | Lifecycles        |
| Gantt     | `gantt`                 | Project timelines |
| ER        | `erDiagram`             | Database schemas  |
| Mindmap   | `mindmap`               | Brainstorming     |
