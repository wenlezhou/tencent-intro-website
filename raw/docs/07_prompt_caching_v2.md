# Prompt Caching

**URL**: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

Prompt caching optimizes API costs and latency by reusing identical prompt prefixes across multiple requests.

**Key features**:
- ✅ Supports Zero Data Retention (ZDR)
- ✅ Two ways to enable: **Automatic caching** (simplest), **Explicit cache breakpoints** (fine-grained control)
- ✅ Default TTL: **5 minutes** (free refreshes on reuse)
- ✅ Extended TTL: **1 hour** (paid option)
- ✅ Covers full prefix: `tools` → `system` → `messages` (in order) up to `cache_control` marker

---

## How It Works

1. Send request with prompt caching enabled
2. System checks if recent request already cached the prefix up to specified breakpoint
3. If cached: reuse cached content (reduce processing time/cost)
   If not cached: process full prompt, cache prefix at response start
4. Cache TTL refreshes automatically on each reuse (no extra charge)

### Best for:
- Prompts with many examples
- Long context / background information
- Repeated tasks with fixed instructions
- Long multi-turn conversations

---

## Pricing

Prompt caching has a separate billing structure (per MTok):

| Model | Base Input | 5m Cache Write | 1h Cache Write | Cache Read | Output |
|-------|-------------|-----------------|-----------------|-------------|---------|
| Claude Opus 4.5 | $5 / MTok | $6.25 / MTok | $10 / MTok | $0.50 / MTok | $25 / MTok |
| Claude Sonnet 4.5 | $3 / MTok | $3.75 / MTok | $6 / MTok | $0.30 / MTok | $15 / MTok |
| Claude Haiku 4.5 | $1 / MTok | $1.25 / MTok | $2 / MTok | $0.10 / MTok | $5 / MTok |

**Pricing rules**:
- 5-minute cache write = 1.25× base input price
- 1-hour cache write = 2× base input price
- Cache read = 0.1× base input price
- Multipliers stack with Batch API discount, data residency, etc.

---

## Supported Models

All **active Claude models** support prompt caching (both automatic and explicit breakpoints).

---

## Method 1: Automatic Caching (Recommended for most use cases)

### Basic Concept

Simplest way to enable. Just add a single `cache_control` field at top level of request. System automatically applies cache breakpoint to **last cacheable block** and moves it forward as conversation grows.

