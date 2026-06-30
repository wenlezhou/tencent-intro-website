# Extended Thinking

**URL**: https://platform.claude.com/docs/en/build-with-claude/extended-thinking
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

Extended thinking provides Claude with enhanced reasoning capabilities for complex tasks, with the ability to show the step-by-step reasoning process before generating the final answer.

**Key features**:
- ✅ Supports Zero Data Retention (ZDR)
- ✅ Thinking output in `thinking` content blocks
- ✅ Thinking conclusion integrated into final response
- ✅ Default response order: `thinking` block first, then `text` block

---

## Supported Models & Features

| Model | Manual `budget_tokens` | Recommended Mode | Thinking Display Default | Interleaved Thinking | History Thinking Retention |
|-------|----------------------|------------------|---------------------------|----------------------|-------------------------------|
| **Claude Opus 4.5** | ✅ | - | Summarized | Beta header required | Last round only |
| **Claude Sonnet 4.5** | ✅ (Deprecated) | Adaptive + `effort` | Summarized | Beta header required | Last round only |
| **Claude Opus 4.6** | ❌ (400 error) | Adaptive + `effort` | Summarized | Auto (beta header deprecated) | All retained |
| **Claude Sonnet 4.6** | ❌ (400 error) | Adaptive + `effort` | Summarized | Auto (beta header deprecated) | All retained |
| **Claude Opus 4.7** | ❌ (400 error) | Adaptive + `effort` | Omitted | Auto | All retained |
| **Claude Opus 4.8** | ❌ (400 error) | Adaptive + `effort` | Omitted | Auto | All retained |
| **Claude Haiku 4.5** | ✅ | - | Summarized | ❌ (ignores beta header) | Last round only |
| **Claude Mythos Preview** | ✅ | Adaptive (default on) | Omitted | Auto (no beta header) | All retained |
| **Claude Mythos 5** | ❌ (400 error) | Adaptive (always on) | Omitted | Auto | All retained |
| **Claude Opus 4.5** | ✅ | - | Summarized | Beta header required | Last round only |

**Adaptive thinking**: Model automatically decides if/when to think and at what depth. Claude Fable 5, Mythos 5, Mythos Preview do NOT support `thinking: {type: "disabled"}`.

---

## Core Parameters

### 1. Basic Parameters

| Parameter | Type | Description | Applicable Models |
|-----------|------|-------------|---------------------|
| `thinking.type` | string | `"enabled"`: Manual extended thinking; `"adaptive"`: Adaptive thinking; `"disabled"`: Disable (not supported on some models) | All |
| `thinking.budget_tokens` | integer | Max tokens for internal reasoning. Min 1024, must be < `max_tokens`. Deprecated on Opus 4.6, Sonnet 4.6. Use adaptive + `effort` instead. | Models supporting manual mode |
| `thinking.display` | string | `"summarized"`: Return thinking summary (default on older models); `"omitted"`: Return empty thinking, only keep `signature` for multi-turn coherence (default on newer models) | All |

### 2. Related Parameters

| Parameter | Notes |
|-----------|-------|
| `max_tokens` | Must be > `budget_tokens`. In interleaved thinking, can exceed `max_tokens` because budget is for entire assistant turn. |
| `tool_choice` | With extended thinking + tool use, only `"auto"` (default) or `"none"` supported. `"any"` or specific tool name will cause conflict. |
| `effort` | Controls thinking depth in adaptive mode. Only used when model doesn't support manual `budget_tokens`. |

---

## Response Format

### 1. Default Response (display: "summarized")

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me analyze this step by step...",
      "signature": "WaUjzkypQ2mUEVM36O2TxuC06KN8xyfbJwyem2dw3URve/op91XWHOEBLLqIOMfFG/UvLEczmEsUjavL...."
    },
    {
      "type": "text",
      "text": "Based on my analysis..."
    }
  ]
}
```

### 2. Omitted Thinking Response (display: "omitted")

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "",
      "signature": "EosnCkYICxIMMb3LzNrMu..."
    },
    {
      "type": "text",
      "text": "The answer is 12,231."
    }
  ]
}
```

### 3. Encryption & Editing Notes

