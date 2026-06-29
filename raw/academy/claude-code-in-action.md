# Claude Code in Action: 实战项目

**课程概述**

Claude Code in Action 通过实际项目教你如何在真实开发场景中有效使用 Claude Code。

## 项目1：构建REST API

### 项目目标

使用 Flask 构建一个简单的任务管理 API，功能包括：
- 创建任务
- 列出任务
- 更新任务
- 删除任务

### 步骤1：项目初始化

**Prompt：**
```
你是一个Python Flask专家。

任务：初始化一个Flask REST API项目。

要求：
1. 创建项目结构
2. 安装依赖（Flask, Flask-CORS, pytest）
3. 创建app.py和基本的CRUD路由
4. 添加健康检查端点
5. 配置CORS

请生成完整的项目结构和代码。
```

**Claude Code输出：**
```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# 内存存储（演示用）
tasks = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "title": data["title"],
        "description": data.get("description", ""),
        "completed": False,
        "created_at": "2026-06-30T00:00:00Z"
    }
    tasks[task_id] = task
    return jsonify(task), 201

@app.route('/tasks', methods=['GET'])
def list_tasks():
    return jsonify(list(tasks.values())), 200

@app.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(task), 200

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.json
    task["title"] = data.get("title", task["title"])
    task["description"] = data.get("description", task["description"])
    task["completed"] = data.get("completed", task["completed"])
    
    return jsonify(task), 200

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    if task_id not in tasks:
        return jsonify({"error": "Task not found"}), 404
    
    del tasks[task_id]
    return "", 204

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 步骤2：添加数据验证

**Prompt：**
```
为上面的Flask API添加数据验证：

要求：
1. 使用marshmallow库
2. 验证title（必填，最长100字符）
3. 验证description（可选，最长500字符）
4. 返回清晰的错误消息

请修改代码，添加Schema和验证。
```

### 步骤3：添加测试

**Prompt：**
```
为任务管理API编写单元测试。

要求：
1. 使用pytest
2. 测试所有端点
3. 使用fixture
4. 覆盖率>80%

请生成测试代码。
```

### 步骤4：添加数据库

**Prompt：**
```
将内存存储改为SQLite数据库。

要求：
1. 使用SQLAlchemy ORM
2. 创建Task模型
3. 迁移现有路由
4. 添加数据库连接池

请提供完整代码。
```

### 项目总结

**学到的技能：**
- ✅ Flask REST API开发
- ✅ 数据验证
- ✅ 单元测试
- ✅ ORM使用

---

## 项目2：构建CLI工具

### 项目目标

构建一个命令行工具，使用Claude API生成代码注释。

### 步骤1：项目设置

**Prompt：**
```
创建一个Python CLI工具，使用Claude API为代码添加注释。

要求：
1. 使用click库
2. 支持命令行参数（--file, --output, --api-key）
3. 读取代码文件
4. 调用Claude API生成注释
5. 保存输出文件

请提供完整代码。
```

**Claude Code输出：**
```python
# commenter.py
import click
import os
from anthropic import Anthropic

@click.command()
@click.option('--file', '-f', required=True, help='代码文件路径')
@click.option('--output', '-o', help='输出文件路径')
@click.option('--api-key', '-k', envvar='ANTHROPIC_API_KEY', help='Anthropic API Key')
def generate_comments(file, output, api_key):
    """为代码文件生成详细注释"""
    
    # 读取文件
    with open(file, 'r') as f:
        code = f.read()
    
    # 调用Claude API
    client = Anthropic(api_key=api_key)
    
    prompt = f"""
    请为以下代码添加详细注释。

    要求：
    1. 为每个函数添加docstring
    2. 在复杂逻辑前添加行内注释
    3. 解释算法和数据结构
    4. 保持代码整洁

    代码：
    ```python
    {code}
    ```
    """
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    
    commented_code = response.content[0].text
    
    # 保存输出
    output_file = output or file.replace('.py', '_commented.py')
    with open(output_file, 'w') as f:
        f.write(commented_code)
    
    click.echo(f"✅ 注释已生成：{output_file}")