### Code Example (Python)

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    cache_control={"type": "ephemeral"},
    system="You are a helpful assistant that remembers our conversation.",
    messages=[
        {"role": "user", "content": "My name is Alex. I work on machine learning."},
        {
            "role": "assistant",
            "content": "Nice to meet you, Alex! How can I help with your ML work today?",
        },
        {"role": "user", "content": "What did I say I work on?"},
    ],
)
print(response.usage.model_dump_json())
```

### How It Works (Multi-turn)

Cache breakpoint automatically moves to last cacheable block in each request:

| Request | Cache Behavior |
|----------|---------------|
| Request 1 | System + User1 + Assistant1 + User2 → written to cache |
| Request 2 | System through User2 → read from cache, Assistant2 + User3 → written to cache |
| Request 3 | System through User3 → read from cache, Assistant3 + User4 → written to cache |

No need to manually update `cache_control` markers. Breakpoint auto-moves.

### Advanced Configuration

#### 1. TTL Support

Default 5-minute TTL. Can specify **1-hour TTL** (billed at 2× base input price):

```json
{ "cache_control": { "type": "ephemeral", "ttl": "1h" } }
```

#### 2. Hybrid with Block-level Caching

Automatic caching is compatible with explicit breakpoints. Auto breakpoint occupies **1 of 4 available breakpoint slots**.

Example: explicitly mark system prompt for caching, let auto caching handle conversation:

```json
{
  "model": "claude-opus-4-8",
  "max_tokens": 1024,
  "cache_control": { "type": "ephemeral" },
  "system": [
    {
      "type": "text",
      "text": "You are a helpful assistant.",
      "cache_control": { "type": "ephemeral" }
    }
  ],
  "messages": [{ "role": "user", "content": "What are the key terms?" }]
}
```

### Limitations & Notes

- If last block already has explicit `cache_control` with same TTL, automatic caching does NOT activate
- If last block already has explicit `cache_control` with different TTL, API returns 400 error
- If 4 explicit block-level breakpoints already exist, API returns 400 error (no slot available for auto caching)
- If last block doesn't qualify as auto caching breakpoint target, system auto-searches backward for nearest cacheable block. If none found, skips caching
- **Available on**: Claude API, Claude Platform on AWS, Microsoft Foundry. **NOT on Bedrock or Google Cloud**
- Cache fundamentals (pricing, min token threshold, context ordering requirement, 20-block lookback window) are identical to explicit breakpoints

---

## Method 2: Explicit Cache Breakpoints

### Use Case

When you need **finer-grained control** over caching (e.g., different parts change at different frequencies, need precise control over cached content).

### Prompt Structure Requirement

Place static content (tool definitions, system instructions, context, examples) at **start of prompt**. Mark cache breakpoint at end of reusable content with `cache_control` parameter.

Cache prefix creation order: `tools` → `system` → `messages` (layered incrementally).

### Core Mechanics

1. **Cache write happens ONLY at breakpoints**: Block marked with `cache_control` writes exactly ONE cache entry: hash of prefix up to that block. System does NOT write entries for earlier positions. Since hash is cumulative, covers breakpoint AND all content before it.
2. **Cache read looks backward** for entries written by prior requests: Each request calculates prefix hash at breakpoint, checks for matching cache entry. If none, looks backward 1 block at a time checking if earlier positions match existing cache. Lookback only checks for entries previously WRITTEN, not for stable content.
3. **Lookback window is 20 blocks**: Max 20 positions checked per breakpoint (breakpoint itself = position 1). If no match found within window, stops checking. (If there's a next explicit breakpoint, continues lookback from next breakpoint.)

### Common Mistake Example

If prompt contains large static system context (blocks 1-5), followed by request-level block with timestamp + user message (block 6), and you set `cache_control` on block 6:
- Request 1: Writes cache at block 6. Hash includes timestamp.
- Request 2: Different timestamp. Prefix hash at block 6 is different. Lookback checks blocks 5, 4, 3, 2, 1. But system never wrote entries at those positions. No cache hit. Every request pays for new cache write. Will NEVER hit cache.
- **Correct approach**: Move `cache_control` to block 5 (last block that stays constant across requests). All subsequent requests will read cached prefix.

### Multiple Breakpoints

Max **4 cache breakpoints** can be defined. Useful for:
- Different parts change at different frequencies (e.g., tools change rarely, context updates daily)
- Need more precise control over cached content
- Long conversations where breakpoint goes beyond 20-block lookback window (add 2nd breakpoint to eagerly write earlier)

### Cost Notes

Cache breakpoints themselves add NO cost. You only pay for:
- **Cache write**: When new content is written to cache (5m TTL costs 1.25× base input, 1h TTL costs 2×)
- **Cache read**: When cached content is reused (costs 0.1× base input)
- **Regular input tokens**: For content not served from cache

Adding `cache_control` breakpoints doesn't add extra cost — only controls logic for independently caching different parts.

---

## Caching Strategy & Best Practices

### Cache Invalidation Rules

Cache follows `tools` → `system` → `messages` hierarchy. Modifying each layer invalidates cache for that layer AND all subsequent layers:

| Modified Content | Tools Cache | System Cache | Messages Cache | Impact Explanation |
|-----------------|---------------|----------------|-----------------|---------------------|
| Tool definitions | ✘ | ✘ | ✘ | Modifying tool name, description, params invalidates entire cache |
| Web search toggle | ✓ | ✘ | ✘ | Enabling/disabling web search modifies system prompt |
| Citations toggle | ✓ | ✘ | ✘ | Enabling/disabling citations modifies system prompt |
| Speed setting | ✓ | ✘ | ✘ | Switching `speed: "fast"` and standard speed invalidates system + message cache |
| Tool choice | ✓ | ✓ | ✘ | Modifying `tool_choice` param only affects message block |
| Images | ✓ | ✓ | ✘ | Adding/deleting images anywhere in prompt affects message block |
| Thinking params | ✓ | ✓ | ✘ | Modifying extended thinking settings (enable/disable, budget) affects message block |
| Non-tool-result passed to extended thinking request | ✓ | ✓ | Model-dependent | Opus 4.5+ and Sonnet 4.6+ retain thinking blocks by default, cache valid (✓). Older Opus/Sonnet models and all Haiku models strip prior thinking blocks, invalidates cache (✘) |

**Special note**: Claude Opus 4.8 supports adding system instructions mid-conversation WITHOUT invalidating system or message cache: append `{"role": "system"}` message to `messages` instead of modifying top-level `system` field. This keeps cached prefix intact.

### What's Cacheable

Following request blocks can be cached (automatic or explicit markers):

- **Tools**: Tool definitions in `tools` array
- **System messages**: Content blocks in `system` array
- **Text messages**: Content blocks in `messages.content` array (both user and assistant turns)
- **Images and documents**: Content blocks in `messages.content` array (user turns only)
- **Tool uses and tool results**: Content blocks in `messages.content` array (both user and assistant turns)

### What's NOT Cacheable

- **Thinking blocks** cannot be directly marked with `cache_control`, but CAN be cached as part of prior assistant turn when passed back in subsequent API calls (common in tool-use multi-turn conversations)
- **Sub-content blocks** (e.g., citations) cannot be directly cached. Must cache top-level block. Referenced source document's top-level content block CAN be cached
- **Empty text blocks** cannot be cached

### Performance Tracking

API response `usage` field (or `message_start` event for streaming) includes these metrics:

- `cache_creation_input_tokens`: Number of tokens written to cache when creating new cache entry
- `cache_read_input_tokens`: Number of tokens read from cache for this request
- `input_tokens`: Input tokens NOT read from cache and NOT used for cache creation (i.e., tokens after last cache breakpoint)

**Total input tokens calculation**:
```
total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
```

### Combining with Thinking Blocks

- Thinking blocks cannot be directly marked with `cache_control`, but in subsequent API calls when passing back tool results, they're part of request content and get cached (common in tool-use multi-turn conversations)
- When reading thinking blocks from cache, they're billed as input tokens, affecting cost and token budget
- **Cache invalidation rules**:
  - ✅ **Valid cache**: Passing only tool results as user message
  - ✅ **Valid cache** (Opus 4.5+ and Sonnet 4.6+): Even adding non-tool-result user content, these models retain thinking blocks by default, cache stays valid
  - ❌ **Invalidates cache** (older Opus/Sonnet models and all Haiku models): Adding non-tool-result user content strips all prior thinking blocks, invalidates cache

---

## 1-Hour Cache Duration

If 5-minute TTL is too short, you can pay for **1-hour cache duration**.

### Enable 1-Hour Cache

Add `ttl` field to `cache_control` definition:

```json
"cache_control": {
  "type": "ephemeral",
  "ttl": "1h"
}
```

### Response Example

```json
{
  "usage": {
    "input_tokens": 2048,
    "cache_read_input_tokens": 1800,
    "cache_creation_input_tokens": 248,
    "output_tokens": 503,
    "cache_creation": {
      "ephemeral_5m_input_tokens": 148,
      "ephemeral_1h_input_tokens": 100
    }
  }
}
```

`cache_creation_input_tokens` = sum of values in `cache_creation` object.

### Use Cases

- Requests less frequent than every 5 minutes but more frequent than every hour (e.g., agent processing takes >5 minutes, user conversation gaps >5 minutes)
- Latency-sensitive applications where subsequent requests might arrive after >5 minutes
- Want to improve rate limit utilization (cache hits don't count against rate limits)

### Mixed TTL Usage

Can use both 1-hour and 5-minute caching in same request, BUT requirement: **longer TTL cache entry MUST appear before shorter TTL entry** (i.e., 1-hour cache entry must come before 5-minute cache entry).

When mixing TTLs, API determines 3 billing positions:
1. Position A: Highest token position with cache hit (0 if no hit)
2. Position B: Highest token position with 1-hour `cache_control` block after A (A if none)
3. Position C: Last `cache_control` block's token position

**Billing rules**:
1. Tokens at position A billed at cache read rate
2. Tokens (B - A) billed at 1-hour cache write rate
3. Tokens (C - B) billed at 5-minute cache write rate

---

## Cache Warmup

Cache warmup lets you **preload system prompts or tool definitions** into prompt cache before users trigger actual requests. Eliminates cache miss latency on first user interaction. Reduces time-to-first-token for latency-sensitive applications.

### How It Works

Set `max_tokens: 0` in request. API reads prompt into model, writes cache at any `cache_control` breakpoints, then immediately returns without generating any output. Response includes empty `content` array, `stop_reason: "max_tokens"`, and full `usage` block.

**Important**: Must use **explicit cache breakpoints** (NOT automatic caching). Place breakpoint at last block shared with subsequent requests (usually system prompt or tool definitions). Do NOT use placeholder user message — cache entry will match placeholder and subsequent requests won't hit.

### Code Example (Python)

```python
client = anthropic.Anthropic()