- Full thinking content is encrypted and stored in `signature` field (cross-platform compatible: Claude API, Bedrock, Vertex AI)
- If `redacted_thinking` block is returned, part of thinking was redacted for safety. Only contains encrypted `data` field. Must pass back unchanged to maintain multi-turn coherence.
- **DO NOT modify** returned `thinking` or `redacted_thinking` blocks. Will return 400 `invalid_request_error`.

---

## Code Examples

### 1. Basic Usage (Python, Manual Extended Thinking)

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {
            "role": "user",
            "content": "Are there an infinite number of prime numbers such that n mod 4 == 3?",
        }
    ],
)

# The response contains summarized thinking blocks and text blocks
for block in response.content:
    if block.type == "thinking":
        print(f"\nThinking summary: {block.thinking}")
    elif block.type == "text":
        print(f"\nResponse: {block.text}")
```

### 2. Omit Thinking Content for Lower Latency (Python)

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000,
        "display": "omitted",  # Omit thinking content, only keep signature
    },
    messages=[
        {"role": "user", "content": "What is 27 * 453?"},
    ],
)

for block in response.content:
    if block.type == "thinking":
        if block.thinking:
            print(f"Thinking: {block.thinking}")
        else:
            print("Thinking: [omitted]")
    elif block.type == "text":
        print(f"Response: {block.text}")
```

### 3. Streaming Response Handling (Python)

```python
client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {
            "role": "user",
            "content": "What is the greatest common divisor of 1071 and 462?",
        }
    ],
) as stream:
    thinking_started = False
    response_started = False

    for event in stream:
        if event.type == "content_block_start":
            print(f"\nStarting {event.content_block.type} block...")
            thinking_started = False
            response_started = False
        elif event.type == "content_block_delta":
            if event.delta.type == "thinking_delta":
                if not thinking_started:
                    print("Thinking: ", end="", flush=True)
                    thinking_started = True
                print(event.delta.thinking, end="", flush=True)
            elif event.delta.type == "text_delta":
                if not response_started:
                    print("Response: ", end="", flush=True)
                    response_started = True
                print(event.delta.text, end="", flush=True)
        elif event.type == "content_block_stop":
            print("\nBlock complete.")
```

### 4. Streaming Event Example (display: "summarized")

```
event: message_start
data: {"type": "message_start", "message": {"id": "msg_01...", "type": "message", "role": "assistant", "content": [], "model": "claude-sonnet-4-6", "stop_reason": null, "stop_sequence": null}}

event: content_block_start
data: {"type": "content_block_start", "index": 0, "content_block": {"type": "thinking", "thinking": "", "signature": ""}}

event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "thinking_delta", "thinking": "I need to find the GCD of 1071 and 462 using the Euclidean algorithm.\n\n1071 = 2 × 462 + 147"}}

event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "thinking_delta", "thinking": "\n462 = 3 × 147 + 21\n147 = 7 × 21 + 0\n\nSo GCD(1071, 462) = 21"}}

// Additional thinking deltas...

event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "signature_delta", "signature": "EqQBCgIYAhIM1gbcDa9GJwZA2b3hGgxBdjrkzLoky3dl1pkiMOYds..."}}

event: content_block_stop
data: {"type": "content_block_stop", "index": 0}

event: content_block_start
data: {"type": "content_block_start", "index": 1, "content_block": {"type": "text", "text": ""}}

event: content_block_delta
data: {"type": "content_block_delta", "index": 1, "delta": {"type": "text_delta", "text": "The greatest common divisor of 1071 and 462 is **21**."}}

// Additional text deltas...

event: content_block_stop
data: {"type": "content_block_stop", "index": 1}

event: message_delta
data: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}}

event: message_stop
data: {"type": "message_stop"}
```

---

## Core Usage Scenarios

### 1. Extended Thinking + Tool Use

#### Limitations

- Only `tool_choice: {"type": "auto"}` or `tool_choice: {"type": "none"}` supported. Forcing tool use conflicts with extended thinking.
- Must pass back ALL `thinking` blocks from last assistant message unchanged to maintain reasoning coherence.
- Cannot switch thinking mode mid-turn (including tool call loop). Thinking will auto-disable.

#### Tool Call Loop Example

```
User: "What's the weather in Paris?"
Assistant: [thinking] + [tool_use: get_weather]  ← Same turn
User: [tool_result: "20°C, sunny"]
Assistant: [text: "The weather in Paris is 20°C and sunny"]  ← Same turn ends
```

