# Extended thinking - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking

---

为Claude提供复杂任务的增强推理能力，并可控制思维内容的返回方式。

## Supported models

扩展思维在所有当前的Claude模型上可用。启用方式因模型而异：

| 模型 | 手动扩展思维（`budget_tokens`） | 推荐 |
|------|--------------------------------|------|
| Claude Fable 5 | 支持 | - |
| Claude Mythos 5 | 不支持（返回400错误） | 自适应思维 |
| Claude Opus 4.8 | 不支持（返回400错误） | 带 effort 的自适应思维 |
| Claude Sonnet 4.6 | 已弃用 | 带 effort 的自适应思维 |
| Claude Opus 4.5 | 支持 | 不适用 |
| Claude Haiku 4.5 | 支持 | 不适用 |

## How extended thinking works

当扩展思维开启时，Claude会创建 `thinking` 内容块，用于输出其内部推理过程。

API响应会包含 `thinking` 内容块，后跟 `text` 内容块。

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me analyze this step by step...",
      "signature": "WaUjzkypQ2mUEVM36O2TxuC06KN8xyfbJwyem2dw3URve/op91XWHOEBLLqIOMfFG/UvLEczmEsUjavL...."
    },
    {
      "type": "text",
      "text": "Based on my analysis..."
    }
  ]
}
```

## How to use extended thinking

### Python示例

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {
            "role": "user",
            "content": "Are there an infinite number of prime numbers such that n mod 4 == 3?",
        }
    ],
)
```

`budget_tokens` 参数设置Claude可用于内部推理过程的最大token数。

## Controlling thinking display

思维配置上的 `display` 字段控制API响应中思维内容的返回方式：
- `"summarized"`：思维块包含摘要后的思维文本
- `"omitted"`：思维块返回时 `thinking` 字段为空

设置 `display: "omitted"` 适用于你的应用不向用户展示思维内容的场景，主要好处是流式传输时首token时间更快。

## Summarized thinking

启用扩展思维后，Claude 4模型的Messages API会返回Claude完整思维过程的摘要。

重要注意事项：
- 你需要为原始请求生成的完整思维token付费，而不是摘要token
- 计费的输出token数量不会匹配你在响应中看到的token数量

## Streaming thinking

你可以使用 SSE 流式传输扩展思维响应。当为扩展思维启用流式传输时，你会通过 `thinking_delta` 事件接收思维内容。

## Extended thinking with tool use

扩展思维可以与工具使用结合使用，允许Claude推理工具选择和结果处理。

限制：
1. 工具选择限制：仅支持 `tool_choice: {"type": "auto"}` 或 `tool_choice: {"type": "none"}`
2. 保留思维块：必须将 `thinking` 块传回API

## Interleaved thinking

Claude 4模型中带工具使用的扩展思维支持交错思维，使Claude能够在工具调用之间思考。

## Pricing

思维过程会产生以下费用：
- 思维期间使用的token（输出token）
- 保留在上下文中的之前助手轮次的思维块（输入token）
- 标准文本输出token

## Best practices

### Working with thinking budgets
- 最小预算是1,024个token
- 对于复杂任务，从更大的思维预算（16k+ token）开始
- 对于超过32k的思维预算，使用批处理以避免网络问题

### Performance considerations
- 准备好更长的响应时间
- 当 `max_tokens` 大于21,333时，SDK需要流式传输
- 如果不展示思维内容，设置 `display: "omitted"` 以减少首token时间

## Next steps

- [自适应思维](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [扩展思维提示技巧](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
