---
title: "模型上下文协议（MCP）实战"
slug: "mcp-guide"
category: "mcp"
order: 1
description: "从零构建MCP服务器和客户端，掌握工具、资源、提示三大核心原语，连接AI与外部服务"
difficulty: "进阶-高级"
readingTime: 35
tags: ["MCP", "模型上下文协议", "工具调用", "Python", "服务器"]
---

# 模型上下文协议（MCP）实战

## 什么是MCP？

模型上下文协议（Model Context Protocol，MCP）是一种开放标准，用于规范AI应用与外部数据源和工具之间的通信。它让AI能够安全、标准化地访问外部服务和数据。

**核心理念**：像USB-C统一了设备连接一样，MCP统一了AI与外部世界的连接方式。

---

## 第一部分：MCP三大核心原语

### 1. 工具（Tools）

工具让AI能够执行操作——搜索数据库、调用API、操作文件等。

```python
from mcp.server import Server

server = Server("my-tools-server")

@server.tool()
async def search_database(query: str) -> str:
    """搜索数据库中的记录
    
    Args:
        query: 搜索关键词
    """
    results = await db.search(query)
    return json.dumps(results)

@server.tool()
async def create_task(title: str, priority: str = "medium") -> str:
    """创建新任务
    
    Args:
        title: 任务标题
        priority: 优先级 (low/medium/high)
    """
    task = await tasks.create(title=title, priority=priority)
    return json.dumps({"id": task.id, "status": "created"})
```

**工具设计原则：**
- 名称清晰描述功能
- 描述详细说明用途和适用场景
- 参数Schema完整，包含类型和描述
- 返回结构化数据

### 2. 资源（Resources）

资源为AI提供数据——文件内容、数据库记录、API响应等。

```python
@server.resource("db://users/{user_id}")
async def get_user(user_id: str) -> str:
    """获取用户信息"""
    user = await db.get_user(user_id)
    return json.dumps(user)

@server.resource("file://docs/{path}")
async def get_document(path: str) -> str:
    """获取文档内容"""
    content = await files.read(path)
    return content
```

**资源 vs 工具：**

| 特性 | 资源 | 工具 |
|------|------|------|
| 用途 | 提供数据 | 执行操作 |
| 副作用 | 无（只读） | 可能有 |
| 缓存 | 可缓存 | 通常不缓存 |
| 示例 | 读取文件 | 写入数据库 |

### 3. 提示（Prompts）

提示是预设的提示词模板，用于标准化常用任务。

```python
@server.prompt()
async def code_review(code: str) -> str:
    """代码审查提示模板"""
    return f"""请审查以下代码，关注：
1. 代码质量和可读性
2. 潜在的bug和安全问题
3. 性能优化建议
4. 最佳实践遵循情况

代码：
```
{code}
```"""

@server.prompt()
async def summarize_document(content: str, format: str = "paragraph") -> str:
    """文档总结提示模板"""
    return f"""请总结以下文档内容：
- 输出格式：{format}
- 保留关键数据和结论
- 使用简洁清晰的语言

文档内容：
{content}"""
```

---

## 第二部分：构建MCP服务器

### 完整服务器示例

```python
import json
from mcp.server import Server

server = Server("knowledge-base")

# === 工具 ===

@server.tool()
async def search_knowledge(query: str, limit: int = 5) -> str:
    """搜索知识库
    
    Args:
        query: 搜索查询
        limit: 返回结果数量上限
    """
    results = await kb.search(query, limit=limit)
    return json.dumps(results)

@server.tool()
async def add_document(title: str, content: str, tags: list[str] = []) -> str:
    """添加文档到知识库
    
    Args:
        title: 文档标题
        content: 文档内容
        tags: 标签列表
    """
    doc_id = await kb.add(title=title, content=content, tags=tags)
    return json.dumps({"id": doc_id, "status": "added"})

# === 资源 ===

@server.resource("kb://documents/{doc_id}")
async def get_document(doc_id: str) -> str:
    """获取知识库文档"""
    doc = await kb.get(doc_id)
    return json.dumps(doc)

@server.resource("kb://stats")
async def get_stats() -> str:
    """获取知识库统计信息"""
    stats = await kb.get_stats()
    return json.dumps(stats)

# === 提示 ===

@server.prompt()
async def research_topic(topic: str) -> str:
    """研究主题提示模板"""
    return f"""请深入研究以下主题：{topic}

步骤：
1. 使用search_knowledge工具搜索已有相关文档
2. 分析和综合找到的信息
3. 识别知识缺口
4. 提出进一步研究方向

请使用kb://stats资源了解知识库的整体情况。"""

# 启动服务器
if __name__ == "__main__":
    server.run()
```

---

## 第三部分：MCP进阶

### 采样（Sampling）

让MCP服务器请求AI完成子任务：

```python
@server.tool()
async def analyze_sentiment(text: str) -> dict:
    """分析文本情感（使用AI采样）"""
    result = await server.sample(
        messages=[{
            "role": "user",
            "content": f"分析以下文本的情感倾向，返回JSON：{text}"
        }],
        max_tokens=256
    )
    return json.loads(result)
```

### 通知（Notifications）

实时推送状态更新：

```python
@server.tool()
async def long_running_task(task_id: str) -> str:
    """执行长时间运行的任务"""
    await server.notify("task_started", {"task_id": task_id})
    
    # 执行任务...
    for i in range(10):
        progress = (i + 1) * 10
        await server.notify("task_progress", {
            "task_id": task_id,
            "progress": progress
        })
    
    await server.notify("task_completed", {"task_id": task_id})
    return json.dumps({"status": "completed"})
```

### 文件系统访问

安全地访问本地/远程文件：

```python
@server.resource("fs://files/{path}")
async def read_file(path: str) -> str:
    """安全读取文件"""
    # 路径安全检查
    safe_path = validate_path(path)
    content = await filesystem.read(safe_path)
    return content
```

### 传输机制

| 传输方式 | 适用场景 | 特点 |
|----------|----------|------|
| stdio | 本地进程间通信 | 简单，适合CLI |
| HTTP+SSE | 网络通信 | 适合Web应用 |
| WebSocket | 双向实时通信 | 低延迟 |

---

## 第四部分：最佳实践

### 工具设计

1. **单一职责**：每个工具只做一件事
2. **明确描述**：名称和描述让AI知道何时使用
3. **参数验证**：Schema完整，类型明确
4. **错误处理**：返回有用的错误信息
5. **幂等设计**：相同输入产生相同结果

### 安全考虑

1. **输入验证**：所有输入都需验证和清理
2. **权限控制**：限制工具可访问的资源
3. **审计日志**：记录所有工具调用
4. **速率限制**：防止滥用
5. **敏感数据**：不在响应中暴露敏感信息

### 性能优化

1. **异步处理**：使用async/await
2. **批量操作**：支持批量请求
3. **缓存**：对频繁访问的资源使用缓存
4. **超时设置**：避免长时间阻塞
5. **资源清理**：及时释放资源

---

## MCP设计速查表

| 组件 | 用途 | 设计要点 |
|------|------|----------|
| 工具 | 执行操作 | 单一职责，明确描述 |
| 资源 | 提供数据 | 只读，可缓存 |
| 提示 | 标准化模板 | 可复用，参数化 |
| 采样 | AI子任务 | 谨慎使用，注意成本 |
| 通知 | 状态推送 | 实时，轻量 |
