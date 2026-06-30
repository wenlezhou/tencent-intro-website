# Build with Claude - Features Overview

**URL**: https://platform.claude.com/docs/en/build-with-claude/overview
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

Claude API capabilities are organized into 5 categories:
1. **Model capabilities** - Control how Claude reasons and formats responses
2. **Tools** - Let Claude execute actions in web or user environments
3. **Tool infrastructure** - Support large-scale tool discovery and orchestration
4. **Context management** - Keep long conversations running efficiently
5. **Files and assets** - Manage documents and data provided to Claude

---

## Complete Feature List

### 1. Model Capabilities (11 features)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Context windows | ✅ | GA | [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) |
| Adaptive thinking | ✅ | GA | [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) |
| Batch processing | ❌ | GA | [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| Citations | ✅ | GA | [Citations](https://platform.claude.com/docs/en/build-with-claude/citations) |
| Data residency | ✅ | GA | [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) |
| Effort | ✅ | GA | [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) |
| Extended thinking | ✅ | GA | [Extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) |
| Fallback credit | ❌* | Beta | [Fallback credit](https://platform.claude.com/docs/en/build-with-claude/fallback-credit) |
| PDF support | ✅ | GA | [PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support) |
| Search results | ✅ | GA | [Search results](https://platform.claude.com/docs/en/build-with-claude/search-results) |
| Server-side fallback | ❌* | Beta | [Server-side fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) |
| Structured outputs | ✅** | GA | [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |

*Fallback-related features only process refusal information, don't retain message content, but involve Claude Fable 5 which doesn't support ZDR.
**Structured outputs only cache JSON schema for up to 24 hours, don't store prompts and outputs.

### 2. Tools - Server-side (4 features)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Advisor tool | ✅ | Beta | [Advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) |
| Code execution | ❌ | GA | [Code execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool) |
| Web fetch | ✅* | GA | [Web fetch](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool) |
| Web search | ✅* | GA | [Web search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) |

*Web search and web fetch only support ZDR when [dynamic filtering](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool#dynamic-filtering) is NOT enabled.

### 3. Tools - Client-side (4 features)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Bash tool | ✅ | GA | [Bash](https://platform.claude.com/docs/en/agents-and-tools/tool-use/bash-tool) |
| Computer use | ✅ | Beta | [Computer use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) |
| Memory tool | ✅ | GA | [Memory](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) |
| Text editor | ✅ | GA | [Text editor](https://platform.claude.com/docs/en/agents-and-tools/tool-use/text-editor-tool) |

### 4. Tool Infrastructure (5 features)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Agent skills | ❌ | Beta | [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) |
| Fine-grained tool streaming | ✅ | GA | [Fine-grained tool streaming](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming) |
| MCP connector | ❌ | Beta | [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) |
| Programmatic tool calling | ❌ | GA | [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) |
| Tool search | ✅ | GA | [Tool search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) |

### 5. Context Management (6 features)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Compaction | ✅ | Beta | [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) |
| Context editing | ✅ | Beta | [Context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) |
| Automatic prompt caching | ✅ | GA | [Automatic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching) |
| Prompt caching (5m) | ✅ | GA | [Prompt caching (5m)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) |
| Prompt caching (1hr) | ✅ | GA | [Prompt caching (1hr)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#1-hour-cache-duration) |
| Token counting | ✅ | GA | [Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) |

### 6. Files and Assets (1 feature)

| Feature | ZDR | Availability | Doc Link |
|---------|------|-------------|----------|
| Files API | ❌ | Beta | [Files API](https://platform.claude.com/docs/en/build-with-claude/files) |

---

## Management APIs

For management and governance capabilities, see:
- [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api)
- [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
- [Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api)

---

## Availability Definitions

| Level | Description |
|-------|-------------|
| **Beta** | Preview feature for feedback gathering. Availability may be limited (registration/waitlist required). Not guaranteed for production use. May have breaking changes. Requires Beta request header. |
| **Generally Available (GA)** | Stable, fully supported feature. Recommended for production use. No Beta identifier. Covered by standard API versioning guarantees. |
| **Deprecated** | Feature still works but not recommended. Migration path and removal timeline provided. |
| **Retired** | Feature no longer available. |

---

## Key Differences from Old Platform (docs.anthropic.com)

1. **New features**: Adaptive thinking, effort, fallback credit, search results, compaction, context editing, automatic prompt caching, MCP connector, tool search, agent skills
2. **Updated features**: Extended thinking, prompt caching, structured outputs, web search, code execution
3. **Organization**: Better categorized into model capabilities, tools, tool infrastructure, context management, files
4. **ZDR labeling**: Every feature now has clear ZDR support status

---

**Source**: https://platform.claude.com/docs/en/build-with-claude/overview
**Scraped by**: AI Tutorial Crawler
