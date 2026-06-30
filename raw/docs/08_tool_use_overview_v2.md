# Tool Use with Claude (Overview)

**URL**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

Tool use lets Claude call functions that you define or that Anthropic provides. Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application executes (client tools) or that Anthropic executes (server tools).

**Minimal example using a server tool** (Web search):

```python
client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    tools=[{"type": "web_search_20260209", "name": "web_search"}],
    messages=[{"role": "user", "content": "What's the latest on the Mars rover?"}],
)
print(response.content)
```

Claude runs the search on Anthropic's infrastructure and returns the cited results in the same response.

---

## How Tool Use Works

Tools differ primarily by where the code executes.

### Client Tools

**User-defined tools** and **Anthropic-schema tools** (e.g., `bash`, `text_editor`) run in your application.

- Claude responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks
- Your code executes the operation
- Send back a `tool_result`

### Server Tools

**Anthropic-executed tools** (`web_search`, `web_fetch`, `code_execution`, `tool_search`) run on Anthropic's infrastructure.

- You see the results directly without handling execution
- Exception: If Claude calls the tool in the same group of parallel tool calls as one of your client tools, you need to handle execution (see [Stop reasons and fallback](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons#tool-use))

For the full conceptual model including the agentic loop and when to choose each approach, see [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works).

For connecting to Model Context Protocol (MCP) servers, see the [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector). For building your own MCP client, see the Model Context Protocol guide to [building an MCP client](https://modelcontextprotocol.io/docs/develop/build-client).

---

## When Claude Uses Tools

With the default `tool_choice` of `{"type": "auto"}`, Claude determines on each turn whether to call a tool or respond directly.

- **Calls a tool when**: The request maps to that tool's described capability and the answer isn't already in context
- **Responds directly for**: Stable knowledge, creative tasks, and conversational turns

### Steering Tool Use

This boundary is steerable through your system prompt:

- Light instruction: `"Use the tools to investigate before responding."` → increases tool use
- Stronger form: `"Always call a tool first before responding."` → pushes further
- Conversely: `"Use your judgment about whether to call a tool or respond directly."` → keeps triggering behavior conservative

### Forcing Tool Use

To require a tool call rather than rely on prompting, set [`tool_choice`](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools#forcing-tool-use).

### Guarantee Schema Conformance with Strict Tool Use

Add `strict: true` to your custom tool definitions to ensure Claude's tool calls always match your schema exactly. See [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use).

---

## Choose a Tool

For `type` strings, versions, and beta headers, see [Tool reference](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference).

### 1. Your Own Tools

For tools you define, you write the schema and your application executes each call.

- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools) — Specity tool schemas, write descriptions, and control when Claude calls your tools.
- [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) — Parse `tool_use` blocks, format `tool_result` responses, and handle errors.

### 2. Anthropic-Schema Client Tools

Anthropic publishes the schema and trains Claude on it. Your application still executes each call and returns the `tool_result`.

- [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) — Store and retrieve information across conversations in files you control.
- [Bash tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/bash-tool) — Run shell commands in a persistent session that maintains state.
- [Text editor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/text-editor-tool) — View and modify text files to debug, fix, and improve code.
- [Computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) — Take screenshots and control the mouse and keyboard in a desktop environment.

### 3. Server Tools

Server tools run on Anthropic's infrastructure, with no handler code in your application. See [Server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools) for the mechanics they share.

- [Web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) — Search the web for information beyond the knowledge cutoff, with cited sources.
- [Web fetch tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool) — Retrieve the full content of specified web pages and PDF documents.
- [Code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool) — Run Python and bash code in a sandboxed container to analyze data and generate files.
- [Advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) — Let a faster executor model consult a higher-intelligence advisor model mid-generation.
- [Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) — Work with thousands of tools by discovering and loading them on demand.
- [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) — Connect to remote MCP servers from the Messages API without a separate MCP client.

**Claude Managed Agents** provides a built-in toolset that Claude uses autonomously within a session. For that toolset and the Managed Agents way to add custom tools, see its [Tools](https://platform.claude.com/docs/en/managed-agents/tools) page.

---

## Pricing

Tool use requests are priced based on:

1. The total number of input tokens sent to the model (including in the `tools` parameter)
2. The number of output tokens generated
3. For server-side tools, additional usage-based pricing (e.g., web search charges per search performed)

Client-side tools are priced the same as any other Claude API request, while server-side tools may incur additional charges based on their specific usage.

### Additional Tokens from Tool Use

- The `tools` parameter in API requests (tool names, descriptions, and schemas)
- `tool_use` content blocks in API requests and responses
- `tool_result` content blocks in API requests

### Tool Use System Prompt Tokens

When you use `tools`, the API also automatically includes a special system prompt for the model which enables tool use. The number of tool use tokens required for each model are listed below (excluding the additional tokens listed above). Note that the table assumes at least 1 tool is provided. If no `tools` are provided, then a tool choice of `none` uses 0 additional system prompt tokens.

| Model | `tool_choice`: `auto`, `none` | `tool_choice`: `any`, `tool` |
|-------|-----------------------------|-------------------------------|
| Claude Opus 4.8 | 290 tokens | 410 tokens |
| Claude Opus 4.7 | 675 tokens | 804 tokens |
| Claude Opus 4.6 | 497 tokens | 589 tokens |
| Claude Opus 4.5 | 496 tokens | 588 tokens |
| Claude Sonnet 4.6 | 497 tokens | 589 tokens |
| Claude Sonnet 4.5 | 496 tokens | 588 tokens |
| Claude Haiku 4.5 | 496 tokens | 588 tokens |

These token counts are added to your normal input and output tokens to calculate the total cost of a request.

Some server tools add usage-based charges on top of tokens: see [Web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool#usage-and-pricing) and [Code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool#usage-and-pricing) for their rates.

---

## Next Steps

- [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) — Understand the tool use loop, where tools execute, and when to use tools instead of prose.
- [Tutorial: Build a tool-using agent](https://platform.claude.com/docs/en/agents-and-tools/tool-use/build-a-tool-using-agent) — A guided walkthrough from a single tool call to a production-ready agentic loop.
- [Tool reference](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference) — Directory of Anthropic-provided tools and reference for optional tool definition properties.

---

**Source**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
**Scraped by**: AI Tutorial Crawler