#### Thinking Block Retention Policy

- **Opus 4.5+, Sonnet 4.6+**: Retain ALL historical thinking blocks by default
- **Older Opus/Sonnet, Haiku**: Only retain last round's thinking block
- Retaining thinking blocks optimizes cache hits and reduces token costs for multi-step workflows. Does NOT impact model performance.

### 2. Interleaved Thinking

**Supported models**: Claude Fable 5, Mythos 5, Mythos Preview, Opus 4.7+, Sonnet 4.6+ (auto-enabled in adaptive mode). Older models need `interleaved-thinking-2025-05-14` beta header.

- **Capability**: Claude can reason BETWEEN tool calls, process tool results, then decide next step. Supports multi-tool chaining.
- **Note**: In interleaved thinking, `budget_tokens` can exceed `max_tokens` because it's the total budget for the entire turn.
- **Partner platforms** (Bedrock, Vertex AI): Only specific models support passing `interleaved-thinking-2025-05-14` header. Otherwise request fails.

### 3. Extended Thinking + Prompt Caching

- Modifying thinking params (enable/disable, change budget) invalidates message cache. System prompt and tool definitions cache unaffected.
- Extended thinking tasks may exceed 5 minutes. Recommended to use **1-hour cache duration** to maintain cache hits.
- Opus 4.5+, Sonnet 4.6+ retain historical thinking blocks (billed as input tokens when read from cache). Older models + Haiku strip historical thinking blocks.

---

## Billing

- **Input tokens**: Raw request tokens. Does NOT include historical thinking tokens (except Opus 4.5+/Sonnet 4.6+ which retain and bill them)
- **Output tokens**: Billed based on actual full thinking tokens generated by model, NOT the summary tokens or omitted 0 tokens in response
- Use `usage.output_tokens_details.thinking_tokens` field to see actual tokens used for reasoning. This value ≤ `output_tokens`. Non-thinking output tokens = `output_tokens` - `thinking_tokens`.

**Example usage field**:

```json
{
  "usage": {
    "input_tokens": 25,
    "output_tokens": 348,
    "output_tokens_details": {
      "thinking_tokens": 312
    }
  }
}
```

---

## Best Practices & Notes

### 1. Thinking Budget Settings

- Minimum budget: **1024 tokens**
- Recommended: Start from minimum, gradually increase to find optimal cost-quality balance
- Complex tasks (math, coding, analysis): Recommend 16k+ budget
- Budget >32k: Use Batch API to avoid request timeout
- Budget is a target, not strict limit. Actual token usage varies by task.

### 2. Performance Optimization

- Extended thinking increases response latency. Set `display: "omitted"` when thinking content doesn't need to be shown. Reduces time to first token.
- When `max_tokens` > 21333, SDK requires streaming to avoid HTTP timeout. Use `.stream()` + `.get_final_message()` to get full response without processing intermediate events.
- Monitor `usage.output_tokens_details.thinking_tokens` to optimize costs.

### 3. Compatibility Notes

- Extended thinking does NOT support modifying `temperature`, `top_k`. Does NOT support forced tool use. Does NOT support response prefilling.
- Can set `top_p` to 0.95~1.0 when extended thinking is enabled.
- Switching thinking modes mid-conversation invalidates prompt cache. Plan thinking strategy per turn, avoid mid-conversation switches.

### 4. Usage Recommendations

- Only enable extended thinking for complex tasks requiring step-by-step reasoning. Simple tasks don't need it.
- For multi-turn conversations, no need to manually remove historical thinking blocks. API handles automatically (Opus 4.5+/Sonnet 4.6+ retain, older models strip).
- Refer to official prompting best practices to optimize extended thinking effectiveness.

---

## References

- **Adaptive Thinking**: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
- **Extended Thinking Cookbook**: https://platform.claude.com/cookbook/extended-thinking-extended-thinking
- **Extended Thinking Prompting Best Practices**: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#leverage-thinking-and-interleaved-thinking-capabilities
- **Pricing**: https://platform.claude.com/docs/en/about-claude/pricing

---

**Source**: https://platform.claude.com/docs/en/build-with-claude/extended-thinking
**Scraped by**: AI Tutorial Crawler
