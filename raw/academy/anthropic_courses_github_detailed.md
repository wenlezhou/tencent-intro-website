# Anthropic Courses (GitHub Repository) - Detailed Content

Repository: https://github.com/anthropics/courses
Collected: 2025-06-26
Source: GitHub README + raw file contents

## Overview

Anthropic's official educational courses repository. Contains **5 courses** (suggested completion order):

1. Anthropic API fundamentals
2. Prompt engineering interactive tutorial
3. Real world prompting
4. Prompt evaluations
5. Tool use

---

## Course 1: Anthropic API Fundamentals

**Path**: `anthropic_api_fundamentals/README.md`
**Description**: A series of notebook tutorials that cover the essentials of working with Claude models and the Anthropic SDK.

### Lessons (6 notebooks):
1. `01_getting_started.ipynb` - Getting an API key and making simple requests
2. `02_messages_format.ipynb` - Working with the messages format
3. `03_models.ipynb` - Comparing capabilities and performance of the Claude model family
4. `04_parameters.ipynb` - Understanding model parameters
5. `05_Streaming.ipynb` - Working with streaming responses
6. `06_vision.ipynb` - Vision prompting

---

## Course 2: Prompt Engineering Interactive Tutorial

**Path**: `prompt_engineering_interactive_tutorial/README.md`
**Description**: A comprehensive step-by-step guide to key prompting techniques.
**Also available**: [AWS Workshop version](https://catalog.us-east-1.prod.workshops.aws/workshops/0644c9e9-5b82-45f2-8835-3b5aa30b1848/en-US)
**Note**: This is the same content as `anthropics/prompt-eng-interactive-tutorial` (separate repo)

### Structure (per previous collection):
- 9 chapters + appendix
- Beginner (Ch1-3), Intermediate (Ch4-7), Advanced (Ch8-9)
- Uses Claude 3 Haiku

---

## Course 3: Real World Prompting

**Path**: `real_world_prompting/README.md`
**Description**: Learn how to incorporate prompting techniques into complex, real world prompts. Designed for experienced developers who have completed the Prompt Engineering Interactive Tutorial.
**Also available**: [Google Vertex version](https://github.com/anthropics/courses/tree/vertex/real_world_prompting)

### Lessons (5 notebooks):
1. `01_prompting_recap.ipynb` - Prompting recap
2. `02_medical_prompt.ipynb` - Medical prompt walkthrough
3. `03_prompt_engineering.ipynb` - Prompt engineering process
4. `04_call_summarizer.ipynb` - Call summarizing prompt walkthrough
5. `05_customer_support_ai.ipynb` - Customer support bot prompt walkthrough

---

## Course 4: Prompt Evaluations

**Path**: `prompt_evaluations/README.md`
**Description**: Learn everything you need to know to implement evaluations successfully in your workflows with Anthropic API. Across 9 lessons.

### Lessons (9 notebooks):
1. `01_intro_to_evals/01_intro_to_evals.ipynb` - Evaluations 101
2. `02_workbench_evals/02_workbench_evals.ipynb` - Writing human-graded evals with Anthropic's Workbench
3. `03_code_graded_evals/03_code_graded.ipynb` - Writing simple code-graded evals
4. `04_code_graded_classification_evals/04_code_graded_classification_evals.ipynb` - Writing a classification eval
5. `05_prompt_foo_code_graded_animals/lesson.ipynb` - Promptfoo for evals: an introduction
6. `06_prompt_foo_code_graded_classification/lesson.ipynb` - Writing classification evals with promptfoo
7. `07_prompt_foo_custom_graders/lesson.ipynb` - Custom graders with promptfoo
8. `08_prompt_foo_model_graded/lesson.ipynb` - Model-graded evals with promptfoo
9. `09_custom_model_graded_prompt_foo/lesson.ipynb` - Custom model-graded evals with promptfoo

---

## Course 5: Tool Use

**Path**: `tool_use/README.md`
**Description**: Learn everything you need to know to implement tool use successfully in your workflows with Claude. Across 6 lessons.

### Lessons (6 notebooks):
1. `01_tool_use_overview.ipynb` - Tool use overview
2. `02_your_first_simple_tool.ipynb` - Your first simple tool
3. `03_structured_outputs.ipynb` - Forcing JSON with tool use
4. `04_complete_workflow.ipynb` - The complete tool use workflow
5. `05_tool_choice.ipynb` - Tool choice
6. `06_chatbot_with_multiple_tools.ipynb` - Building a chatbot with multiple tools

---

## Repository Metadata

- **Total courses**: 5
- **Last updated**: Nov 14, 2025 (commit f4dbb13)
- **License**: Included (LICENSE file)
- **Note**: Courses favor Claude 3 Haiku (lowest-cost model) to keep API costs down for students
- **Related**: `prompt-eng-interactive-tutorial` is also available as separate repo
