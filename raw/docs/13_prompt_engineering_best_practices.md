# Prompt engineering best practices - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices

---

Claude 最新模型提示工程综合指南

## 通用原则

### 清晰直接
Claude 对清晰、明确的指令响应效果更好。黄金法则：把你的提示给对任务只有少量背景信息的同事看，让他们按照提示执行。如果他们感到困惑，Claude 也会困惑。

### 有效使用示例
示例是引导 Claude 输出格式、语气、结构最可靠的方法之一。最佳实践：
- 相关性：尽可能贴近你的实际使用场景
- 多样性：覆盖边缘情况
- 结构化：用 `<example>` 标签包裹单个示例
- 包含 3-5 个示例

### 用 XML 标签结构化提示
XML 标签可以帮助 Claude 无歧义地解析复杂提示。

### 给 Claude 设定角色
在系统提示中设定角色可以聚焦 Claude 的行为和语气。

## 输出与格式化

### 控制响应格式
1. 告诉 Claude 要做什么，而不是不要做什么
2. 使用 XML 格式指示符
3. 提示风格匹配期望的输出风格
4. 为特定格式偏好使用详细提示

### LaTeX 输出
Claude 最新模型默认会在数学表达式中使用 LaTeX。如不希望，可添加指令使用纯文本。

## 工具使用

### 工具使用引导
Claude 最新模型需要明确的指令来使用特定工具。要让 Claude 采取行动，需要更明确的指令。

### 优化并行工具调用
Claude 最新模型会并行运行独立的工具调用。

## 思维与推理

### 利用思考和交错思考能力
Claude 最新模型提供思考能力，尤其适用于工具使用后的反思、或复杂多步推理任务。

使用自适应思考（`thinking: {type: "adaptive"}`），Claude 会动态决定何时、进行多少思考。

## 代理系统

### 长周期推理与状态跟踪
Claude 最新模型处理长周期推理任务时，状态跟踪能力很强。

### 平衡自主性与安全性
如果没有指导，Claude Opus 4.6 可能会采取难以撤销或影响共享系统的行动。

### 子代理编排
Claude 最新模型原生支持子代理编排。

## 后续步骤

- [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)
- [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
