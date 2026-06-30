# Using the Messages API

**URL**: https://platform.claude.com/docs/en/build-with-claude/working-with-messages
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

This guide covers common patterns for working with the Messages API, including basic requests, multi-turn conversations, prefill techniques, and vision capabilities. For complete API specifications, see the [Messages API reference](https://platform.claude.com/docs/en/api/messages/create).

**Two ways to build with Claude**:

| Feature | What it is | Best for |
|---------|--------------|----------|
| **Messages API** | Direct model prompting access | Custom agent loops and fine-grained control |
| **Claude Managed Agents** | Pre-built, configurable agent harness that runs in managed infrastructure | Long-running tasks and asynchronous work |

---

## Basic Request and Response

### Important Change for Claude Opus 4.7+

The `temperature`, `top_p`, and `top_k` sampling parameters are **not supported** on Claude Opus 4.7 and later models, including Claude Opus 4.8. Setting them to a non-default value returns a 400 error. Omit them from request payloads and use prompting to guide the model's behavior instead.

### Example Request (Python)

```python
message = anthropic.Anthropic().messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
print(message)
```

### Example Response

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello!"
    }
  ],
  "model": "claude-opus-4-8",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 12,
    "output_tokens": 6
  }
}
```

### Refusal Responses (Claude Opus 4.7+)

On Claude Opus 4.7 and later models, refusal responses (`stop_reason: "refusal"`) also include a `stop_details` object identifying the policy category that triggered the refusal. See [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response) for the field reference and example handling code.

---

## Multiple Conversational Turns

The Messages API is **stateless**, which means that you always send the full conversational history to the API. You can use this pattern to build up a conversation over time. Earlier conversational turns don't necessarily need to actually originate from Claude. You can use synthetic `assistant` messages.

### Example: Multi-turn Conversation

```python
message = anthropic.Anthropic().messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"},
        {"role": "assistant", "content": "Hello!"},
        {"role": "user", "content": "Can you describe LLMs to me?"},
    ],
)
print(message)
```

### Response

```json
{
  "id": "msg_018gCsTGsXkYJVqYPxTgDHBU",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Sure, I'd be happy to provide..."
    }
  ],
  "model": "claude-opus-4-8",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 309
  }
}
```

---

## System Role in Messages

On Claude Opus 4.8, you can include messages with `"role": "system"` after a user turn (subject to [placement rules](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#limitations)) to add a new system instruction partway through a conversation. 

**Important Rules**:
- A `system` message **cannot be the first entry** in `messages`; use the top-level `system` field for instructions that apply from the start.
- A mid-conversation system message has the **same authority** as the top-level `system` field, but because it is appended to the end of the message history, it does **not invalidate** any cached prefix that came before it.
- Use the **top-level `system` field** for instructions that should apply from the very first turn.
- Use a **mid-conversation system message** for instructions that only become relevant later.

See [Mid-conversation system messages](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages) for the complete guide, including how to combine it with [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

---

## Putting Words in Claude's Mouth (Prefilling)

You can **pre-fill** part of Claude's response in the last position of the input messages list. This can be used to shape Claude's response.

### Example: Forced Multiple Choice

The example below uses `"max_tokens": 1` to get a single multiple choice answer from Claude.

```python
message = anthropic.Anthropic().messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1,
    messages=[
        {
            "role": "user",
            "content": "What is latin for Ant? (A) Apoidea, (B) Rhopalocera, (C) Formicidae",
        },
        {"role": "assistant", "content": "The answer is ("},
    ],
)
print(message)
```

### Response

```json
{
  "id": "msg_01Q8Faay6S7QPTvEUUQARt7h",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "C"
    }
  ],
  "model": "claude-sonnet-4-5",
  "stop_reason": "max_tokens",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 42,
    "output_tokens": 1
  }
}
```

### ⚠️ Prefilling Not Supported On:

- Claude Opus 4.8
- Claude Opus 4.7
- Claude Opus 4.6
- Claude Sonnet 4.6
- Claude Haiku 4.5
- Claude Opus 4.5
- Claude Sonnet 4.5
- **Claude Fable 5**
- **Claude Mythos 5** ([Project Glasswing](https://anthropic.com/glasswing))
- **Claude Mythos Preview** ([Project Glasswing](https://anthropic.com/glasswing))

Requests using prefill with these models return a **400 error**. Use [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) on models that support it, or system prompt instructions, instead. See the [migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide) for migration patterns.

---

## Vision

Claude can read both text and images in requests. Images can be supplied using the `base64`, `url`, or `file` source types. The `file` source type references an image uploaded through the [Files API](https://platform.claude.com/docs/en/build-with-claude/files). 

**Supported media types**: `image/jpeg`, `image/png`, `image/gif`, and `image/webp`.

See the [vision guide](https://platform.claude.com/docs/en/build-with-claude/vision) for more details.

### Example: Image Analysis

```python
import base64
import httpx

# Option 1: Base64-encoded image
image_url = "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
image_media_type = "image/jpeg"
image_data = base64.standard_b64encode(httpx.get(image_url).content).decode("utf-8")

message = anthropic.Anthropic().messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": image_media_type,
                        "data": image_data,
                    },
                },
                {"type": "text", "text": "What is in the above image?"},
            ],
        }
    ],
)
print(message)

# Option 2: URL-referenced image
message_from_url = anthropic.Anthropic().messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg",
                    },
                },
                {"type": "text", "text": "What is in the above image?"},
            ],
        }
    ],
)
print(message_from_url)
```

### Response

```json
{
  "id": "msg_01EcyWo6m4hyW8KHs2y2pei5",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "This image shows an ant, specifically a close-up view of an ant. The ant is shown in detail, with its distinct head, antennae, and legs clearly visible. The image is focused on capturing the intricate details and features of the ant, likely taken with a macro lens to get an extreme close-up perspective."
    }
  ],
  "model": "claude-opus-4-8",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 1551,
    "output_tokens": 71
  }
}
```

---

## Next Steps

After learning the Messages API basics, explore these advanced topics:

1. **Stop reasons and fallback** - Handle each `stop_reason` value and decide what to do when a response ends.
   - URL: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons

2. **Tool use with Claude** - Give Claude tools to call external services and APIs from within the Messages API.
   - URL: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

3. **Computer use tool** - Control desktop computer environments with the Messages API.
   - URL: https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool

4. **Structured outputs** - Get guaranteed, schema-validated JSON output from Claude.
   - URL: https://platform.claude.com/docs/en/build-with-claude/structured-outputs

5. **Task budgets** - Set an advisory token budget across a full agentic loop with `output_config.task_budget`.
   - URL: https://platform.claude.com/docs/en/build-with-claude/task-budgets

---

## Zero Data Retention (ZDR) Eligibility

This feature is eligible for [Zero Data Retention (ZDR)](https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention). When your organization has a ZDR arrangement, data sent through this feature is **not stored** after the API response is returned.

---

## Key Differences from Old Platform (docs.anthropic.com)

1. **Model support** - Updated for Claude Opus 4.8, Sonnet 4.6, Haiku 4.5, and Fable 5
2. **Prefilling restrictions** - Not supported on newest models (use structured outputs instead)
3. **Sampling parameters** - `temperature`, `top_p`, `top_k` not supported on Opus 4.7+
4. **Mid-conversation system messages** - New feature for dynamic instruction updates
5. **Task budgets** - New feature for agentic loop token management
6. **Code examples** - Updated for latest SDK versions

---

**Source**: https://platform.claude.com/docs/en/build-with-claude/working-with-messages
**Scraped by**: AI Tutorial Crawler