if __name__ == '__main__':
    generate_comments()
```

### 步骤2：添加更多功能

**Prompt：**
```
增强commenter工具：

功能：
1. 支持多种语言（Python, JavaScript, Java）
2. 选择注释风格（详细/简洁）
3. 保留原始代码格式
4. 显示进度条

请修改代码。
```

### 步骤3：发布到PyPI

**Prompt：**
```
准备commenter工具发布到PyPI。

要求：
1. 创建setup.py和pyproject.toml
2. 添加README和LICENSE
3. 配置GitHub Actions自动发布
4. 编写使用文档

请提供配置文件。
```

### 项目总结

**学到的技能：**
- ✅ CLI工具开发
- ✅ Claude API集成
- ✅ 包发布流程

---

## 项目3：构建Web Scraper

### 项目目标

构建一个智能Web Scraper，使用Claude解析和结构化抓取的内容。

### 步骤1：基础Scraper

**Prompt：**
```
创建一个Python Web Scraper。

功能：
1. 接受URL和CSS选择器
2. 使用requests和BeautifulSoup抓取
3. 提取指定内容
4. 保存为JSON

请提供代码。
```

### 步骤2：集成Claude

**Prompt：**
```
增强scraper，使用Claude智能解析内容。

场景：
- 用户提供文章URL
- Scraper抓取HTML
- 将HTML发送给Claude
- Claude提取：标题、作者、发布日期、正文、标签
- 返回结构化JSON

请修改代码，集成Claude API。
```

**示例输出：**
```python
# smart_scraper.py
import requests
from bs4 import BeautifulSoup
from anthropic import Anthropic
import json

def smart_scrape(url, api_key):
    # 抓取HTML
    response = requests.get(url)
    html = response.text
    
    # 调用Claude解析
    client = Anthropic(api_key=api_key)
    
    prompt = f"""
    从以下HTML中提取文章信息。

    提取字段：
    - title: 文章标题
    - author: 作者
    - date: 发布日期
    - content: 正文（纯文本）
    - tags: 标签列表

    HTML：
    ```html
    {html[:5000]}  # 限制长度
    ```
    
    请以JSON格式输出。
    """
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # 解析JSON
    result = json.loads(response.content[0].text)
    return result
```

### 步骤3：批量抓取

**Prompt：**
```
增强smart_scraper支持批量抓取。

要求：
1. 接受URL列表文件
2. 并发抓取（使用asyncio）
3. 错误重试
4. 保存进度（断点续传）
5. 生成报告

请提供代码。
```

### 项目总结

**学到的技能：**
- ✅ Web Scraping
- ✅ Claude结构化输出
- ✅ 并发编程

---

## 项目4：构建文档问答系统

### 项目目标

实现一个RAG系统，可以回答关于项目文档的问题。

### 步骤1：文档分块和向量化

**Prompt：**
```
创建一个文档问答系统。

步骤1：准备文档
- 读取markdown文件
- 分块（每块500字，重叠50字）
- 使用Anthropic embeddings API向量化
- 保存到ChromaDB

请提供代码。
```

### 步骤2：检索和生成

**Prompt：**
```
实现检索和生成功能。

流程：
1. 用户输入问题
2. 向量化问题
3. 在ChromaDB中检索相关块（top 3）
4. 将问题和相关块发给Claude
5. 生成答案（包含引用）

请提供代码。
```

**示例：**
```python
# doc_qa.py
from anthropic import Anthropic
import chromadb

def answer_question(question, api_key, db_path="./chroma"):
    # 初始化
    client = Anthropic(api_key=api_key)
    chroma_client = chromadb.PersistentClient(path=db_path)
    collection = chroma_client.get_collection("docs")
    
    # 向量化问题（使用embedding API）
    # ...（省略embedding代码）
    
    # 检索
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    # 构建上下文
    context = "\n\n".join(results["documents"][0])
    
    # 生成答案
    prompt = f"""
    基于以下文档内容回答问题。

    文档内容：
    {context}

    问题：{question}

    要求：
    1. 基于文档回答
    2. 如果文档中没有，明确说明
    3. 引用文档中的具体部分
    """
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text
```

### 步骤3：Web界面

**Prompt：**
```
为文档问答系统创建Web界面。

