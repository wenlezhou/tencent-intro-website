# Structured Outputs#

**URL**: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview#

Structured outputs constrain Claude's responses to guarantee **valid, parseable** structured data for downstream processing.

### Core capabilities
- **JSON output** (`output_config.format`) — Control Claude's response format to produce JSON that conforms to a specified JSON Schema
- **Strict tool use** (`strict: true`) — Guarantee tool names and input args conform to schema validation
- Both features can be used **independently or combined** in the same request

---

## Supported Models & Platforms#

### Generally Available (GA) Scope#
| Platform | Supported Models |
|----------|-------------------|
| **Claude API** | Claude Opus 4.8, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.5 |
| **Amazon Bedrock** | Claude Opus 4.6, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5 |
| **Google Cloud** | Claude Opus 4.8, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5 |
| **Microsoft Foundry** | Generally available (Anthropic-hosted deployment only) |

### Data retention & compliance#
- ✅ Supports **Zero Data Retention (ZDR)** with limited technical retention
- ✅ **HIPAA eligible** (with BAA)
- ❌ **PHI prohibition**: Do NOT include PHI in JSON Schema (property names, `enum`, `const`, `pattern` regex). PHI only allowed in message content (prompts & responses).

---

## Why Structured Outputs?#

Without structured outputs, Claude may produce:
- ❌ Invalid JSON syntax → parse failures
- ❌ Missing required fields
- ❌ Inconsistent data types
- ❌ Schema violations → extra error handling & retries

With structured outputs, **constrained decoding** guarantees compliance:
- ✅ Always valid: No `JSON.parse()` errors
- ✅ Type-safe: Guaranteed field types & required fields
- ✅ High reliability: No retries for schema violations

---

## Feature 1: JSON Output (`output_config.format`)#

### Use cases#
- Control Claude's response format
- Extract structured data from images or text
- Generate structured reports
- Format API responses

### Quick start example (Python)#

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract the key information from this email: John Smith ([email protected]) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm.",
        }
    ],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan_interest": {"type": "string"},
                    "demo_requested": {"type": "boolean"},
                },
                "required": ["name", "email", "plan_interest", "demo_requested"],
                "additionalProperties": False,
            },
        }
    },
)
print(response.content[0].text)
```

**Output example**:
```json
{
  "name": "John Smith",
  "email": "[email protected]",
  "plan_interest": "Enterprise",
  "demo_requested": true
}
```

### How it works#
1. Define a JSON Schema (standard JSON Schema, with some limitations)
2. Add `output_config.format` parameter to API request
3. Parse response: Claude outputs valid JSON conforming to schema, located in `response.content[0].text`

---

## Feature 2: Strict Tool Use#

Guarantees tool input args conform to JSON Schema via **syntax-constrained sampling**.

### Difference from JSON output#
- **JSON output**: Controls Claude's **response format**
- **Strict tool use**: Validates tool call **input parameters**

### Combined usage example#

```python
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Help me plan a trip to Paris departing May 15, 2026",
        }
    ],
    # JSON output: structured response
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "next_steps": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["summary", "next_steps"],
                "additionalProperties": False,
            },
        }
    },
    # Strict tool use: guarantee tool args valid
    tools=[
        {
            "name": "search_flights",
            "strict": True,
            "input_schema": {
                "type": "object",
                "properties": {
                    "destination": {"type": "string"},
                    "date": {"type": "string", "format": "date"},
                },
                "required": ["destination", "date"],
                "additionalProperties": False,
            },
        }
    ],
)
```

---

## SDK Usage#

### Native schema definition support#

SDKs auto-convert native schema tools to JSON Schema:

| Language | Tool |
|----------|------|
| **Python** | Pydantic models + `client.messages.parse()` |
| **TypeScript** | Zod or JSON Schema literals |
| **Java** | Plain Java classes (auto-derive schema) |
| **Ruby** | `Anthropic::BaseModel` classes |
| **PHP** | Classes implementing `StructuredOutputModel` |
| **C#** | Plain C# classes + generic `Create<T>()` |
| **Go** | Go structs (beta API auto-reflects) |

### Python SDK example (Pydantic)#

```python
from pydantic import BaseModel
from anthropic import Anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str
    demo_requested: bool

