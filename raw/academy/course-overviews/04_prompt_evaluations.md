# Prompt Evaluations#

**课程来源**: Anthropic 官方 GitHub 仓库
**仓库路径**: `prompt_evaluations/README.md`
**课程类型**: 评估开发教程（9 个 Notebook）

---

## 课程描述

Learn everything you need to know to implement evaluations successfully in your workflows with Anthropic API. This course covers the complete evaluation pipeline across 9 lessons.

## 学习目标

After completing this course, you will be able to:
- Design and implement effective evaluations for Claude
- Use Anthropic's Workbench for human-graded evals
- Write code-graded evaluations for automated testing
- Use Promptfoo for advanced evaluation workflows
- Implement model-graded evaluations

## 课程章节（9 个 Notebook）

### Lesson 1: Intro to Evals (`01_intro_to_evals.ipynb`)
- Evaluations 101
- Why evaluations matter
- Basic evaluation concepts

### Lesson 2: Workbench Evals (`02_workbench_evals.ipynb`)
- Writing human-graded evals with Anthropic's Workbench
- Using the Workbench UI
- Creating evaluation criteria

### Lesson 3: Code-Graded Evals (`03_code_graded_evals.ipynb`)
- Writing simple code-graded evals
- Automated evaluation pipelines
- Scoring and metrics

### Lesson 4: Code-Graded Classification Evals (`04_code_graded_classification_evals.ipynb`)
- Writing a classification eval
- Handling classification tasks
- Accuracy and F1 score calculations

### Lesson 5: Promptfoo for Evals (`05_prompt_foo_code_graded_animals/lesson.ipynb`)
- Promptfoo for evals: an introduction
- Setting up Promptfoo
- Running evaluations with Promptfoo

### Lesson 6: Promptfoo Classification Evals (`06_prompt_foo_code_graded_classification/lesson.ipynb`)
- Writing classification evals with promptfoo
- Advanced Promptfoo features
- Comparing model performance

### Lesson 7: Promptfoo Custom Graders (`07_prompt_foo_custom_graders/lesson.ipynb`)
- Custom graders with promptfoo
- Writing custom scoring functions
- Handling complex evaluation criteria

### Lesson 8: Promptfoo Model-Graded Evals (`08_prompt_foo_model_graded/lesson.ipynb`)
- Model-graded evals with promptfoo
- Using Claude to grade Claude
- Best practices for model-graded evals

### Lesson 9: Custom Model-Graded Evals (`09_custom_model_graded_prompt_foo/lesson.ipynb`)
- Custom model-graded evals with promptfoo
- Advanced techniques
- Production evaluation pipelines

## 技术要求

- **Python 环境**: Requires Python 3.7+
- **Anthropic SDK**: Install via `pip install anthropic`
- **Jupyter Notebook**: Required to run the tutorials
- **API Key**: You need an Anthropic API key
- **Promptfoo**: Install for advanced evaluation workflows

## 相关资源

- **GitHub 仓库**: https://github.com/anthropics/courses
- **Anthropic Workbench**: https://platform.claude.com/workbench
- **Promptfoo 文档**: https://www.promptfoo.com/docs/intro
- **Evaluation 指南**: https://platform.claude.com/docs/en/test-and-evaluate

## 备注

- This course is designed for developers who want to implement rigorous evaluation pipelines
- Uses Claude 3 Haiku (lowest-cost model) to keep API costs down for students
- Includes both human-graded and automated evaluation techniques
- Covers the complete evaluation lifecycle from design to production

---

**创建时间**: 2026-06-30 01:45:00
**信息来源**: Anthropic GitHub 仓库 (anthropics/courses)
**创建工具**: 基于 GitHub 信息创建
