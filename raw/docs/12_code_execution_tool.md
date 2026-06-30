# Code execution tool - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool

---

代码执行工具支持在沙盒容器中运行 Python 和 bash 代码，用于分析数据、生成文件、迭代优化解决方案。

## 模型兼容性

以下模型支持代码执行工具：
- Claude Fable 5, Claude Mythos 5
- Claude Opus 4.8, 4.7, 4.6, 4.5
- Claude Sonnet 4.6, 4.5
- Claude Haiku 4.5

## 快速开始

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=4096,
    messages=[
        {
            "role": "user",
            "content": "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
        }
    ],
    tools=[{"type": "code_execution_20250825", "name": "code_execution"}],
)
```

## 代码执行工作原理

1. Claude 会评估执行代码是否有助于回答你的问题
2. 工具会自动为 Claude 提供 Bash 命令和文件操作能力
3. 所有操作都在安全沙盒环境中运行

## 容器说明

### 运行时环境
- Python 版本：3.11.12
- 操作系统：Linux 容器
- 架构：x86_64 (AMD64)

### 资源限制
- 内存：5GiB RAM
- 磁盘空间：5GiB 工作区存储
- CPU：1 核

### 预装库
- 数据科学：pandas, numpy, scipy, scikit-learn
- 可视化：matplotlib, seaborn
- 文件处理：pyarrow, openpyxl, pillow, python-docx, pypdf

## 使用与定价

**与网页搜索或网页抓取工具搭配使用时完全免费**。

未搭配上述工具使用时，代码执行按执行时间计费：
- 执行时间最低按 5 分钟计算
- 每个组织每月有 1550 小时免费额度
- 超出部分按每容器每小时 0.05 美元计费

## 容器复用

你可以通过提供上一次响应中的容器 ID，在多个 API 请求中复用同一个容器。

```python
# First request
response1 = client.messages.create(...)

# Extract container ID
container_id = response1.container.id

# Second request: Reuse the container
response2 = client.messages.create(
    container=container_id,
    ...
)
```