# Call at app startup to warm shared system prompt cache
warmup = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=0,
    system=[
        {
            "type": "text",
            "text": "You are an expert software engineer with deep knowledge of distributed systems...",
            "cache_control": {"type": "ephemeral"},
        }
    ],
    messages=[{"role": "user", "content": "warmup"}],
)
print(warmup.stop_reason)  # "max_tokens"
print(warmup.content)  # []
print(warmup.usage)
```

If prefix wasn't already cached, warmup request incurs cache write cost (identical to regular request). No output token cost. Can check `usage.cache_creation_input_tokens` to confirm write happened.

### Typical Usage Pattern

Call warmup at app startup (or on timer), then process real user requests after warmup completes:

```python
client = anthropic.Anthropic()

SYSTEM_PROMPT = [
    {
        "type": "text",
        "text": "You are an expert software engineer with deep knowledge of distributed systems...",
        "cache_control": {"type": "ephemeral"},
    }
]

def warmup_cache() -> None:
    """Call at app startup or on timer"""
    client.messages.create(
        model="claude-opus-4-8",
        max_tokens=0,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": "warmup"}],
    )

def respond(user_message: str) -> anthropic.types.Message:
    """Real user request. Can reuse warmed cache"""
    return client.messages.create(
        model="claude-opus-4-8",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

# Warm cache before user traffic arrives
warmup_cache()

# When user sends message, system prompt prefix is already cached
response = respond("How do I implement a binary search tree?")
print(response.content[0].text)
```

**Note**: Cache TTL still applies. Default 5-minute cache needs warmup request at least every 5 minutes to stay valid. Use 1-hour cache if user request gaps are longer.

### Limitations

Request will be rejected with `invalid_request_error` if it includes (these require output tokens, 0-token budget can't generate):

- `stream: true`
- Extended thinking (`thinking.type: "enabled"`)
- Structured outputs (`output_config.format`)
- `tool_choice` of `{"type": "tool", ...}` or `{"type": "any"}`

`max_tokens: 0` also NOT supported in **Message Batches** requests: warmup targets time-to-first-token optimization, not applicable to batch processing. Cache entries written in batch request will likely expire before subsequent requests run.

###替代 Solution

Before `max_tokens: 0` was available, some applications used `max_tokens: 1` warmup calls to achieve same effect. `max_tokens: 0` is better: no output produced, no need to discard single-token reply, no output token billing, clearer request intent.

---

## Best Practices

1. **Use automatic caching for multi-turn conversations** — manages breakpoints automatically, no manual maintenance
2. **Use explicit block-level breakpoints** when different parts change at different frequencies
3. **Cache stable, reusable content**: system instructions, background info, large context, frequently-used tool definitions
4. **Place cached content at start of prompt** for optimal performance
5. **Place breakpoint at last block that's identical across requests**: If prompt has static prefix + variable suffix (timestamp, request-level context, user input), breakpoint goes at END of prefix, NOT at variable block
6. **Analyze cache hit rate regularly** and adjust strategy as needed

### Optimization by Use Case

| Use Case | Optimization Strategy |
|-----------|------------------------|
| Conversational agents | Reduce cost + latency for long instructions, uploaded docs in extended conversations |
| Coding assistants | Cache codebase-relevant sections or summaries. Optimize for autocomplete + codebase Q&A performance |
| Large document processing | Embed full long text (with images) in prompt. No increase to response latency |
| Detailed instruction sets | Can include 20+ high-quality answer examples. Improve model performance without worrying about cost |
| Agent tool use | Optimize for multi-tool-call, iterative code change scenarios. Reduce cost per API call |
| Long-content interaction | Embed books, papers, docs, podcast transcripts in prompt in full. Enable interactive Q&A |

---

## Troubleshooting

If experiencing unexpected behavior, check:

1. ✅ Ensure cached portions are **identical across calls**. Explicit breakpoints require `cache_control` marker at same position
2. ✅ Check if calls are within cache TTL (default 5 minutes)
3. ✅ Ensure `tool_choice`, image usage are consistent across calls
4. ✅ Verify cached token count meets **minimum threshold** for model/channel
5. ✅ Confirm breakpoint placed at block that's **identical across requests**. Cache write happens ONLY at breakpoint. If breakpoint block changes (timestamp, request-level context, user input), prefix hash will never match. Lookback does NOT look for stable content after breakpoint, only looks for entries written by prior requests at their own breakpoints
6. ✅ Ensure `tool_use` content block key order is stable. Some languages (Swift, Go) randomize key order during JSON conversion, causing cache invalidation
7. ✅ Can use [Cache Diagnostics tool](https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics) (Beta) — API automatically compares consecutive requests, reports where prompt prefixes differ. Handles most of above troubleshooting steps automatically

---

## References

- **Prompt Caching Cookbook**: https://platform.claude.com/cookbook/misc-prompt-caching (includes large context caching, tool definition caching, multi-turn conversations, multi-breakpoint combinations)
- **Cache Diagnostics**: https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics
- **Pricing**: https://platform.claude.com/docs/en/about-claude/pricing

---

**Source**: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
**Scraped by**: AI Tutorial Crawler
