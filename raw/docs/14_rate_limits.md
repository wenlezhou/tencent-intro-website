# Rate limits - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/api/rate-limits

---

API 使用限制分为两种：
1. **Spend limits**（支出限制）：设置组织每月最高 API 使用费用
2. **Rate limits**（速率限制）：设置组织在指定时间内最大 API 请求数

## Spend limits

| Usage tier | Monthly spend cap |
|-----------|-------------------|
| Start     | $500              |
| Build     | $1,000            |
| Scale     | $200,000          |

## Rate limits

Messages API 的速率限制按每分钟请求数 (RPM)、每分钟输入 token 数 (ITPM)、每分钟输出 token 数 (OTPM) 衡量。

### Cache-aware ITPM

**对于大多数 Claude 模型，只有未缓存的输入 token 计入 ITPM 速率限制。** 这意味着使用提示缓存可以有效提高实际吞吐量。

以下计入 ITPM：
- `input_tokens`（最后一个缓存断点后的 token）✓
- `cache_creation_input_tokens`（写入缓存的 token）✓
- `cache_read_input_tokens`（从缓存读取的 token）✗ **不计入 ITPM**

### Start tier 速率限制

| Model | RPM | ITPM | OTPM |
|-------|-----|------|------|
| Claude Opus 4.x | 1,000 | 2,000,000 | 400,000 |
| Claude Sonnet 4.x | 1,000 | 2,000,000 | 400,000 |
| Claude Haiku 4.5 | 1,000 | 2,000,000 | 400,000 |

## Message Batches API 速率限制

| Tier | RPM | 处理队列中最大批量请求数 | 每个批量最大请求数 |
|------|-----|------------------------|-------------------|
| Start | 1,000 | 200,000 | 100,000 |

## 响应头

API 响应包含显示速率限制状态的头信息：
- `retry-after`：重试前等待的秒数
- `anthropic-ratelimit-requests-remaining`：被限制前剩余的请求数
- `anthropic-ratelimit-tokens-remaining`：被限制前剩余的 token 数

## 请求更高限制

可以在 [Limits](https://platform.claude.com/settings/limits) 页面请求更高的速率限制或每月支出上限。
