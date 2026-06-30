# Web search tool - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool

---

网络搜索工具让Claude能够直接访问实时网络内容，使其可以回答超出自身知识截止日期的最新信息。

## How web search works

1. Claude根据提示词内容判断是否需要进行搜索
2. API执行搜索并向Claude返回结果
3. 轮次结束时，Claude会返回包含引用来源的最终响应

### Dynamic filtering

使用 `web_search_20260209` 及更高版本时，Claude可以编写并执行代码对查询结果进行后处理，仅保留相关内容。

## How to use web search

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "What's the weather in NYC?"}],
    tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}],
)
```

## Tool definition

```json
{
  "type": "web_search_20250305",
  "name": "web_search",
  "max_uses": 5,
  "allowed_domains": ["example.com"],
  "blocked_domains": ["untrustedsource.com"],
  "user_location": {
    "type": "approximate",
    "city": "San Francisco",
    "region": "California",
    "country": "US",
    "timezone": "America/Los_Angeles"
  }
}
```

## Response

响应包含搜索查询、搜索结果和带引用的回答。

## Usage and pricing

网络搜索在Claude API上的定价为**每1000次搜索10美元**。
