# Models Overview

**URL**: https://platform.claude.com/docs/en/about-claude/models/overview
**Platform**: platform.claude.com (New Documentation Platform)
**Scraped**: 2026-06-30

---

## Choosing a Model

If you're unsure which model to use, consider starting with **Claude Opus 4.8** for the most complex tasks. It is Anthropic's most capable Opus-tier model for complex reasoning, long-horizon agentic coding, and high-autonomy work. For workloads that need the highest available capability, see **Claude Fable 5**.

All current Claude models support:
- Text and image input
- Text output
- Multilingual capabilities
- Vision

Models are available through:
- Claude API
- [Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws)
- [Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
- [Google Cloud](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)
- [Microsoft Foundry](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)

---

## Latest Models Comparison

### Claude Fable 5 and Claude Mythos 5

| Feature | Claude Fable 5 | Claude Mythos 5 |
|---------|-----------------|-----------------|
| **Description** | Anthropic's most capable widely released model, for the most demanding reasoning and long-horizon agentic work | Available through Project Glasswing. Successor to Claude Mythos Preview. |
| **Claude API ID** | `claude-fable-5` | `claude-mythos-5` |
| **AWS Bedrock ID** | anthropic.claude-fable-5 (Limited availability) | - |
| **Google Cloud ID** | claude-fable-5 (Limited availability) | - |
| **Extended thinking** | No | No |
| **Adaptive thinking** | Yes (always on) | Yes (always on) |
| **Context window** | 1M tokens | 1M tokens |
| **Max output** | 128k tokens | 128k tokens |
| **Pricing** | $10 / $50 per MTok (input / output) | $10 / $50 per MTok (input / output) |

**Availability**:
- **Claude Fable 5**: Generally available on Claude API, Claude Platform on AWS, Amazon Bedrock, Google Cloud, and Microsoft Foundry beginning June 9, 2026.
- **Claude Mythos 5**: Not generally available. Offered in limited availability to approved customers in [Project Glasswing](https://anthropic.com/glasswing), beginning the same day. For access, contact your Anthropic, AWS, or Google Cloud account team.

### Claude Opus 4.8, Sonnet 4.6, Haiku 4.5

| Feature | Claude Opus 4.8 | Claude Sonnet 4.6 | Claude Haiku 4.5 |
|---------|-------------------|--------------------|---------------------|
| **Description** | Anthropic's most capable Opus-tier model for complex reasoning and agentic coding | The best combination of speed and intelligence | The fastest model with near-frontier intelligence |
| **Claude API ID** | `claude-opus-4-8` | `claude-sonnet-4-6` | `claude-haiku-4-5-20251001` |
| **Claude API alias** | claude-opus-4-8 | claude-sonnet-4-6 | claude-haiku-4-5 |
| **AWS Bedrock ID** | anthropic.claude-opus-4-83 | anthropic.claude-sonnet-4-6 | anthropic.claude-haiku-4-5-20251001-v1:0 |
| **Google Cloud ID** | claude-opus-4-8 | claude-sonnet-4-6 | claude-haiku-4-5@20251001 |
| **Pricing** | $15 / input MTok, $25 / output MTok | $3 / input MTok, $15 / output MTok | $1 / input MTok, $5 / output MTok |
| **Extended thinking** | No | Yes | Yes |
| **Adaptive thinking** | Yes | Yes | No |
| **Comparative latency** | Moderate | Fast | Fastest |
| **Context window** | 1M tokens | 1M tokens | 200k tokens |
| **Max output** | 128k tokens | 128k tokens | 64k tokens |
| **Reliable knowledge cutoff** | Jan 2026 | Aug 2025 | Feb 2025 |
| **Training data cutoff** | Jan 2026 | Jan 2026 | Jul 2025 |

**Notes**:
1. See [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) for complete pricing information including Batch API discounts and prompt caching rates.
2. **Reliable knowledge cutoff** indicates the date through which a model's knowledge is most extensive and reliable. **Training data cutoff** is the broader date range of training data used. For more information, see [Anthropic's Transparency Hub](https://www.anthropic.com/transparency).
3. Claude Opus 4.8 is available on Bedrock through [Claude in Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock) (the Messages-API Bedrock endpoint).

---

## Key Features

### Model Versioning

Every Claude model ID is a **pinned snapshot**. Models with a date in the ID (for example, `20250929`) are fixed to that specific release. Starting with the Claude 4.6 generation, model IDs use a dateless format that is also a pinned snapshot, not an evergreen pointer. For models before the 4.6 generation, entries in the Claude API alias column are convenience pointers that resolve to a dated model ID. For details on the naming convention and how versioning works, see [Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions).

### Endpoints (Bedrock & Google Cloud)

Starting with **Claude Sonnet 4.5 and all subsequent models** (including Claude Sonnet 4.6), Bedrock offers two endpoint types:
- **Global endpoints** (dynamic routing for maximum availability)
- **Regional endpoints** (guaranteed data routing through specific geographic regions)

Google Cloud offers three endpoint types:
- Global endpoints
- **Multi-region endpoints** (dynamic routing within a geographic area)
- Regional endpoints

For more information, see [Cloud platform pricing](https://platform.claude.com/docs/en/about-claude/pricing#cloud-platform-pricing).

### Claude Platform on AWS

**Claude Platform on AWS** uses the same model IDs as the Claude API (for example, `claude-opus-4-6`), not Bedrock-style IDs. Model lifecycle on Claude Platform on AWS follows Anthropic's first-party [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations), not Bedrock's. See [Available models](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#available-models) for the model list.

### Programmatic Model Query

You can query model capabilities and token limits programmatically with the [Models API](https://platform.claude.com/docs/en/api/models/list). The response includes `max_input_tokens`, `max_tokens`, and a `capabilities` object for every available model.

### Effort Parameter (Claude Opus 4.8+)

On Claude Opus 4.8, the `effort` parameter defaults to `high` on all surfaces, including the Claude API and Claude Code. Set `effort` explicitly to use a different level. See [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) for guidance on choosing a level.

### Extended Output (Beta)

The Max output values above apply to the synchronous Messages API. On the [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing#extended-output-beta), Claude Opus 4.8, Opus 4.7, Opus 4.6, and Sonnet 4.6 support up to 300k output tokens by using the `output-300k-2026-03-24` beta header.

---

## Prompt and Output Performance

Claude 4 models excel in:

1. **Performance**: Top-tier results in reasoning, coding, multilingual tasks, long-text handling, honesty, and image processing. See the [Claude 4 blog post](https://www.anthropic.com/news/claude-4) for more information.

2. **Engaging responses**: Claude models are ideal for applications that require rich, human-like interactions.
   - If you prefer more concise responses, you can adjust your prompts to guide the model toward the desired output length. Refer to the [prompt engineering guides](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering) for details.
   - For prompting best practices, see [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

3. **Output quality**: When migrating from previous model generations to Claude 4, you may notice larger improvements in overall performance.

---

## Migration Guides

### Migrating to Claude Opus 4.8

If you're currently using Claude Opus 4.7 or earlier Claude models, see [Migrating to Claude Opus 4.8](https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-from-claude-opus-47).

### Migrating to Claude Opus 4.7

If you're currently using Claude Opus 4.6 or older Claude models, see [Migrating to Claude Opus 4.7](https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7).

---

## Get Started with Claude

If you're ready to start exploring what Claude can do for you, dive in! Whether you're a developer looking to integrate Claude into your applications or a user wanting to experience the power of AI firsthand, the following resources can help.

**Looking to chat with Claude?** Visit [claude.ai](https://claude.ai)!

### Resources

1. **Intro to Claude** - Explore Claude's capabilities and development flow.
   - URL: https://platform.claude.com/docs/en/intro

2. **Quickstart** - Learn how to make your first API call in minutes.
   - URL: https://platform.claude.com/docs/en/get-started

3. **Claude Console** - Craft and test powerful prompts directly in your browser.
   - URL: https://platform.claude.com/

If you have any questions or need assistance, don't hesitate to reach out to the [support team](https://support.claude.com/) or consult the [Discord community](https://www.anthropic.com/discord).

---

## Key Differences from Old Platform (docs.anthropic.com)

1. **New models**: Claude Fable 5, Claude Mythos 5, Opus 4.8, Sonnet 4.6, Haiku 4.5
2. **Adaptive thinking**: New feature on Opus 4.8 and Sonnet 4.6
3. **Effort parameter**: New on Opus 4.8
4. **Extended output beta**: Up to 300k output tokens on Batches API
5. **Model ID versioning**: Dateless format for Claude 4.6+ models
6. **Endpoint options**: Global vs. regional endpoints on Bedrock/Google Cloud

---

**Source**: https://platform.claude.com/docs/en/about-claude/models/overview
**Scraped by**: AI Tutorial Crawler
