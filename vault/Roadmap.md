# Roadmap

Current version: **v0.9.0**

## Now (v0.9.0)

Latest release highlights:

- **AI Workflow Generator** - Build image workflows with natural language using Gemini 3 Pro
- **Multi-provider AI** - OpenAI, Stability AI, Google (Gemini/Imagen), Replicate, xAI (Grok), and Ollama
- **CLI AI commands** - `floimg ai text` and `floimg ai vision` for command-line AI operations
- **Context-aware error UI** - Deployment-aware messaging for AI generation errors
- **Standardized env vars** - `GOOGLE_AI_API_KEY` for all Google AI features (breaking change)

See [CHANGELOG](../CHANGELOG.md) for full details.

## Next

Work in progress or committed for upcoming releases:

- **Workflow Type System** - Connection validation for node compatibility in visual editor
- **Additional AI transforms** - More Replicate models, improved stability transforms
- **Ops workflow templates** - 30+ templates for startup use cases (headshots, social media, etc.)

## Later

Directional ideas (not committed, no timeline):

- Additional AI providers as they become available
- Workflow branching and fan-out (parallel generation → composite)
- Performance optimizations (caching, memory management)
- Community plugin contribution guidelines

## Non-Goals

Explicitly out of scope:

- Real-time image editing UI (use FloImg Studio)
- Traditional photo editing features (use transforms)
- Video processing
