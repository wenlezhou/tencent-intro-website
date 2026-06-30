# Claude Cookbook 总览

来源: [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)

## 简介

Claude Cookbook 提供用于帮助开发者构建 Claude 应用的代码示例和指南，包含可直接复用的代码片段。

The Claude Cookbooks provide code and guides designed to help developers build with Claude, offering copy-able code snippets that you can easily integrate into your own projects.

## Prerequisites

To make the most of the examples in this cookbook, you'll need a Claude API key (sign up for free [here](https://www.anthropic.com)).

While the code examples are primarily written in Python, the concepts can be adapted to any programming language that supports interaction with the Claude API.

If you're new to working with the Claude API, we recommend starting with our [Claude API Fundamentals course](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals) to get a solid foundation.

## Explore Further

Looking for more resources to enhance your experience with Claude and AI assistants? Check out these helpful links:

- [Anthropic developer documentation](https://docs.claude.com/claude/docs/guide-to-anthropics-prompt-engineering-resources)
- [Anthropic support docs](https://support.anthropic.com)
- [Anthropic Discord community](https://www.anthropic.com/discord)

## Contributing

The Claude Cookbooks thrives on the contributions of the developer community. We value your input, whether it's submitting an idea, fixing a typo, adding a new guide, or improving an existing one. By contributing, you help make this resource even more valuable for everyone.

To avoid duplication of efforts, please review the existing issues and pull requests before contributing.

If you have ideas for new examples or guides, share them on the [issues page](https://github.com/anthropics/anthropic-cookbook/issues).

## 完整 README 内容

# Claude Cookbooks

The Claude Cookbooks provide code and guides designed to help developers build with Claude, offering copy-able code snippets that you can easily integrate into your own projects.

## Prerequisites

To make the most of the examples in this cookbook, you'll need a Claude API key (sign up for free [here](https://www.anthropic.com)).

While the code examples are primarily written in Python, the concepts can be adapted to any programming language that supports interaction with the Claude API.

If you're new to working with the Claude API, we recommend starting with our [Claude API Fundamentals course](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals) to get a solid foundation.

## Explore Further

Looking for more resources to enhance your experience with Claude and AI assistants? Check out these helpful links:

- [Anthropic developer documentation](https://docs.claude.com/claude/docs/guide-to-anthropics-prompt-engineering-resources)
- [Anthropic support docs](https://support.anthropic.com)
- [Anthropic Discord community](https://www.anthropic.com/discord)

## Contributing

The Claude Cookbooks thrives on the contributions of the developer community. We value your input, whether it's submitting an idea, fixing a typo, adding a new guide, or improving an existing one. By contributing, you help make this resource even more valuable for everyone.

To avoid duplication of efforts, please review the existing issues and pull requests before contributing.

If you have ideas for new examples or guides, share them on the [issues page](https://github.com/anthropics/anthropic-cookbook/issues).

## Table of recipes

### Capabilities
- [Classification](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/classification): Explore techniques for text and data classification using Claude.
- [Retrieval Augmented Generation](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/retrieval_augmented_generation): Learn how to enhance Claude's responses with external knowledge.
- [Summarization](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/summarization): Discover techniques for effective text summarization with Claude.

### Tool Use and Integration
- [Tool use](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use): Learn how to integrate Claude with external tools and functions to extend its capabilities.
  - [Customer service agent](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/customer_service_agent.ipynb)
  - [Calculator integration](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/calculator_tool.ipynb)
  - [SQL queries](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_make_sql_queries.ipynb)

### Third-Party Integrations
- [Retrieval augmented generation](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party): Supplement Claude's knowledge with external data sources.
  - [Vector databases (Pinecone)](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Pinecone/rag_using_pinecone.ipynb)
  - [Wikipedia](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Wikipedia/wikipedia-search-cookbook.ipynb/)
  - [Web pages](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/read_web_pages_with_haiku.ipynb)
- [Embeddings with Voyage AI](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/VoyageAI/how_to_create_embeddings.md)

### Multimodal Capabilities
- [Vision with Claude](https://github.com/anthropics/anthropic-cookbook/tree/main/multimodal): 
  - [Getting started with images](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/getting_started_with_vision.ipynb)
  - [Best practices for vision](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/best_practices_for_vision.ipynb)
  - [Interpreting charts and graphs](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/reading_charts_graphs_powerpoints.ipynb)
  - [Extracting content from forms](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/how_to_transcribe_text.ipynb)
- [Generate images with Claude](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/illustrated_responses.ipynb): Use Claude with Stable Diffusion for image generation.

### Advanced Techniques
- [Sub-agents](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/using_sub_agents.ipynb): Learn how to use Haiku as a sub-agent in combination with Opus.
- [Upload PDFs to Claude](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/pdf_upload_summarization.ipynb): Parse and pass PDFs as text to Claude.
- [Automated evaluations](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_evals.ipynb): Use Claude to automate the prompt evaluation process.
- [Enable JSON mode](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb): Ensure consistent JSON output from Claude.
- [Create a moderation filter](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_moderation_filter.ipynb): Use Claude to create a content moderation filter for your application.
- [Prompt caching](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.ipynb): Learn techniques for efficient prompt caching with Claude.

## Additional Resources

- [Anthropic on AWS](https://github.com/aws-samples/anthropic-on-aws): Explore examples and solutions for using Claude on AWS infrastructure.
- [AWS Samples](https://github.com/aws-samples/): A collection of code samples from AWS which can be adapted for use with Claude. Note that some samples may require modification to work optimally with Claude.


# Claude Cookbook 目录结构

## /anthropic_cookbook/
  - __init__.py

## /capabilities/
  - README.md
  - classification
  - contextual-embeddings
  - knowledge_graph
  - retrieval_augmented_generation
  - summarization
  - text_to_sql

## /claude_agent_sdk/
  - 00_The_one_liner_research_agent.ipynb
  - 01_The_chief_of_staff_agent.ipynb
  - 02_The_observability_agent.ipynb
  - 03_The_site_reliability_agent.ipynb
  - 04_migrating_from_openai_agents_sdk.ipynb
  - 05_Building_a_session_browser.ipynb
  - 06_The_vulnerability_detection_agent.ipynb
  - 07_Hosting_the_agent.ipynb
  - README.md
  - chief_of_staff_agent
  - hosting
  - observability_agent
  - pyproject.toml

## /coding/
  - prompting_for_frontend_aesthetics.ipynb

## /extended_thinking/
  - extended_thinking.ipynb
  - extended_thinking_with_tool_use.ipynb

## /fable_5_fallback_billing/
  - guide.ipynb

## /finetuning/
  - datasets
  - finetuning_on_bedrock.ipynb

## /images/
  - best_practices
  - frontend_aesthetics
  - reading_charts_graphs
  - sunset-dawn-nature-mountain-preview.jpg
  - sunset.jpeg
  - tool_use
  - transcribe
  - using_sub_agents

## /managed_agents/
  - CMA_coordinate_specialist_team.ipynb
  - CMA_explore_unfamiliar_codebase.ipynb
  - CMA_gate_human_in_the_loop.ipynb
  - CMA_iterate_fix_failing_tests.ipynb
  - CMA_operate_in_production.ipynb
  - CMA_orchestrate_issue_to_pr.ipynb
  - CMA_prompt_versioning_and_rollback.ipynb
  - CMA_remember_user_preferences.ipynb
  - CMA_verify_with_outcome_grader.ipynb
  - README.md
  - cma-mcp
  - data_analyst_agent.ipynb
  - example_data

## /misc/
  - batch_processing.ipynb
  - building_evals.ipynb
  - building_moderation_filter.ipynb
  - data
  - generate_test_cases.ipynb
  - how_to_enable_json_mode.ipynb
  - how_to_make_sql_queries.ipynb
  - metaprompt.ipynb
  - pdf_upload_summarization.ipynb
  - prompt_caching.ipynb
  - read_web_pages_with_haiku.ipynb
  - sampling_past_max_tokens.ipynb
  - session_memory_compaction.ipynb
  - speculative_prompt_caching.ipynb
  - using_citations.ipynb

## /multimodal/
  - best_practices_for_vision.ipynb
  - crop_tool.ipynb
  - documents
  - getting_started_with_vision.ipynb
  - how_to_transcribe_text.ipynb
  - reading_charts_graphs_powerpoints.ipynb
  - using_sub_agents.ipynb

## /observability/
  - usage_cost_api.ipynb

## /patterns/
  - agents

## /scripts/
  - detect-secrets
  - test_notebooks.py
  - validate_all_notebooks.py
  - validate_authors_sorted.py
  - validate_notebooks.py

## /skills/
  - CLAUDE.md
  - README.md
  - assets
  - custom_skills
  - file_utils.py
  - notebooks
  - requirements.txt
  - sample_data
  - skill_utils.py

## /tests/
  - __init__.py
  - conftest.py
  - notebook_tests

## /third_party/
  - Deepgram
  - ElevenLabs
  - LlamaIndex
  - MongoDB
  - Pinecone
  - VoyageAI
  - Wikipedia
  - WolframAlpha

## /tool_evaluation/
  - evaluation.xml
  - tool_evaluation.ipynb

## /tool_use/
  - __init__.py
  - automatic-context-compaction.ipynb
  - calculator_tool.ipynb
  - context_engineering
  - customer_service_agent.ipynb
  - extracting_structured_json.ipynb
  - memory_cookbook.ipynb
  - memory_demo
  - memory_tool.py
  - parallel_tools.ipynb
  - programmatic_tool_calling_ptc.ipynb
  - requirements.txt
  - tests
  - threat_intel_enrichment_agent.ipynb

