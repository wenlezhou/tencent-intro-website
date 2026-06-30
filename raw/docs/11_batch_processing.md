# Batch processing - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/build-with-claude/batch-processing

---

批量处理是一种高效处理大量请求的强大方法，可异步处理大量消息请求，成本降低50%。

## 消息批量API的工作原理

1. 系统会使用提供的消息请求创建一个新消息批量
2. 批量请求将异步处理，每个请求独立处理
3. 你可以轮询批量的状态，在所有请求处理完成后获取结果

### 批量限制

- 一个消息批量最多包含100,000个消息请求，或大小不超过256 MB
- 大多数批量可在1小时内完成
- 批量结果在创建后29天内可用

## 定价

批量API提供显著的成本节省。所有使用费用按标准API价格的50%收取。

| 模型 | 批量输入价格 | 批量输出价格 |
|------|-------------|-------------|
| Claude Opus 4.8 | $2.50 / MTok | $12.50 / MTok |
| Claude Sonnet 4.6 | $1.50 / MTok | $7.50 / MTok |
| Claude Haiku 4.5 | $0.50 / MTok | $2.50 / MTok |

## 如何使用消息批量API

### 准备并创建你的批量

```python
client = anthropic.Anthropic()

message_batch = client.messages.batches.create(
    requests=[
        Request(
            custom_id="my-first-request",
            params=MessageCreateParamsNonStreaming(
                model="claude-opus-4-8",
                max_tokens=1024,
                messages=[{"role": "user", "content": "Hello, world"}],
            ),
        ),
    ]
)
```

### 跟踪你的批量

```python
import time

client = anthropic.Anthropic()

while True:
    message_batch = client.messages.batches.retrieve(MESSAGE_BATCH_ID)
    if message_batch.processing_status == "ended":
        break
    print("Batch is still processing...")
    time.sleep(60)
```

### 检索批量结果

```python
for result in client.messages.batches.results("msgbatch_01HkcTjaV5uDC8jWR4ZsDV8d"):
    match result.result.type:
        case "succeeded":
            print(f"Success! {result.custom_id}")
        case "errored":
            print(f"Validation error {result.custom_id}")
```
