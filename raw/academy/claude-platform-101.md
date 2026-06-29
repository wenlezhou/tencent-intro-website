# Claude Platform 101: API开发实战

**课程概述**

Claude Platform 101 专为开发者设计，教你如何使用 Claude API 构建实际应用。

## 第一章：Claude API 简介

**Claude API** 让你可以：
- 集成Claude到你的应用
- 构建自定义AI工作流
- 批量处理任务
- 实现复杂Agent系统

### API访问方式
1. **Anthropic API**：直接调用 `https://api.anthropic.com`
2. **AWS Bedrock**：通过Amazon Bedrock访问
3. **Google Vertex AI**：通过Google Cloud访问

## 第二章：快速开始

### 安装SDK

**Python：**
```bash
pip install anthropic
```

**TypeScript/Node.js：**
```bash
npm install @anthropic-ai/sdk
```

### 第一个API调用

**Python示例：**
```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "解释什么是递归"}
    ]
)

print(message.content[0].text)
```

## 第三章：Messages API详解

**Messages API** 是Claude的主要API接口。

### 核心概念

#### 1. Messages（消息）
对话由一系列Message组成：
```python
messages = [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮助你？"},
    {"role": "user", "content": "解释一下API"}
]
```

#### 2. Roles（角色）
- `user`：用户输入
- `assistant`：Claude回复

#### 3. Content（内容）
可以是：
- 字符串：`"解释递归"`
- 数组：包含文本和图片

### 完整参数列表

```python
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,                    # 最大输出tokens
    temperature=0.7,                    # 创造性（0-1）
    top_p=0.9,                         # 核采样
    top_k=40,                          # Top-K采样
    stop_sequences=["\n\nHuman:"],      # 停止序列
    stream=True,                        # 流式输出
    system="你是一个有用的AI助手",      # 系统提示
    messages=messages,                  # 对话历史
    tools=tools,                        # 工具定义
    tool_choice="auto"                  # 工具选择
)
```

## 第四章：模型选择

### Claude 3.5 系列

| 模型 | 速度 | 成本 | 能力 | 使用场景 |
|------|------|------|------|----------|
| Claude 3.5 Sonnet | 快 | 中 | 强 | 大多数任务 |
| Claude 3.5 Haiku | 最快 | 最低 | 中 | 简单任务 |

### Claude 3 系列

| 模型 | 速度 | 成本 | 能力 | 使用场景 |
|------|------|------|------|----------|
| Claude 3 Opus | 慢 | 高 | 最强 | 复杂任务 |
| Claude 3 Sonnet | 中 | 中 | 强 | 平衡 |
| Claude 3 Haiku | 快 | 低 | 中 | 快速响应 |

### 如何选择？

**原则**：
1. 先试 Claude 3.5 Sonnet（最强最快）
2. 需要更快/更便宜 → Haiku
3. 需要最强能力 → Opus

## 第五章：多轮对话

**保持对话上下文**：

```python
# 第一轮
response1 = client.messages.create(
    model="claude-3-5-sonnet",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "我叫张三"}
    ]
)

# 第二轮（包含历史）
response2 = client.messages.create(
    model="claude-3-5-sonnet",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "我叫张三"},
        {"role": "assistant", "content": response1.content[0].text},
        {"role": "user", "content": "我刚才说我叫什么？"}
    ]
)
```

**注意**：
- 必须交替 user/assistant
- 不要包含系统消息在messages中（用system参数）

## 第六章：流式输出

**Streaming** 让Claude逐token输出，提升用户体验。

### Python示例

```python
with client.messages.stream(
    model="claude-3-5-sonnet",
    max_tokens=1024,
    messages=[{"role": "user", "content": "写一篇1000字文章"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### TypeScript示例

```typescript
const stream = await client.messages.stream({
  model: "claude-3-5-sonnet",
  max_tokens: 1024,
  messages: [{ role: "user", content: "解释递归" }]
});

for await (const text of stream.textStream) {
  process.stdout.write(text);
}
```

## 第七章：Tool Use（工具使用）

**Tool Use** 让Claude可以调用外部工具/API。

### 定义工具

```python
tools = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["city"]
        }
    }
]
```

### 使用工具

```python
response = client.messages.create(
    model="claude-3-5-sonnet",
    max_tokens=1024,
    messages=[{"role": "user", "content": "北京天气怎么样？"}],
    tools=tools
)

