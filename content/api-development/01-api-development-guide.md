---
title: "API开发实战指南"
slug: "api-development-guide"
category: "api-development"
order: 1
description: "从零开始掌握AI API开发，涵盖API基础、消息格式、流式响应、多模态提示和工具调用"
difficulty: "入门-进阶"
readingTime: 40
tags: ["API", "开发", "Python", "SDK", "多模态"]
---

# API开发实战指南

## 准备工作

### 获取API密钥

1. 注册AI平台账号
2. 在控制台创建API密钥
3. 安全存储密钥（使用环境变量，不要硬编码）

```bash
# 设置环境变量
export AI_API_KEY="your-api-key-here"
```

### 安装SDK

```bash
pip install openai  # 或其他大模型SDK
```

---

## 第一部分：API基础

### 消息格式

AI API使用消息列表格式进行交互：

```python
from openai import OpenAI  # 示例使用通用SDK

client = OpenAI()  # 或使用任意大模型API客户端

message = client.messages.create(
    model="your-model-name",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "你好，请介绍一下自己"}
    ],
)

print(message.content)
```

### 消息角色

| 角色 | 说明 |
|------|------|
| `system` | 系统提示，设定AI的行为和角色 |
| `user` | 用户输入 |
| `assistant` | AI的回复（用于多轮对话） |

### 多轮对话

```python
messages = [
    {"role": "user", "content": "什么是机器学习？"},
    {"role": "assistant", "content": "机器学习是人工智能的一个分支..."},
    {"role": "user", "content": "它和深度学习有什么区别？"},
]
```

### 模型参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `model` | 使用的模型 | 根据需求选择 |
| `max_tokens` | 最大输出长度 | 根据任务设置 |
| `temperature` | 随机性（0-1） | 创意任务0.7，精确任务0 |
| `top_p` | 核采样参数 | 通常与temperature二选一 |
| `thinking` | 思维模式 | adaptive用于复杂推理 |

---

## 第二部分：流式响应

### 基本流式调用

```python
with client.messages.stream(
    model="your-model-name",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "写一首关于编程的诗"}
    ],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### 流式响应的优势

- **实时输出**：用户无需等待完整响应
- **更快感知**：首个token快速返回
- **节省时间**：可提前中断不满意的输出
- **适合长文**：大段文本生成体验更好

---

## 第三部分：多模态提示

### 图片理解

```python
import base64

# 读取图片
with open("image.jpg", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model="your-model-name",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": "请描述这张图片的内容"
                }
            ],
        }
    ],
)
```

### 支持的图片格式

| 格式 | MIME类型 |
|------|----------|
| JPEG | image/jpeg |
| PNG | image/png |
| GIF | image/gif |
| WebP | image/webp |

---

## 第四部分：工具调用

### 定义工具

```python
tools = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "温度单位"
                }
            },
            "required": ["city"]
        }
    }
]
```

### 处理工具调用

```python
message = client.messages.create(
    model="your-model-name",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
)

# 检查AI是否请求调用工具
if message.stop_reason == "tool_use":
    for block in message.content:
        if block.type == "tool_use":
            # 执行工具并返回结果
            result = get_weather(**block.input)

            # 继续对话
            response = client.messages.create(
                model="your-model-name",
                max_tokens=1024,
                tools=tools,
                messages=[
                    {"role": "user", "content": "北京今天天气怎么样？"},
                    {"role": "assistant", "content": message.content},
                    {
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result)
                        }]
                    }
                ],
            )
```

---

## 第五部分：思维模式

### 自适应思维

```python
message = client.messages.create(
    model="your-model-name",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    messages=[
        {"role": "user", "content": "请分析这个复杂算法的时间复杂度"}
    ],
)
```

### Effort级别

| 级别 | 适用场景 | 特点 |
|------|----------|------|
| `low` | 简单直接的问题 | 快速响应，少量思考 |
| `medium` | 常规任务 | 平衡速度与质量 |
| `high` | 复杂推理任务 | 深度思考，更准确 |

---

## 第六部分：结构化输出

### JSON输出

```python
message = client.messages.create(
    model="your-model-name",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": """请分析以下文本的情感，以JSON格式输出：
            格式：{"sentiment": "正面/负面/中性", "confidence": 0.0-1.0, "keywords": [...]}
            
            文本：这个产品质量很好，但物流太慢了"""
        }
    ],
)
```

---

## 最佳实践速查

| 场景 | 推荐配置 |
|------|----------|
| 简单问答 | temperature=0, max_tokens=512 |
| 创意写作 | temperature=0.7, max_tokens=2048 |
| 代码生成 | temperature=0, thinking=adaptive |
| 数据提取 | temperature=0, 结构化输出 |
| 复杂推理 | thinking=adaptive, effort=high |
| 工具调用 | 明确工具定义，处理tool_use |
