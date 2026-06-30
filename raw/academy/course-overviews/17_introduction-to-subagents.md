# Introduction to Subagents

**URL**: https://anthropic.skilljar.com/introduction-to-subagents

---

## About this course

Learn how to use and create sub-agents in Claude Code to manage context, delegate tasks, and build specialized workflows that keep your main conversation clean and focused.

Sub-agents are one of the most practical ways to get more out of longer Claude Code sessions. They let you delegate tasks to isolated assistants that do their work separately and return just the information you need — keeping your main context window clean and your conversations focused.

In this course, you'll learn:

1. **How sub-agents work** — what happens when Claude Code spins up a separate context window, how inputs flow in, and how summaries come back
2. **Creating custom sub-agents** — using the `/agents` command to build sub-agents tailored to your workflow, from code reviewers to documentation generators
3. **Designing effective sub-agents** — patterns that make sub-agents reliable, including structured output formats, obstacle reporting, and limiting tool access
4. **When to use them (and when not to)** — practical guidance on where sub-agents help the most and the common anti-patterns to avoid

By the end, you'll know how to break complex work into focused pieces, build sub-agents that finish on time and report back clearly, and make the right call on when delegation is worth it.

---

## What You'll Learn

### 1. What are Sub-agents?
- Understanding sub-agents as isolated context windows
- How sub-agents differ from main conversation context
- Benefits: clean context, focused tasks, parallel execution

### 2. Creating a Sub-agent
- Using the `/agents` command in Claude Code
- Defining sub-agent roles and responsibilities
- Configuring sub-agent instructions and constraints
- Testing and iterating on sub-agent behavior

### 3. Designing Effective Sub-agents
- **Structured output formats** - Ensure consistent, parseable results
- **Obstacle reporting** - Handle errors and blocking issues gracefully
- **Limiting tool access** - Restrict sub-agents to necessary tools only
- **Clear task definitions** - Avoid ambiguous or overly broad tasks

### 4. Using Sub-agents Effectively
- **When to use sub-agents** - Complex tasks, context management, parallel work
- **When NOT to use sub-agents** - Simple tasks, tight feedback loops
- **Common anti-patterns** - Over-delegation, poor task boundaries
- **Best practices** - Keep tasks focused, design good handoffs

---

## Key Concepts

### What are Sub-agents?

**Sub-agents** are isolated assistants that Claude Code spins up to handle specific tasks in separate context windows.

- **Isolated context** - Each sub-agent has its own context window
- **Focused tasks** - Designed for specific, well-defined work
- **Separate execution** - Runs independently from main conversation
- **Structured returns** - Reports back with summaries and results

### How Sub-agents Work

1. **Spin up** - Claude Code creates a new context window for the sub-agent
2. **Input flow** - Task description and relevant context are passed in
3. **Execution** - Sub-agent works independently on the task
4. **Output** - Results and summaries are returned to main conversation
5. **Cleanup** - Sub-agent context is discarded, keeping main context clean

### Sub-agent vs. Main Conversation

| Aspect | Main Conversation | Sub-agent |
|--------|-------------------|------------|
| **Context** | Persistent, accumulates | Isolated, discarded after task |
| **Purpose** | Interactive dialogue | Focused task execution |
| **Tools** | Full access | Restricted (configurable) |
| **Output** | Direct responses | Structured summaries |
| **Best for** | Exploration, iteration | Repetitive tasks, parallel work |

---

## Creating Custom Sub-agents

### Using the `/agents` Command

```bash
# Create a new sub-agent
/agents create <name> --description "Description of when to use this agent"

# List all sub-agents
/agents list

# Edit a sub-agent
/agents edit <name>

# Delete a sub-agent
/agents delete <name>
```

### Sub-agent Configuration

A sub-agent definition includes:
1. **Name** - Unique identifier for the agent
2. **Description** - When to trigger this agent (used for automatic matching)
3. **Instructions** - Detailed prompt defining the agent's role and behavior
4. **Tool restrictions** - Which tools the agent can/cannot use
5. **Output format** - Expected structure for returned results

### Example: Code Reviewer Sub-agent

```markdown
---
name: code-reviewer
description: Review code for best practices, security issues, and clarity
---

You are a code reviewer. When invoked, you:
1. Read the provided code
2. Check for:
   - Security vulnerabilities
   - Performance issues
   - Best practice violations
   - Clarity and maintainability
3. Return a structured review with:
   - Severity level (critical/warning/suggestion)
   - File and line numbers
   - Description of issue
   - Suggested fix
```

---

## Designing Effective Sub-agents

### Pattern 1: Structured Output Formats

Ensure sub-agents return consistent, parseable results:

