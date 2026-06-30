# Claude Managed Agents Overview

**URL**: https://platform.claude.com/docs/en/managed-agents/overview
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Overview

Claude Managed Agents provides the harness and infrastructure for running Claude as an autonomous agent. Instead of building your own agent loop, tool execution, and runtime, you get a fully managed environment where Claude can read files, run commands, browse the web, and execute code securely. The harness supports built-in prompt caching, compaction, and other performance optimizations for high-quality, efficient agent outputs.

**Two ways to build with Claude**:

| Feature | What it is | Best for |
|---------|--------------|----------|
| **Messages API** | Direct model prompting access | Custom agent loops and fine-grained control |
| **Claude Managed Agents** | Pre-built, configurable agent harness that runs in managed infrastructure | Long-running tasks and asynchronous work |

---

## Core Concepts

Claude Managed Agents is built around four concepts:

| Concept | Description |
|---------|-------------|
| **Agent** | The model, system prompt, tools, MCP servers, and skills |
| **Environment** | Configuration for where sessions run: an Anthropic-managed cloud sandbox, or a self-hosted sandbox on your own infrastructure |
| **Session** | A running agent instance within an environment, performing a specific task and generating outputs |
| **Events** | Messages exchanged between your application and the agent (user turns, tool results, status updates) |

---

## How It Works

### 1. Create an Agent

Define the model, system prompt, tools, MCP servers, and skills. Create the agent once and reference it by ID across sessions.

### 2. Create an Environment

Configure where the agent runs:
- A **cloud sandbox** (Anthropic-managed)
- A **self-hosted sandbox** on your own infrastructure ([Self-hosted sandboxes](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes))

### 3. Start a Session

Launch a session that references your agent and environment configuration.

### 4. Send Events and Stream Responses

Send user messages as events. Claude autonomously executes tools and streams back results through server-sent events (SSE). Event history is persisted server-side and can be fetched in full.

### 5. Steer or Interrupt

Send additional user events to guide the agent mid-execution, or interrupt it to change direction.

---

## When to Use Claude Managed Agents

Claude Managed Agents is best for workloads that need:

1. **Long-running execution**: Tasks that run for minutes or hours with multiple tool calls
2. **Cloud infrastructure**: Secure sandboxes with pre-installed packages and network access
3. **Self-hosted execution**: Sandboxes on infrastructure you control for compliance or data-residency requirements
4. **Minimal infrastructure**: No need to build your own agent loop, sandbox, or tool execution layer
5. **Stateful sessions**: Persistent filesystems and conversation history across multiple interactions

---

## Supported Tools

Claude Managed Agents gives Claude access to a set of built-in tools:

1. **Bash**: Run shell commands in the sandbox
2. **File operations**: Read, write, edit, glob, and grep files in the sandbox
3. **Web search and fetch**: Search the web and retrieve content from URLs
4. **MCP servers**: Connect to external tool providers

See [Tools](https://platform.claude.com/docs/en/managed-agents/tools) for the full list and configuration options.

---

## Beta Access

Claude Managed Agents is currently in **beta**. All Managed Agents endpoints require the `managed-agents-2026-04-01` beta header. The SDK sets the beta header automatically. Behaviors may be refined between releases to improve outputs.

### To Get Started, You Need:

1. A [Claude API key](https://platform.claude.com/settings/keys)
2. The `managed-agents-2026-04-01` beta header on all requests
3. Access to Claude Managed Agents (enabled by default for all API accounts)

### Limited Research Preview Features

Within the beta, [MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview) and [dreaming](https://platform.claude.com/docs/en/managed-agents/dreams) are in a more limited research preview. [Request access](https://claude.com/form/claude-managed-agents) to enable them.

---

## Data Retention and Privacy

Claude Managed Agents is **stateful by design**:
- Sessions are long-running, resume cleanly after pauses
- Stores conversation history, sandbox state, and outputs server-side

Because of this, Managed Agents is **not currently eligible** for:
- [Zero Data Retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#zero-data-retention-zdr-scope) (ZDR)
- HIPAA Business Associate Agreement (BAA) coverage

**You retain control over this data**:
- You can [delete sessions](https://platform.claude.com/docs/en/managed-agents/session-operations#deleting-a-session) at any time
- You can separately delete any [files](https://platform.claude.com/docs/en/build-with-claude/files#delete-a-file) you uploaded

For eligibility across all features, see [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#feature-eligibility).

---

## AWS Claude Platform on AWS

Claude Managed Agents is also available on **Claude Platform on AWS**, with some differences in feature availability and session behavior. See [Claude Managed Agents](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#claude-managed-agents) in the Claude Platform on AWS guide.

---

## Resources

### Quickstart
Create your first agent session.
- URL: https://platform.claude.com/docs/en/managed-agents/quickstart

### Sessions
Create a session and send your first event.
- URL: https://platform.claude.com/docs/en/managed-agents/sessions

### Reference
Event types, rate limits, CLI flags, and other lookup tables.
- URL: https://platform.claude.com/docs/en/managed-agents/reference

---

## Key Differences from Messages API

| Aspect | Messages API | Claude Managed Agents |
|--------|---------------|----------------------|
| **Agent loop** | You build it | Pre-built and managed |
| **Tool execution** | You implement it | Managed by Anthropic |
| **Infrastructure** | You provide it | Cloud sandbox provided |
| **State** | Stateless (you send full history) | Stateful (server-side persistence) |
| **Best for** | Custom control, real-time apps | Long-running tasks, async work |
| **ZDR eligibility** | Yes (for most features) | No (because of stateful design) |

---

**Source**: https://platform.claude.com/docs/en/managed-agents/overview
**Scraped by**: AI Tutorial Crawler