# Claude可能返回tool_use
if response.stop_reason == "tool_use":
    tool_name = response.content[0].name
    tool_input = response.content[0].input
    
    # 执行工具
    if tool_name == "get_weather":
        weather = get_weather(tool_input["city"])
        
        # 将结果返回给Claude
        response2 = client.messages.create(
            model="claude-3-5-sonnet",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "北京天气怎么样？"},
                {"role": "assistant", "content": response.content},
                {"role": "user", "content": [
                    {"type": "tool_result", "tool_use_id": response.content[0].id, "content": weather}
                ]}
            ]
        )
```

## 第八章：RAG（检索增强生成）

**RAG** 让Claude可以访问你的私有数据。

### 实现步骤

1. **数据准备**：将文档分块
2. **向量化**：使用embedding API
3. **存储**：保存到向量数据库
4. **检索**：根据问题检索相关块
5. **生成**：将检索结果提供给Claude

### Embeddings API

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")

# 创建embedding
response = client.embeddings.create(
    model="claude-3-sonnet-20240229",
    input=["文档内容1", "文档内容2"]
)

embeddings = response.embedding
```

## 第九章：Prompt Caching（提示词缓存）

**Prompt Caching** 可以缓存长提示词，降低成本。

### 使用场景
- 系统提示词很长（>1000 tokens）
- 重复使用的文档/代码
- 多轮对话的上下文

### 示例

```python
response = client.messages.create(
    model="claude-3-5-sonnet",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "你是一个AI助手..." * 100,  # 长系统提示
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=messages
)

# 后续请求会自动使用缓存
```

## 第十章：错误处理

### 常见错误

1. **rate_limit_error**：超出速率限制
   - 解决：实现指数退避重试

2. **invalid_request_error**：请求参数错误
   - 解决：检查参数格式

3. **authentication_error**：API key无效
   - 解决：检查API key

### 重试逻辑

```python
import time
from anthropic import RateLimitError

def call_claude_with_retry(prompt, max_retries=3):
    for i in range(max_retries):
        try:
            response = client.messages.create(
                model="claude-3-5-sonnet",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return response
        except RateLimitError:
            wait_time = 2 ** i  # 指数退避
            time.sleep(wait_time)
    
    raise Exception("Max retries exceeded")
```

## 第十一章：成本管理

### 成本优化技巧

1. **使用缓存**：Prompt Caching
2. **选择合适模型**：Haiku for simple tasks
3. **限制max_tokens**：避免冗长输出
4. **批量处理**：Batch API更便宜

### Token计数

```python
# 估算成本
input_tokens = len(prompt) / 4  # 粗略估算
output_tokens = 1024  # max_tokens

cost = (input_tokens * 0.003 + output_tokens * 0.015) / 1000
```

## 第十二章：生产最佳实践

### 1. 安全
- 永远不要暴露API key
- 使用环境变量
- 实现速率限制

### 2. 监控
- 记录所有API调用
- 监控成本和延迟
- 设置告警

### 3. 容错
- 实现重试逻辑
- 优雅降级
- 超时控制

### 4. 测试
- 单元测试
- 集成测试
- 负载测试

## 第十三章：实战项目

### 项目1：智能客服
- 使用Tool Use调用订单系统
- 实现多轮对话
- 部署到生产

### 项目2：文档问答
- 实现RAG
- 使用向量数据库
- 评估准确性

### 项目3：代码审查工具
- 集成GitHub
- 自动审查PR
- 生成review意见

## 第十四章：进阶主题

### 1. Fine-tuning（微调）
- 准备训练数据
- 使用Anthropic微调API
- 评估和部署

### 2. Constitutional AI
- 理解Constitutional AI原理
- 实现自定义规则

### 3. Multimodal（多模态）
- 处理图片输入
- 生成图片描述

## 总结

完成本课程后，你应该能够：
- ✅ 使用Claude API构建应用
- ✅ 实现多轮对话和流式输出
- ✅ 使用Tool Use扩展功能
- ✅ 实现RAG系统
- ✅ 优化成本和性能
- ✅ 部署到生产环境

**下一步学习**：
- Claude Code in Action（实战项目）
- Building with Claude API（高级主题）
- RAG高级技术