```json
{
  "status": "completed" | "blocked" | "partial",
  "results": [...],
  "issues": [...],
  "summary": "Brief description of what was done"
}
```

### Pattern 2: Obstacle Reporting

Handle errors gracefully:

```markdown
If you encounter an issue:
1. Describe the obstacle clearly
2. List what you tried
3. Suggest next steps for the main agent
4. Return status: "blocked" with details
```

### Pattern 3: Limiting Tool Access

Restrict sub-agents to necessary tools only:

```yaml
tools:
  allowed:
    - read
    - grep
    - bash (limited to read-only commands)
  denied:
    - write
    - edit
    - git (push/commit)
```

### Pattern 4: Clear Task Definitions

Avoid ambiguous tasks:

**Bad**: "Help me with the code"
**Good**: "Review the authentication middleware in `src/auth.js` for security vulnerabilities"

---

## When to Use Sub-agents

### ✅ Good Use Cases

1. **Complex, multi-step tasks**
   - "Research and summarize these 5 papers"
   - "Refactor this module and update all tests"

2. **Context management**
   - "Read and analyze these 20 log files"
   - "Process this large dataset"

3. **Parallel execution**
   - "Run these 3 independent analyses simultaneously"
   - "Generate documentation for all 10 modules"

4. **Repetitive tasks**
   - "Run linting on all files"
   - "Check all links in the documentation"

### ❌ Avoid Sub-agents For

1. **Simple, quick tasks**
   - "Fix this typo" (just do it in main conversation)

2. **Tight feedback loops**
   - "Iteratively debug this issue" (need interactive dialogue)

3. **Tasks requiring main context**
   - "Refactor this based on our earlier discussion" (needs conversation history)

---

## Common Anti-patterns

### 1. Over-delegation
**Problem**: Creating sub-agents for everything, even simple tasks
**Fix**: Use sub-agents only when they provide clear value (context isolation, parallelism)

### 2. Poor Task Boundaries
**Problem**: Sub-agent tasks are too broad or ambiguous
**Fix**: Define tight, specific tasks with clear outputs

### 3. No Error Handling
**Problem**: Sub-agent fails silently or returns unhelpful errors
**Fix**: Implement obstacle reporting and structured error formats

### 4. Tool Over-provisioning
**Problem**: Giving sub-agents full tool access "just in case"
**Fix**: Restrict to minimum necessary tools; add only as needed

---

## Practical Applications

### Application 1: Code Review Automation
- Create sub-agents for different review types (security, performance, style)
- Run them in parallel on pull requests
- Aggregate results into a comprehensive review

### Application 2: Documentation Generation
- Sub-agent reads code, generates docs
- Main agent reviews and edits
- Iterate until documentation is complete

### Application 3: Test Generation
- Sub-agent analyzes code paths
- Generates test cases
- Returns structured test suite

### Application 4: Refactoring
- Main agent defines refactoring plan
- Sub-agents execute individual steps
- Main agent integrates results

---

## Best Practices

1. **Keep tasks focused** - Each sub-agent should do one thing well
2. **Design good handoffs** - Clear inputs, clear expected outputs
3. **Handle errors gracefully** - Obstacle reporting, not silent failures
4. **Test incrementally** - Start simple, add complexity gradually
5. **Monitor and iterate** - Track sub-agent performance, refine as needed
6. **Document behavior** - Make it clear what each sub-agent does

---

## Workflow Integration

### Breaking Down Complex Work

**Without sub-agents**:
```
Main conversation context grows indefinitely
│
├─ Discussion of architecture
├─ Code implementation
├─ Testing
├─ Documentation
└─ Context is now 50K tokens and unwieldy
```

**With sub-agents**:
```
Main conversation (clean)
│
├─ Spins up: ImplementationSubagent
│   └─ Returns: implemented code + summary
│
├─ Spins up: TestSubagent  
│   └─ Returns: test results + coverage report
│
└─ Spins up: DocsSubagent
    └─ Returns: documentation + examples
```

---

## Debugging Sub-agents

### Issue: Sub-agent doesn't trigger
- Check description matching in `/agents list`
- Verify the task description aligns with agent's purpose
- Test with explicit invocation: `/agents run <name> <task>`

### Issue: Sub-agent returns poor results
- Review the agent's instructions
- Check if task definition is clear enough
- Add more structure to expected output format

### Issue: Sub-agent runs too long
- Add timeouts to agent configuration
- Break task into smaller pieces
- Add intermediate reporting

### Issue: Main context still grows
- Ensure sub-agent returns summaries, not raw outputs
- Check that sub-agent context is actually being discarded
- Review what gets passed back from sub-agent

---

**Scraped on**: 2026-06-30
**Source**: https://anthropic.skilljar.com/introduction-to-subagents