要求：
1. 使用Streamlit（最简单）
2. 输入框 + 答案显示
3. 显示参考文档片段
4. 支持多轮对话（上下文）

请提供完整代码。
```

### 项目总结

**学到的技能：**
- ✅ RAG系统实现
- ✅ 向量数据库使用
- ✅ Embeddings API

---

## 项目5：代码审查Bot

### 项目目标

构建一个自动代码审查Bot，可以集成到GitHub PR流程。

### 步骤1：GitHub App设置

**Prompt：**
```
创建GitHub App集成。

功能：
1. 监听PR事件
2. 获取PR diff
3. 发送diff给Claude审查
4. 发布审查评论

使用Flask + GitHub API。
请提供代码。
```

### 步骤2：审查逻辑

**Prompt：**
```
实现代码审查逻辑。

审查维度：
1. 代码质量（命名、结构）
2. 潜在bug
3. 性能问题
4. 安全风险
5. 最佳实践

Prompt模板：
```
审查以下代码变更：

文件：{filename}
变更类型：{added/modified/deleted}

Diff：
```diff
{code_diff}
```

请从以上维度审查，并给出具体建议。
```

请提供实现。
```

### 步骤3：自动修复建议

**Prompt：**
```
增强代码审查Bot，不仅指出问题，还提供修复建议。

要求：
1. 对每个问题，提供修复后的代码片段
2. 如果简单，直接提交修复commit
3. 在评论中说明修复

请修改代码。
```

### 项目总结

**学到的技能：**
- ✅ GitHub API集成
- ✅ 自动化工作流
- ✅ Claude代码分析

---

## 项目6：内容生成Pipeline

### 项目目标

构建一个自动化内容生成系统，用于技术博客。

### 步骤1：主题研究

**Prompt：**
```
创建内容规划工具。

功能：
1. 输入：主题关键词（如"Python性能优化"）
2. 使用Claude生成：相关子主题、目标读者、关键要点
3. 输出：内容大纲

请提供代码。
```

### 步骤2：内容生成

**Prompt：**
```
实现内容生成。

流程：
1. 基于大纲，逐节生成内容
2. 使用Few-shot示例确保风格一致
3. 添加代码示例和图表描述
4. 生成元数据（标题、摘要、标签）

请提供代码。
```

### 步骤3：SEO优化

**Prompt：**
```
增强内容生成工具，添加SEO优化。

功能：
1. 生成SEO友好的标题（H1, H2）
2. 提取关键词
3. 生成meta description
4. 检查可读性分数
5. 建议内部链接

请提供代码。
```

### 项目总结

**学到的技能：**
- ✅ 内容生成pipeline
- ✅ SEO优化
- ✅ 自动化工作流

---

## 最佳实践总结

### 1. 任务分解 🪜

**不好**：
```
构建一个完整的Web应用
```

**好**：
```
步骤1：初始化Flask项目
步骤2：创建数据模型
步骤3：实现CRUD API
步骤4：添加认证
步骤5：部署

请执行步骤1。
```

### 2. 迭代验证 🔍

每完成一步，立即测试：
```bash
# 运行代码
python app.py

# 测试API
curl <http://localhost:5000/health>

# 运行测试
pytest
```

### 3. 清晰的错误消息 ❌

告诉Claude具体错误：
```
执行时报错：

```
Traceback (most recent call last):
  File "app.py", line 10, in <module>
    from flask_cors import CORS
ModuleNotFoundError: No module named 'flask_cors'
```

请修复。
```

### 4. 版本控制 📦

每完成一个功能，提交Git：
```bash
git add .
git commit -m "feat: 添加任务创建API"
git push
```

---

## 下一步

完成这些项目后，你应该能够：
- ✅ 使用Claude Code构建实际应用
- ✅ 集成Claude API到工作流
- ✅ 实现自动化和AI增强功能

**继续学习：**
- Claude API高级主题
- 多Agent系统
- 生产部署和监控
