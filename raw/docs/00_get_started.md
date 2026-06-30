# Get Started with Claude

**URL**: https://platform.claude.com/docs/en/get-started
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Prerequisites

- An Anthropic [Console account](https://platform.claude.com/)
- An [API key](https://platform.claude.com/settings/keys)

---

## Call the API

### Step 1: Set your API key

Export your API key as an environment variable. The SDK reads `ANTHROPIC_API_KEY` automatically.

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Step 2: Create a project and install the SDK

```bash
mkdir claude-quickstart && cd claude-quickstart
python3 -m venv .venv && source .venv/bin/activate
pip install anthropic
```

### Step 3: Create your code

Create a file called `quickstart.py`:

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "What should I search for to find the latest developments in renewable energy?",
        }
    ],
)
print(message.content)
```

### Step 4: Run your code

```bash
python quickstart.py
```

**Output**:
```
[TextBlock(citations=None, text='Here are some effective search strategies to find the latest developments in renewable energy:\n\n## General Search Terms\n- "Renewable energy news 2025"\n- ...', type='text')]
```

---

## Next Steps

You made your first API call. Next, learn the Messages API patterns you'll use in every Claude integration.

### Recommended Reading

1. **Working with the Messages API** - Learn multi-turn conversations, system prompts, stop reasons, and other core patterns.
   - URL: https://platform.claude.com/docs/en/build-with-claude/working-with-messages

2. **Models overview** - Compare Claude models by capability and cost.
   - URL: https://platform.claude.com/docs/en/about-claude/models/overview

3. **Features overview** - Browse all Claude capabilities: tools, context management, structured outputs, and more.
   - URL: https://platform.claude.com/docs/en/build-with-claude/overview

4. **Client SDKs** - Reference documentation for Python, TypeScript, C#, and other client libraries.
   - URL: https://platform.claude.com/docs/en/api-sdk/libraries/overview

---

## Key Changes from Old Platform (docs.anthropic.com)

The documentation has migrated from `docs.anthropic.com` to `platform.claude.com/docs/`.

**New features**:
- Updated for latest Claude models (Opus 4.8, Sonnet 4.6, Haiku 4.5, Opus 4.5)
- Revised Quickstart with multi-language support (cURL, CLI, Python, TypeScript, C#, Go, Java, PHP, Ruby)
- Improved navigation and search
- Integrated Cookbook links

**Content status**:
- Core concepts remain the same
- Code examples updated for latest SDK versions
- Model recommendations updated

---

**Source**: https://platform.claude.com/docs/en/get-started
**Scraped by**: AI Tutorial Crawler
