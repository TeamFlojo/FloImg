# Design Principles

The philosophy driving imgflo's architecture and decisions.

---

## 1. Glue, Not the Engine

imgflo orchestrates existing libraries rather than reimplementing them.

- **QuickChart** renders charts (we don't rebuild Chart.js)
- **Sharp** processes images (we don't rebuild ImageMagick)
- **Playwright** takes screenshots (we don't rebuild a browser)
- **OpenAI** generates AI images (we don't train models)

**Why:** These tools are mature, well-tested, and actively maintained. imgflo's value is in the unified abstraction, not in recreating wheels.

---

## 2. Pass-Through Pattern

Accept native library formats directly. Don't abstract away the underlying tool.

```typescript
// imgflo passes Chart.js config directly to QuickChart
await imgflo.generate({
  generator: 'quickchart',
  params: {
    type: 'bar',  // Chart.js type
    data: { /* pure Chart.js config */ },
    options: { /* pure Chart.js options */ }
  }
});
```

**Why:**
- Users can leverage existing Chart.js/Mermaid/D3 knowledge
- Full library capabilities are available, not a neutered subset
- Documentation from underlying libraries applies directly
- No need to learn imgflo-specific abstractions for each generator

---

## 3. Opt-In Complexity

Install only what you need. The core package stays lean.

```bash
# Minimal: just core (shapes + OpenAI)
npm install imgflo

# Add what you need
npm install imgflo-quickchart   # +300KB for charts
npm install imgflo-mermaid      # +2MB for diagrams
npm install imgflo-screenshot   # +200MB for Playwright
```

**Why:**
- Core stays under 10MB
- No bloat from unused dependencies
- Heavy dependencies (Playwright: 200MB+) are isolated
- Plugins can be versioned and updated independently

---

## 4. Interface Agnostic

The same workflow works across all interfaces.

| Interface | Same Workflow |
|-----------|--------------|
| JavaScript SDK | `imgflo.generate({...})` |
| CLI | `imgflo generate --generator qr --params '{...}'` |
| YAML | `steps: [{ generate: {...} }]` |
| MCP | `mcp__imgflo__generate({...})` |

**Why:**
- Learn once, use everywhere
- Switch interfaces without rewriting logic
- Test locally (CLI), deploy in code (SDK), expose to LLMs (MCP)

---

## 5. LLM-Ready, Not LLM-Dependent

imgflo works great with LLMs via MCP, but doesn't require them.

**With LLM (via MCP):**
> User: "Create a QR code for example.com"
> Claude: *calls imgflo MCP tools automatically*

**Without LLM (direct code):**
```typescript
await imgflo.generate({ generator: 'qr', params: { text: 'example.com' } });
```

**Why:**
- Developers can use imgflo without AI infrastructure
- CI/CD pipelines don't need LLM calls
- Deterministic workflows for production reliability
- LLM integration is an option, not a requirement

---

## 6. Explicit Over Implicit

imgflo doesn't guess. You specify what you want.

**What imgflo does NOT do:**
- Infer image dimensions from context
- Guess output formats
- Assume default destinations
- Parse natural language in parameters

**What imgflo does:**
- Execute exactly what you specify
- Return predictable results
- Fail fast with clear errors
- Provide sensible defaults only where documented

**Why:**
- Reproducible outputs
- Debuggable workflows
- No "magic" that breaks unexpectedly
- LLMs handle the ambiguity; imgflo handles the execution

---

## 7. Composable Primitives

Every operation produces an ImageBlob that can feed into the next.

```typescript
const chart = await imgflo.generate({...});      // → ImageBlob
const resized = await imgflo.transform(chart, {...}); // → ImageBlob
const captioned = await imgflo.transform(resized, {...}); // → ImageBlob
await imgflo.save(captioned, 's3://...');        // → SaveResult
```

**Why:**
- Chain any number of operations
- No special "pipeline" syntax required
- Each step is independently testable
- Works naturally with async/await

---

## 8. Deterministic Execution

Same inputs always produce the same outputs.

```typescript
// This will always produce identical results
await imgflo.generate({
  generator: 'qr',
  params: { text: 'hello', width: 300 }
});
```

**Why:**
- Reliable for production use
- Testable workflows
- Cache-friendly outputs
- Predictable behavior for LLM integrations

---

## 9. Open Source and Self-Hostable

imgflo is MIT licensed, fully open source, and designed to run anywhere.

**Core commitment:**
- No vendor lock-in
- No required cloud services
- Run locally, on your server, in CI/CD, anywhere
- Full functionality without paying anyone

**Favoring free and open tools:**

| Generator | Underlying Tool | Cost |
|-----------|----------------|------|
| `quickchart` | Chart.js (open source) | Free |
| `mermaid` | Mermaid (open source) | Free |
| `qr` | node-qrcode (open source) | Free |
| `screenshot` | Playwright (open source) | Free |
| `shapes` | SVG (standard) | Free |
| `openai` | OpenAI API | Paid (user's key) |

**Why:**
- Developers can build products without ongoing costs
- No surprise bills or rate limits from imgflo
- Paid services (OpenAI, cloud storage) are opt-in and use your own credentials
- Community can contribute, fork, and extend freely

**The philosophy:** imgflo helps you build awesome products. If you want to use paid services like OpenAI or AWS S3, that's your choice with your keys. The core workflows—charts, diagrams, QR codes, image transforms—cost nothing to run.

---

## Anti-Patterns We Avoid

| Anti-Pattern | Why We Avoid It |
|--------------|-----------------|
| Natural language params | Non-deterministic, LLM's job |
| Over-abstraction | Loses power of underlying libraries |
| Monolithic packages | Forces unused dependencies |
| Magic defaults | Unpredictable behavior |
| Tight LLM coupling | Limits use without AI |
| Required paid services | Creates barriers to adoption |
| Vendor lock-in | Limits where you can run |

---

## Related Documents

- [[Why-imgflo-Exists]] — The problems these principles solve
- [[Workflow-Abstraction]] — Technical implementation of these principles
- [[Plugin-Architecture]] — How the plugin system embodies opt-in complexity
