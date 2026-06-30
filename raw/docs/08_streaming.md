# Streaming messages - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/build-with-claude/streaming

---

Stream Messages API responses incrementally with server-sent events, including text, tool use, and extended thinking deltas.

当创建Message时，你可以设置 `"stream": true` 来使用[服务器发送事件（SSE）](https://developer.mozilla.org/en-US/Web/API/Server-sent%5Fevents/Using%5Fserver-sent%5Fevents)增量流式传输响应。

## Streaming with SDKs

[Python](https://github.com/anthropics/anthropic-sdk-python)、[TypeScript](https://github.com/anthropics/anthropic-sdk-typescript) SDK提供多种流式传输方式。[PHP](https://github.com/anthropics/anthropic-sdk-php) SDK通过`createStream()`提供流式传输支持。Python SDK同时支持同步和异步流，具体细节请参考各SDK的文档。

支持的语言：CLI、Python、TypeScript、C#、Go、Java、PHP、Ruby

### Python SDK流式传输示例

```python
client = anthropic.Anthropic()

with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
    model="claude-opus-4-8",
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Get the final message without handling events

如果你不需要逐字处理到达的文本，SDK提供了在底层使用流式传输的同时返回完整的`Message`对象的功能，返回结果和`.create()`方法完全一致。这个功能在请求的`max_tokens`值较大时尤其有用，因为SDK需要流式传输来避免HTTP超时。

### 获取完整消息的Python示例

```python
client = anthropic.Anthropic()

with client.messages.stream(
    max_tokens=128000,
    messages=[{"role": "user", "content": "Write a detailed analysis..."}],
    model="claude-opus-4-8",
) as stream:
    message = stream.get_final_message()

print(message.content[0].text)
```

## Event types

每个服务器发送事件都包含一个命名事件类型和关联的JSON数据。每个事件都使用一个SSE事件名（例如`event: message_stop`），并在其数据中包含匹配的事件`type`。

每个流使用以下事件流程：
1. `message_start`：包含一个`content`为空的`Message`对象。
2. 一系列内容块，每个内容块都有`content_block_start`、一个或多个`content_block_delta`事件，以及一个`content_block_stop`事件。
3. 一个或多个`message_delta`事件，表示对最终`Message`对象的顶层更改。
4. 最终的`message_stop`事件。

### Ping events

事件流可能还包含任意数量的`ping`事件。

### Error events

API可能会在事件流中偶尔发送[错误](https://platform.claude.com/docs/en/api/errors)。

### Other events

根据[版本控制策略](https://platform.claude.com/docs/en/api/versioning)，可能会添加新的事件类型，你的代码应该能够优雅地处理未知的事件类型。

## Content block delta types

### Text delta

`text`内容块delta示例如下：
```
event: content_block_delta
data: {"type": "content_block_delta","index": 0,"delta": {"type": "text_delta", "text": "ello frien"}}
```

### Input JSON delta

`tool_use`内容块的delta对应块的`input`字段的更新。

### Thinking delta

当启用[扩展思考](https://platform.claude.com/docs/en/build-with-claude/extended-thinking#streaming-thinking)并开启流式传输时，你会通过`thinking_delta`事件接收思考内容。

## Full HTTP stream response

使用流式模式时建议使用[客户端SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)。但如果你要构建直接的API集成，你需要自己处理这些事件。

### Basic streaming request

```python
client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-opus-4-8",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=256,
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Error recovery

### Claude 4.5 and earlier

对于Claude 4.5及更早的模型，你可以恢复由于网络问题、超时或其他错误而中断的流式请求。

### Claude 4.6 and later

对于Claude 4.6及更晚的模型，相同的捕获和恢复策略仍然适用，但步骤2有所变化：不再将部分响应放在助手消息中，而是添加一个用户消息，指示模型从中断的地方继续。

## Next steps

- [停止原因和回退](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
- [细粒度工具流式传输](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming)
- [扩展思考](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
- [客户端SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)
- [批处理](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
