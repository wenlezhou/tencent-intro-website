# Tool use with Claude - Claude Platform Docs

**URL**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

---

Tool use lets Claude call functions that you define or that Anthropic provides. Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application executes (client tools) or that Anthropic executes (server tools).

Here's a minimal example using a server tool, the [Web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool), which Anthropic executes for you:

## Quick start example

### Python example

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    tools=[{"type": "web_search_20250109", "name": "web_search"}],
    messages=[{"role": "user", "content": "What's the latest on the Mars rover?"}],
)
print(response.content)
```

Claude runs the search on Anthropic's infrastructure and returns the cited results in the same response. To have Claude call a tool that you define, pass a tool with an `input_schema`, then execute the call when Claude returns a `tool_use` block. [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools) and [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) cover that round trip.

## How tool use works

When you send a request with `tools`:

1. **Claude analyzes the request** - It examines the user's message and the available tools.
2. **Claude decides to call a tool** - If the request maps to a tool's described capability and the answer isn't already in context.
3. **Claude returns a structured call** - It returns `tool_use` blocks with the tool name and input parameters.
4. **Your application executes the tool** - For client tools, you run the function and send back a `tool_result`.
5. **Claude continues** - It uses the tool result to formulate its final response.

This enables powerful agentic workflows where Claude can:
- Search the web for current information
- Execute code to analyze data
- Read and write files
- Interact with APIs and databases
- Use calculators, calendars, or any other function you define

## Client tools vs Server tools

### Client tools
You define the schema and your application executes the call:
- **Full control** - You decide exactly how and when the tool executes.
- **Custom logic** - Add validation, logging, or side effects.
- **Security** - Keep API keys and sensitive operations in your infrastructure.

### Server tools
Anthropic defines the schema and executes the call on their infrastructure:
- **Zero setup** - Just pass `{"type": "web_search_20250109", "name": "web_search"}` - no handler code needed.
- **Managed execution** - Anthropic handles rate limits, errors, and scaling.
- **Additional charges** - Server tools incur usage-based fees (see [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)).

Available server tools:
- `web_search` - Search the web
- `web_fetch` - Retrieve web page content
- `code_execution` - Run Python code in a sandbox
- For the full list, see [Server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools).

## Best practices

### Write clear tool descriptions
The tool's `description` field is where you explain **when** Claude should use the tool and **what** it does. Be specific:

**Bad description:**
```json
{
  "name": "get_weather",
  "description": "Gets weather.",
  "input_schema": {...}
}
```

**Good description:**
```json
{
  "name": "get_weather",
  "description": "Get the current weather for a location. Use this when the user asks about weather, temperature, or forecast. Returns temperature in Fahrenheit and conditions.",
  "input_schema": {...}
}
```

### Use strict mode for reliable outputs
Add `"strict": true` to your tool definitions to guarantee that Claude's tool calls always conform to your schema. See [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use).

### Handle errors gracefully
When a tool call fails, return a `tool_result` with `is_error: true` and a helpful message. Claude will often self-correct:

```python
try:
    result = call_database(query)
    tool_result = {
        "type": "tool_result",
        "tool_use_id": tool_use["id"],
        "content": json.dumps(result)
    }
except Exception as e:
    tool_result = {
        "type": "tool_result",
        "tool_use_id": tool_use["id"],
        "content": f"Database error: {str(e)}. Please check the query syntax.",
        "is_error": True
    }
```

### Design for iteration
Tool use enables multi-step workflows. Design your prompts and tools to handle:
- **Ambiguous requests** - Claude can ask for clarification
- **Partial results** - Tools can return intermediate data
- **Error recovery** - Tools can suggest alternatives

## Next steps

- [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) - Understand the complete tool use loop.
- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools) - Write tool schemas and descriptions.
- [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) - Parse `tool_use` blocks and execute calls.
- [Server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools) - Use Anthropic-managed tools (web search, code execution, etc.).
- [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use) - Guarantee schema-compliant tool calls.

---

**抓取时间**: 2026-06-30 02:00:00
**抓取工具**: WebFetch