client = Anthropic()

response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract the key information from this email: John Smith ([email protected]) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm.",
        }
    ],
    output_format=ContactInfo,
)

print(response.parsed_output)
```

### SDK schema auto-simplification#

SDKs auto-simplify schemas for constrained decoding while preserving original validation:
1. Remove unsupported constraints (e.g., `minimum`, `maxLength`)
2. Add constraint info to field descriptions (e.g., "Must be at least 100")
3. Add `additionalProperties: false` to all objects
4. Filter to keep only supported string formats
5. Use original schema to validate response, guaranteeing constraints hold

---

## Key Considerations#

### 1. Syntax compilation & caching#
- **First use** of a new schema has extra latency (compiles syntax)
- Compiled syntax auto-cached for **24 hours** → subsequent requests faster
- Cache invalidated when:
  - JSON Schema structure changes
  - Using structured output + tool use together, toolset changes
  - Modifying `name`, `description` does NOT invalidate

### 2. Prompt modifications & token costs#
- When using structured outputs, Claude auto-receives extra system prompt explaining output format
- Input token count increases slightly
- Modifying `output_config.format` invalidates **prompt cache** for current conversation

### 3. Property ordering rule#
Output orders properties: **required first, optional last**, matching schema definition order:

```json
// Schema definition
{
  "required": ["name", "email"],
  "properties": {
    "notes": { "type": "string" },
    "name": { "type": "string" },
    "email": { "type": "string" },
    "age": { "type": "integer" }
  }
}

// Output order
{
  "name": "John Smith",
  "email": "[email protected]",
  "notes": "Interested in enterprise plan",
  "age": 35
}
```
To enforce fixed order, mark all properties as `required`.

### 4. Invalid output scenarios#
| Scenario | Behavior | Solution |
|-----------|------------|------------|
| Claude refuses request (`stop_reason: "refusal"`) | 200 status, output may not conform to schema | None — Safety takes priority |
| Hits token limit (`stop_reason: "max_tokens"`) | Output incomplete, not schema-valid | Increase `max_tokens` and retry |

---

## Schema Complexity Limits & Optimization#

### Explicit limits#
| Limit | Threshold | Notes |
|-------|-------------|--------|
| Strict tools per request | 20 | Non-strict tools don't count |
| Total optional params | 128 | Across all strict tool schemas + JSON output schema |
| Total union-type params | 16 | Params using `anyOf` or type arrays (e.g., `["string", "null"]`) |

### Internal limits#
- Compiled syntax size limit → returns `400`: `Schema is too complex for compilation`
- Compilation timeout: **180 seconds**

### Complexity optimization best practices#
1. Only mark **critical tools** as `strict` — rely on Claude to follow schema naturally for non-critical tools
2. Mark params as `required` where possible — optional params double syntax state space
3. Simplify nested structures — flatten objects
4. Split multiple strict tools across different requests or sub-agents

---

## Feature Compatibility#

### ✅ Compatible features#
- **Batch processing** — 50% cost discount
- **Token counting** — Counting doesn't trigger compilation
- **Streaming** — Streamed structured output works like normal responses
- **JSON output + strict tool use** — Can be combined

### ❌ Incompatible features#
- **Citations** — Returns 400 error
- **Message prefilling** — Not compatible with JSON output (and Claude Opus 4.8+ doesn't support prefilling)

---

## Migration from Beta#

- Original `output_format` parameter migrated to `output_config.format`
- Beta request header **no longer needed**
- Old beta header (`structured-outputs-2025-11-13`) and `output_format` parameter still work during transition period

---

## References#

- **Build a tool-using agent tutorial**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/build-a-tool-using-agent
- **Pricing**: https://platform.claude.com/docs/en/about-claude/pricing
- **JSON Schema specification**: https://json-schema.org/

---

**Source**: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
**Scraped by**: AI Tutorial Crawler#
